"use server";

import { cookies } from "next/headers";

import { SETTING_KEYS, settingsSchema } from "./settings";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Записывает нажатую кнопку меню в cookie. После записи Next сам перерисовывает
 * страницу вместе с layout, и <html> получает новые атрибуты.
 */
export async function updateSettings(formData: FormData): Promise<void> {
  const raw = Object.fromEntries(
    SETTING_KEYS.map((key) => [key, formData.get(key) ?? undefined]),
  );
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return;

  const store = await cookies();
  for (const key of SETTING_KEYS) {
    const value = parsed.data[key];
    if (value) store.set(key, value, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  }
}
