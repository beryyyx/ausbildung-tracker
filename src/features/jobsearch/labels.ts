import type { Specialization } from "./specialization";
import type { JobKind, JobSourceErrorKind } from "./types";

export const SEARCH_LABELS = {
  title: "Поиск вакансий",
  subtitle: "Источник: Arbeitsagentur, только Ausbildung. Радиус широкий, отсев по профессии и времени в пути.",
  what: "Профессия",
  where: "Город или индекс",
  radius: "Радиус",
  submit: "Искать",
  searchingAround: "Поиск вокруг",
  found: "Найдено",
  page: "Страница",
  previous: "Назад",
  next: "Дальше",
  emptyTitle: "Ничего не найдено",
  emptyHint: "Попробуйте другую профессию, больший радиус или другой город.",
  errorTitle: "Не удалось получить вакансии",
  retry: "Повторить",
  import: "В мои заявки",
  importing: "Добавляем…",
  imported: "Добавлено",
  alreadyImported: "Уже в заявках",
  open: "открыть",
  start: "Старт",
  published: "Опубликовано",
  distance: "км",
  profession: "Профессия",
} as const;

export const SOURCE_ERROR_MESSAGES: Record<JobSourceErrorKind | "unknown", string> = {
  network: "Нет соединения с сервисом Arbeitsagentur. Проверьте интернет и повторите.",
  timeout: "Сервис Arbeitsagentur не ответил за 10 секунд. Повторите позже.",
  http: "Сервис Arbeitsagentur ответил ошибкой. Возможно, он временно недоступен.",
  "invalid-response": "Сервис Arbeitsagentur вернул ответ в неожиданном формате. Возможно, API изменилось.",
  unknown: "Что-то пошло не так при поиске. Повторите попытку.",
};

export const SPECIALIZATION_LABELS: Record<Specialization, string> = {
  AE: "Anwendungsentwicklung",
  SI: "Systemintegration",
  DV: "Digitale Vernetzung",
  DPA: "Daten- und Prozessanalyse",
};

/** Цвета меток специализаций: основная и запасная цели выделены. */
export const SPECIALIZATION_STYLES: Record<Specialization, string> = {
  AE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  SI: "border-blue-200 bg-blue-50 text-blue-700",
  DV: "border-zinc-200 bg-zinc-100 text-zinc-600",
  DPA: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

export const JOB_KIND_LABELS: Record<JobKind, string> = {
  ausbildung: "Ausbildung",
  "duales-studium": "Duales Studium",
};
