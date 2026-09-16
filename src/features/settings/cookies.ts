import "server-only";

import { cookies } from "next/headers";

import { DEFAULT_SETTINGS, SETTING_KEYS, settingsSchema, type UiSettings } from "./settings";

/** Настройки из cookie. Каждое значение проверяется отдельно: испорченная cookie сбрасывает только себя. */
export async function readSettings(): Promise<UiSettings> {
  const store = await cookies();
  const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const key of SETTING_KEYS) {
    const parsed = settingsSchema.shape[key].safeParse(store.get(key)?.value);
    if (parsed.success && parsed.data) settings[key] = parsed.data;
  }
  return settings as UiSettings;
}
