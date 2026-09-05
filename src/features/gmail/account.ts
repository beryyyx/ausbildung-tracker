import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { GMAIL_ACCOUNT_ID, gmailAccount, gmailMessages } from "@/db/schema";

import { getGmailEnv } from "./env";
import { refreshAccessToken, revokeToken } from "./oauth";
import { getGmailAccount } from "./queries";
import { GmailError, type TokenSet } from "./types";

/**
 * Запись и обслуживание подключённого аккаунта: сохранение после OAuth,
 * обновление access_token, отключение. Сюда ходят и route handlers,
 * и Server Actions, поэтому это не actions.ts.
 */

/** За сколько до истечения access_token обновляем его заранее. */
const REFRESH_MARGIN_MS = 60_000;

/** Сохраняет токены после согласия. Повторное подключение перезаписывает строку и снимает флаг «истекло». */
export async function saveAccount(
  email: string,
  tokens: TokenSet & { refreshToken: string },
): Promise<void> {
  const values = {
    email,
    refreshToken: tokens.refreshToken,
    accessToken: tokens.accessToken,
    accessTokenExpiresAt: tokens.expiresAt,
    reconnectRequired: false,
  };

  await db
    .insert(gmailAccount)
    .values({ id: GMAIL_ACCOUNT_ID, ...values })
    .onConflictDoUpdate({ target: gmailAccount.id, set: values });
}

/**
 * Отключение: строка с токенами и необработанные предложения удаляются,
 * обработанные остаются как история, чтобы после переподключения не всплыть снова.
 * Токен по возможности отзывается у Google.
 */
export async function deleteAccount(): Promise<void> {
  const account = await getGmailAccount();
  if (!account) return;

  await db.delete(gmailMessages).where(eq(gmailMessages.state, "pending"));
  await db.delete(gmailAccount).where(eq(gmailAccount.id, GMAIL_ACCOUNT_ID));

  // Отзыв refresh_token отзывает и выданные по нему access_token.
  await revokeToken(account.refreshToken);
}

/**
 * Действующий access_token. Обновляется за минуту до истечения или принудительно.
 * При invalid_grant ставит флаг «истекло» и бросает GmailError("reconnect-required").
 */
export async function getValidAccessToken(options?: { force?: boolean }): Promise<string> {
  const env = getGmailEnv();
  if (!env) throw new GmailError("not-configured", "Переменные Google не заданы");

  const account = await getGmailAccount();
  if (!account) throw new GmailError("not-connected", "Gmail не подключён");
  if (account.reconnectRequired) {
    throw new GmailError("reconnect-required", "Подключение истекло");
  }

  const remainingMs = account.accessTokenExpiresAt.getTime() - Date.now();
  if (!options?.force && remainingMs > REFRESH_MARGIN_MS) return account.accessToken;

  try {
    const tokens = await refreshAccessToken(env, account.refreshToken);
    await db
      .update(gmailAccount)
      .set({ accessToken: tokens.accessToken, accessTokenExpiresAt: tokens.expiresAt })
      .where(eq(gmailAccount.id, GMAIL_ACCOUNT_ID));
    return tokens.accessToken;
  } catch (error) {
    if (error instanceof GmailError && error.kind === "reconnect-required") {
      await db
        .update(gmailAccount)
        .set({ reconnectRequired: true })
        .where(eq(gmailAccount.id, GMAIL_ACCOUNT_ID));
    }
    throw error;
  }
}

/** Вызов Gmail с токеном. На 401 токен обновляется принудительно и вызов повторяется один раз. */
export async function withAccessToken<T>(
  call: (accessToken: string) => Promise<T>,
): Promise<T> {
  const accessToken = await getValidAccessToken();
  try {
    return await call(accessToken);
  } catch (error) {
    if (error instanceof GmailError && error.status === 401) {
      return await call(await getValidAccessToken({ force: true }));
    }
    throw error;
  }
}
