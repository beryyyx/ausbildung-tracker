/** Сегодняшняя дата в формате YYYY-MM-DD по локальному времени машины. */
export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** YYYY-MM-DD → DD.MM.YYYY. Для пустого значения возвращает пустую строку. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}.${month}.${year}`;
}

/** Момент времени в виде "05.09.2026, 14:30" по локальному времени. */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Сколько дней от сегодня до даты. Отрицательное число, если дата уже прошла. */
export function daysFromToday(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  const [todayYear, todayMonth, todayDay] = todayIso().split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const today = Date.UTC(todayYear, todayMonth - 1, todayDay);
  return Math.round((target - today) / 86_400_000);
}
