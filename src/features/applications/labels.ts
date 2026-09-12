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
  draft: "border-neutral-edge bg-neutral-soft text-neutral",
  sent: "border-info-edge bg-info-soft text-info",
  invitation: "border-warning-edge bg-warning-soft text-warning",
  rejected: "border-danger-edge bg-danger-soft text-danger",
  offer: "border-success-edge bg-success-soft text-success",
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
