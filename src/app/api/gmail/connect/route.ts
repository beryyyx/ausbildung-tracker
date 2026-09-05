import { NextResponse, type NextRequest } from "next/server";

import { getGmailEnv } from "@/features/gmail/env";
import {
  OAUTH_COOKIE_PATH,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE,
  buildConsentUrl,
} from "@/features/gmail/oauth";

export const dynamic = "force-dynamic";

/**
 * Начало подключения: случайный `state` в cookie и редирект на экран согласия Google.
 * Google вернёт пользователя на /api/gmail/callback с тем же `state`.
 */
export async function GET(request: NextRequest) {
  const env = getGmailEnv();
  if (!env) {
    return NextResponse.redirect(new URL("/gmail?error=not-configured", request.url));
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(buildConsentUrl(env, state));
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    path: OAUTH_COOKIE_PATH,
    maxAge: OAUTH_STATE_MAX_AGE,
  });
  return response;
}
