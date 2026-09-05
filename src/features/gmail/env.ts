import "server-only";

/** Данные OAuth-приложения Google из .env. Секрет никуда, кроме запросов к Google, не уходит. */
export type GmailEnv = {
  clientId: string;
  clientSecret: string;
  /** Должен совпадать с адресом /api/gmail/callback, зарегистрированным в Google Cloud. */
  redirectUri: string;
};

/** null, если хотя бы одна переменная не задана: страница покажет «не настроено». */
export function getGmailEnv(): GmailEnv | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}
