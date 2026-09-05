import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  check,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { type ApplicationStatus, applications } from "./applications";

/**
 * Модуль «Gmail»: подключение почты только для чтения. Письма за последние
 * 60 дней сопоставляются с заявками, совпавшие показываются как предложения
 * сменить статус. Статус меняется только после подтверждения пользователем.
 * Тело письма в базу не попадает: только id, отправитель, тема и дата.
 */

/** Единственный допустимый id строки подключённого аккаунта. */
export const GMAIL_ACCOUNT_ID = 1;

/**
 * Что происходит с предложением: ждёт решения, применено к заявке
 * или помечено как «не про заявку». Обработанные письма не предлагаются повторно.
 */
export const GMAIL_MESSAGE_STATES = ["pending", "applied", "dismissed"] as const;

export type GmailMessageState = (typeof GMAIL_MESSAGE_STATES)[number];

/**
 * Какой статус заявки предлагает письмо. Подмножество статусов заявки:
 * приглашение, отказ, подтверждение получения (= отправлено).
 */
export const GMAIL_SUGGESTED_STATUSES = [
  "invitation",
  "rejected",
  "sent",
] as const satisfies readonly ApplicationStatus[];

export type GmailSuggestedStatus = (typeof GMAIL_SUGGESTED_STATUSES)[number];

const timestamps = {
  /** Момент создания записи, unix timestamp. Ставится базой. */
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  /** Момент последнего изменения. Drizzle обновляет при каждом update(). */
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
};

const enumCheck = (
  name: string,
  column: AnySQLiteColumn,
  values: readonly string[],
) =>
  check(
    name,
    sql`${column} IN (${sql.raw(values.map((v) => `'${v}'`).join(", "))})`,
  );

/**
 * Подключённый аккаунт Gmail. Всегда одна строка с id = 1, как у профиля.
 * Токены лежат здесь же, в локальной базе; «Отключить» удаляет строку целиком.
 */
export const gmailAccount = sqliteTable(
  "gmail_account",
  {
    id: integer("id").primaryKey(),
    /** Адрес подключённого ящика, показывается на странице. */
    email: text("email").notNull(),
    refreshToken: text("refresh_token").notNull(),
    accessToken: text("access_token").notNull(),
    /** Когда истекает access_token. За минуту до этого он обновляется. */
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp",
    }).notNull(),
    /**
     * Google отверг refresh_token (invalid_grant). В режиме Testing это случается
     * примерно через неделю. Страница показывает «Подключение истекло».
     */
    reconnectRequired: integer("reconnect_required", { mode: "boolean" })
      .notNull()
      .default(false),

    lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
    /** Сводка последней синхронизации, чтобы видеть качество сопоставления и после перезагрузки. */
    lastSyncListed: integer("last_sync_listed"),
    lastSyncExamined: integer("last_sync_examined"),
    lastSyncMatched: integer("last_sync_matched"),

    ...timestamps,
  },
  (table) => [
    check(
      "gmail_account_singleton_check",
      sql`${table.id} = ${sql.raw(String(GMAIL_ACCOUNT_ID))}`,
    ),
  ],
);

/**
 * Письма, совпавшие хотя бы с одной заявкой. Несовпавшие не сохраняются
 * и при следующей синхронизации проверяются заново: правила сопоставления
 * могут измениться, заявки могут добавиться.
 */
export const gmailMessages = sqliteTable(
  "gmail_messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** id письма в Gmail. Уникален: одно письмо предлагается один раз. */
    messageId: text("message_id")
      .notNull()
      .unique("gmail_messages_message_id_unique"),
    fromAddress: text("from_address").notNull(),
    fromName: text("from_name"),
    subject: text("subject").notNull(),
    /** Момент получения письма по данным Gmail (internalDate). */
    receivedAt: integer("received_at", { mode: "timestamp" }).notNull(),

    /**
     * Заявка, к которой письмо применено. При синхронизации ставится, только если
     * подошла ровно одна заявка; при нескольких кандидатах остаётся пустой,
     * и выбор делает пользователь. Список кандидатов пересчитывается при показе.
     */
    applicationId: integer("application_id").references(() => applications.id, {
      onDelete: "set null",
    }),
    /** Статус, который предлагают ключевые слова письма. null — тип не определён. */
    suggestedStatus: text("suggested_status", { enum: GMAIL_SUGGESTED_STATUSES }),
    state: text("state", { enum: GMAIL_MESSAGE_STATES })
      .notNull()
      .default("pending"),

    ...timestamps,
  },
  (table) => [
    enumCheck("gmail_messages_state_check", table.state, GMAIL_MESSAGE_STATES),
    enumCheck(
      "gmail_messages_suggested_status_check",
      table.suggestedStatus,
      GMAIL_SUGGESTED_STATUSES,
    ),
  ],
);

export type GmailAccount = typeof gmailAccount.$inferSelect;
export type NewGmailAccount = typeof gmailAccount.$inferInsert;
export type GmailMessage = typeof gmailMessages.$inferSelect;
export type NewGmailMessage = typeof gmailMessages.$inferInsert;
