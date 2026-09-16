import { z } from "zod";

/**
 * Настройки оформления. Хранятся в cookie, чтобы layout.tsx прочитал их на
 * сервере и отдал страницу сразу в нужной теме, без вспышки светлой темы.
 * Значения попадают атрибутами data-theme, data-accent, data-density на <html>,
 * сами цвета и отступы описаны в src/app/globals.css.
 */

export const THEMES = ["system", "light", "dark"] as const;
export const ACCENTS = ["blue", "green", "violet", "orange", "pink"] as const;
export const DENSITIES = ["normal", "compact"] as const;

export type Theme = (typeof THEMES)[number];
export type Accent = (typeof ACCENTS)[number];
export type Density = (typeof DENSITIES)[number];

export type UiSettings = {
  theme: Theme;
  accent: Accent;
  density: Density;
};

export const DEFAULT_SETTINGS: UiSettings = {
  theme: "system",
  accent: "blue",
  density: "normal",
};

/** Имена cookie совпадают с ключами настроек. */
export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof UiSettings)[];

/** Одна кнопка меню отправляет одно поле; остальные не приходят вовсе. */
export const settingsSchema = z.object({
  theme: z.enum(THEMES).optional(),
  accent: z.enum(ACCENTS).optional(),
  density: z.enum(DENSITIES).optional(),
});
