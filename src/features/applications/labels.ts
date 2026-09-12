import type { ApplicationSource, ApplicationStatus } from "@/db/schema";

/** Русские подписи статусов. Типизация не даст забыть новый статус. */
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Черновик",
  sent: "Отправлено",
  invitation: "Приглашение",
  rejected: "Отказ",
  offer: "Оффер",
};

/** Цвета метки статуса, классы Tailwind. */
export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  draft: "border-zinc-200 bg-zinc-100 text-zinc-700",
  sent: "border-blue-200 bg-blue-50 text-blue-700",
  invitation: "border-amber-200 bg-amber-50 text-amber-800",
  rejected: "border-red-200 bg-red-50 text-red-700",
  offer: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const FIELD_LABELS = {
  company: "Компания",
  position: "Профессия (Ausbildungsberuf)",
  city: "Город",
  url: "Ссылка на объявление",
  appliedAt: "Дата отправки",
  status: "Статус",
  deadline: "Дедлайн подачи",
  notes: "Заметки",
  commuteMinutes: "Время в пути, мин (в одну сторону)",
} as const;

/** Названия источников импорта для интерфейса. */
export const SOURCE_LABELS: Record<ApplicationSource, string> = {
  arbeitsagentur: "Arbeitsagentur",
};

/** Тексты списка заявок: панель фильтров и пустые состояния. */
export const LIST_LABELS = {
  statusFilter: "Статус",
  search: "Поиск",
  searchPlaceholder: "Компания, профессия или город",
  apply: "Показать",
  reset: "Сбросить",
  shown: "показано",
  of: "из",
  nothingFoundTitle: "Ничего не найдено",
  nothingFoundHint: "Под выбранные статусы и текст поиска не подходит ни одна заявка.",
} as const;
