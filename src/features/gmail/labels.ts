import type { ApplicationStatus } from "@/db/schema";
import { STATUS_LABELS } from "@/features/applications/labels";
import { formatDatedNoteLine } from "@/features/applications/notes";
import { pluralize } from "@/lib/plural";

import type { GmailErrorKind } from "./types";

export const GMAIL_TEXTS = {
  pageTitle: "Gmail",
  pageHint:
    "Письма за последние 60 дней сопоставляются с заявками по отправителю и названию компании. Статус заявки меняется только после вашего подтверждения.",

  notConfiguredTitle: "Gmail не настроен",
  notConfiguredHint:
    "В .env нет GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET или GOOGLE_REDIRECT_URI. Заполните их по шаблону .env.example и перезапустите dev-сервер.",

  connectTitle: "Gmail не подключён",
  permissionsHint:
    "Запрашивается одно право: читать письма (gmail.readonly). Приложение не отправляет письма, не меняет метки, не помечает прочитанным и ничего не удаляет. Токены доступа хранятся только в локальной базе на этом компьютере.",
  connect: "Подключить Gmail",
  reconnect: "Подключить заново",

  connectedAs: "Подключён ящик",
  connectedBadge: "Подключено",
  lastSync: "Последняя синхронизация",
  neverSynced: "ещё не было",
  expiredTitle: "Подключение истекло",
  expiredHint:
    "Google отклонил ключ доступа. Приложение в тестовом режиме, поэтому доступ живёт около недели. Подключите заново: предложения и принятые решения сохранятся.",
  sync: "Синхронизировать",
  syncing: "Синхронизируем…",
  disconnect: "Отключить",
  disconnecting: "Отключаем…",
  confirmDisconnect:
    "Отключить Gmail? Токены будут удалены из базы, ещё не обработанные предложения тоже.",

  summaryTitle: "Итог синхронизации",
  summaryListed: "Просмотрено писем за 60 дней",
  summaryExamined: "из них новых",
  summaryMatched: "совпало с заявками",
  summaryUnmatched: "не совпало ни с одной",
  summaryTruncated: "Писем больше лимита, просмотрены только самые свежие.",
  summaryNothingNew: "Новых писем нет: всё уже просмотрено раньше.",
  summaryLowMatch:
    "Совпадений мало. Если письма от компаний точно были, правила сопоставления стоит поправить.",

  suggestionsTitle: "Предложения",
  suggestionsEmptyTitle: "Предложений нет",
  suggestionsEmpty:
    "Новых предложений нет. Нажмите «Синхронизировать», чтобы проверить почту.",
  suggestionsEmptyNotConnected: "Предложения появятся после подключения и синхронизации.",
  application: "Заявка",
  status: "Статус",
  chooseApplication: "— выберите заявку —",
  chooseStatus: "— выберите статус —",
  candidatesGroup: "Подходят",
  othersGroup: "Другие заявки",
  singleCandidate: "Подошла одна заявка",
  noCandidate: "Заявка не найдена автоматически, выберите вручную",
  suggestedUnknown: "Тип письма не определён, выберите статус сами",
  suggestedPrefix: "Похоже на",
  apply: "Применить",
  applying: "Применяем…",
  note: "Учесть без смены статуса",
  notRelated: "Не про заявку",
  dismissing: "Убираем…",
  applyError: "Не удалось применить. Обновите страницу и попробуйте снова.",
  noteError: "Не удалось учесть письмо. Обновите страницу и попробуйте снова.",
  noteTooLong:
    "В заметках заявки не осталось места для новой строки. Сократите их и повторите.",
  dismissError: "Не удалось убрать письмо. Обновите страницу и попробуйте снова.",
  from: "От",
  /** Начало строки, которая дописывается в заметки заявки при «Учесть без смены статуса». */
  noteFrom: "Письмо от",
  noSubject: "(без темы)",
  openApplication: "открыть выбранную заявку",
} as const;

