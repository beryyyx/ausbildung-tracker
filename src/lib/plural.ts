/**
 * Русское склонение по числу: pluralize(3, ["заявка", "заявки", "заявок"]) → "заявки".
 * Формы: одна, две-четыре, пять и больше.
 */
export function pluralize(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const abs = Math.abs(count) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}
