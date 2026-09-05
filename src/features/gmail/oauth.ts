import "server-only";

import { z } from "zod";

import type { GmailEnv } from "./env";
import { GmailError, type TokenSet } from "./types";

/**
 * Обмен с серверами OAuth Google без библиотеки googleapis: три запроса,
 * каждый виден целиком. Права запрашиваются только на чтение писем.
 */

export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

/** Cookie со случайным `state`: callback принимает ответ Google только с тем же значением. */
export const OAUTH_STATE_COOKIE = "gmail_oauth_state";
/** Путь cookie: браузер шлёт её только на /api/gmail/*. */
export const OAUTH_COOKIE_PATH = "/api/gmail";
/** Сколько секунд живёт cookie: столько отводится на экран согласия Google. */
export const OAUTH_STATE_MAX_AGE = 600;

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const TIMEOUT_MS = 15_000;

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
  refresh_token: z.string().min(1).optional(),
});

const errorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

/** Адрес экрана согласия. `state` защищает callback от подмены, `prompt=consent` гарантирует refresh_token. */
export function buildConsentUrl(env: GmailEnv, state: string): string {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("redirect_uri", env.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GMAIL_SCOPE);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

async function postToken(body: URLSearchParams): Promise<TokenSet> {
  let response: Response;
  try {
    response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new GmailError("timeout", "Сервер OAuth Google не ответил вовремя");
    }
    throw new GmailError("network", "Нет соединения с сервером OAuth Google");
  }

  const json: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = errorResponseSchema.safeParse(json);
    // invalid_grant: refresh_token отозван или протух (в режиме Testing — через неделю).
    if (parsed.success && parsed.data.error === "invalid_grant") {
      throw new GmailError("reconnect-required", "Google отверг refresh_token", response.status);
    }
    // invalid_client / unauthorized_client: неверные GOOGLE_CLIENT_ID или GOOGLE_CLIENT_SECRET в .env.
    if (
      parsed.success &&
      (parsed.data.error === "invalid_client" || parsed.data.error === "unauthorized_client")
    ) {
      throw new GmailError(
        "invalid-client",
        `Google не принял данные OAuth-приложения: ${parsed.data.error}`,
        response.status,
      );
    }
    throw new GmailError(
      "http",
      `Сервер OAuth Google ответил ${response.status}${parsed.success ? `: ${parsed.data.error}` : ""}`,
      response.status,
    );
  }

  const parsed = tokenResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new GmailError("invalid-response", "Неожиданный формат ответа сервера OAuth Google");
  }

  return {
    accessToken: parsed.data.access_token,
    refreshToken: parsed.data.refresh_token ?? null,
    expiresAt: new Date(Date.now() + parsed.data.expires_in * 1000),
  };
}

/** Код из callback → access_token и refresh_token. */
export async function exchangeCode(env: GmailEnv, code: string): Promise<TokenSet> {
  return await postToken(
    new URLSearchParams({
      code,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      redirect_uri: env.redirectUri,
      grant_type: "authorization_code",
    }),
  );
}

/** Новый access_token по refresh_token. При invalid_grant бросает GmailError("reconnect-required"). */
export async function refreshAccessToken(
  env: GmailEnv,
  refreshToken: string,
): Promise<TokenSet> {
  return await postToken(
    new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      grant_type: "refresh_token",
    }),
  );
}

/**
 * Отзыв токена у Google при отключении. Делается «по возможности»: если Google
 * недоступен или токен уже недействителен, отключение всё равно завершается.
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    await fetch(REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    // Осознанно игнорируем: строка с токенами всё равно удаляется из базы.
  }
}
