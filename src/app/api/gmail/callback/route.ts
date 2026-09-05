import { NextResponse, type NextRequest } from "next/server";

import { saveAccount } from "@/features/gmail/account";
import { fetchProfile } from "@/features/gmail/client";
import { getGmailEnv } from "@/features/gmail/env";
import type { CallbackErrorCode } from "@/features/gmail/labels";
import {
  OAUTH_COOKIE_PATH,
  OAUTH_STATE_COOKIE,
  exchangeCode,
} from "@/features/gmail/oauth";
import { GmailError, type TokenSet } from "@/features/gmail/types";

export const dynamic = "force-dynamic";

const GMAIL_PATH = "/gmail";

/**
 * Возврат с экрана согласия Google: проверка `state`, обмен кода на токены,
 * запрос адреса ящика, сохранение и редирект на /gmail. Любая ошибка —
 * редирект туда же с кодом в адресе, страница покажет понятный текст.
 */
export async function GET(request: NextRequest) {
  const env = getGmailEnv();
  if (!env) return redirectToPage(request, "not-configured");

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return redirectToPage(request, "denied");

  const code = params.get("code");
  if (!code) return redirectToPage(request, "missing-code");

  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!expectedState || params.get("state") !== expectedState) {
    return redirectToPage(request, "state");
  }

  let tokens: TokenSet;
  let email: string;
  try {
    tokens = await exchangeCode(env, code);
    email = (await fetchProfile(tokens.accessToken)).email;
  } catch (error) {
    const kind = error instanceof GmailError ? error.kind : "unknown";
    console.error(`[gmail] callback failed: ${kind}`);
    return redirectToPage(request, kind === "invalid-client" ? "invalid-client" : "exchange");
  }

  // Без refresh_token нечем обновлять доступ. Обычно так бывает, если согласие уже
  // давали раньше без prompt=consent: тогда доступ нужно отозвать и подключить заново.
  if (!tokens.refreshToken) return redirectToPage(request, "no-refresh-token");

  await saveAccount(email, { ...tokens, refreshToken: tokens.refreshToken });
  return redirectToPage(request);
}

/** Редирект на /gmail (с кодом ошибки или без) и очистка cookie со `state`. */
function redirectToPage(request: NextRequest, errorCode?: CallbackErrorCode) {
  const url = new URL(GMAIL_PATH, request.url);
  if (errorCode) url.searchParams.set("error", errorCode);

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, "", { path: OAUTH_COOKIE_PATH, maxAge: 0 });
  return response;
}
