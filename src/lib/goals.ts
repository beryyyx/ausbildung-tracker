/**
 * Цель поиска: единственное место с датами и адресами из критериев в CLAUDE.md.
 * Отсюда берутся дефолт фильтра «Старт не раньше» и подвал с обратным отсчётом.
 * Через год поменять здесь.
 */
export const TARGET_START_YEAR = 2027;
/** Старт Ausbildung: август целевого года. */
export const TARGET_START = `${TARGET_START_YEAR}-08-01`;

/** Главная цель. Заявки принимают с октября 2026 и только на своём сайте. */
export const BOFROST_APPLY_FROM = "2026-10-01";
export const BOFROST_CAREERS_URL = "https://karriere.bofrost.de";

export const HOME_TOWN = "Straelen, 47638";
export const MAX_COMMUTE_MINUTES = 60;

/** Полных месяцев от сегодня до даты. Отрицательное число, если дата прошла. */
export function monthsFromToday(iso: string): number {
  const today = new Date();
  const [year, month] = iso.split("-").map(Number);
  return (year - today.getFullYear()) * 12 + (month - 1 - today.getMonth());
}