type SenderFields = { fromAddress: string; fromName: string | null };

/** Отправитель как в почтовом клиенте: `Имя <адрес>` или просто адрес. */
export function formatSender(message: SenderFields): string {
  return message.fromName
    ? `${message.fromName} <${message.fromAddress}>`
    : message.fromAddress;
}

/**
 * Строка для заметок заявки при «Учесть без смены статуса»: датированная строка
 * (формат задаёт модуль заявок) с отправителем и темой. Так история переписки
 * копится в самой заявке в хронологическом порядке.
 */
export function formatNoteLine(
  message: SenderFields & { receivedAt: Date; subject: string },
): string {
  const subject = message.subject || GMAIL_TEXTS.noSubject;
  return formatDatedNoteLine(
    message.receivedAt,
    `${GMAIL_TEXTS.noteFrom} ${formatSender(message)}: ${subject}`,
  );
}

/** Ошибка «Применить», когда письмо предлагает статус ниже текущего (см. STATUS_RANK). */
export function downgradeBlockedText(
  current: ApplicationStatus,
  proposed: ApplicationStatus,
): string {
  return `Заявка уже в статусе «${STATUS_LABELS[current]}», а письмо предлагает «${STATUS_LABELS[proposed]}». Назад статус не понижается: нажмите «${GMAIL_TEXTS.note}» или измените статус вручную в списке заявок.`;
}

/** Подпись для случая нескольких подходящих заявок. Число подставляется в интерфейсе. */
export function multipleCandidatesText(count: number): string {
  const noun = pluralize(count, ["заявка", "заявки", "заявок"]);
  return `Подходят ${count} ${noun} с одной компанией, выберите нужную`;
}

/** Ошибки, с которыми Google возвращает на /gmail?error=... */
export const CALLBACK_ERROR_MESSAGES = {
  denied: "Вы не дали доступ на экране Google. Подключение не выполнено.",
  state: "Ответ Google не совпал с началом подключения. Попробуйте подключить ещё раз.",
  "missing-code": "Google не вернул код подключения. Попробуйте ещё раз.",
  exchange: "Не удалось обменять код на ключи доступа. Попробуйте ещё раз позже.",
  "invalid-client":
    "Google не принял GOOGLE_CLIENT_ID или GOOGLE_CLIENT_SECRET. Проверьте значения в .env по данным из Google Cloud Console и перезапустите dev-сервер.",
  "no-refresh-token":
    "Google не выдал долгоживущий ключ. Отзовите доступ приложения в настройках аккаунта Google и подключите заново.",
  "not-configured": "Gmail не настроен: заполните переменные Google в .env.",
  unknown: "Подключение не удалось. Попробуйте ещё раз.",
} as const;

export type CallbackErrorCode = keyof typeof CALLBACK_ERROR_MESSAGES;

export function isCallbackErrorCode(value: string): value is CallbackErrorCode {
  return value in CALLBACK_ERROR_MESSAGES;
}

export const SYNC_ERROR_MESSAGES: Record<GmailErrorKind | "unknown", string> = {
  "not-configured": "Gmail не настроен: заполните переменные Google в .env.",
  "not-connected": "Gmail не подключён.",
  "reconnect-required":
    "Подключение истекло. Подключите Gmail заново и повторите синхронизацию.",
  "invalid-client":
    "Google не принял GOOGLE_CLIENT_ID или GOOGLE_CLIENT_SECRET. Проверьте значения в .env по данным из Google Cloud Console и перезапустите dev-сервер.",
  network: "Нет соединения с Gmail. Проверьте интернет и повторите.",
  timeout: "Gmail не ответил за 15 секунд. Повторите позже.",
  http: "Gmail ответил ошибкой. Возможно, сервис временно недоступен или исчерпан лимит запросов.",
  "invalid-response": "Gmail вернул ответ в неожиданном формате. Возможно, API изменилось.",
  unknown: "Что-то пошло не так при синхронизации. Повторите попытку.",
};
