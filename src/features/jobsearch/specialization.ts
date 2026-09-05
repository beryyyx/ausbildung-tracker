/** Специализации Fachinformatiker, которые можно распознать по тексту вакансии. */
export const SPECIALIZATIONS = ["AE", "SI", "DV", "DPA"] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

const PATTERNS: Record<Specialization, RegExp> = {
  AE: /anwendungsentwickl/i,
  SI: /systemintegration/i,
  DV: /digitale\s+vernetzung/i,
  DPA: /daten-?\s*und\s+prozessanalyse/i,
};

/**
 * Ищет специализации в названии и профессии вакансии.
 * Пустой массив означает, что специализация не указана.
 */
export function detectSpecializations(
  ...texts: (string | null | undefined)[]
): Specialization[] {
  const haystack = texts.filter(Boolean).join(" ");
  return SPECIALIZATIONS.filter((code) => PATTERNS[code].test(haystack));
}
