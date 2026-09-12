import type { Accent, Density, Theme } from "./settings";

export const SETTINGS_TEXTS = {
  menu: "Оформление",
  theme: "Тема",
  accent: "Акцент",
  density: "Плотность",
} as const;

export const THEME_LABELS: Record<Theme, string> = {
  system: "Как в системе",
  light: "Светлая",
  dark: "Тёмная",
};

export const ACCENT_LABELS: Record<Accent, string> = {
  blue: "Синий",
  green: "Зелёный",
  violet: "Фиолетовый",
  orange: "Оранжевый",
  pink: "Розовый",
};

export const DENSITY_LABELS: Record<Density, string> = {
  normal: "Обычная",
  compact: "Компактная",
};
