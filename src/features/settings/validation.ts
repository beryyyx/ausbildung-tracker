import { z } from "zod";

import { ACCENTS, DENSITIES, THEMES } from "./settings";

/** Одна кнопка меню отправляет одно поле; остальные не приходят вовсе. */
export const settingsSchema = z.object({
  theme: z.enum(THEMES).optional(),
  accent: z.enum(ACCENTS).optional(),
  density: z.enum(DENSITIES).optional(),
});
