import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Статусы заявки. Единственный источник правды: отсюда берутся
 * тип TypeScript, допустимые значения колонки и CHECK-ограничение в БД.
 * Ключи английские, русские подписи для интерфейса живут в UI-слое.
 */
export const APPLICATION_STATUSES = [
  "draft", // черновик
  "sent", // отправлено
  "invitation", // приглашение на собеседование
  "rejected", // отказ
  "offer", // оффер
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/**
 * Порядок статусов: заявка движется только вперёд. Отказ и оффер — конечные,
 * на одном уровне, между ними переход возможен в обе стороны (оффер отозван,
 * отказ пересмотрен). Автоматика (предложения из Gmail) не понижает статус;
 * ручной выбор в списке заявок этим правилом не ограничен.
 */
export const STATUS_RANK: Record<ApplicationStatus, number> = {
  draft: 0,
  sent: 1,
  invitation: 2,
  rejected: 3,
  offer: 3,
};

/**
 * Источники вакансий для импорта. Без CHECK в БД: список будет расти,
 * а миграция ради каждого нового источника не нужна.
 * Реализации живут в src/features/jobsearch/sources/.
 */
export const APPLICATION_SOURCES = ["arbeitsagentur"] as const;

export type ApplicationSource = (typeof APPLICATION_SOURCES)[number];

export const applications = sqliteTable(
  "applications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),

    company: text("company").notNull(),
    /** Ausbildungsberuf, например "Fachinformatiker für Anwendungsentwicklung". */
    position: text("position").notNull(),
    city: text("city"),
    /** Ссылка на объявление о вакансии. */
    url: text("url"),

    /** Дата отправки заявки. Календарная дата в формате YYYY-MM-DD, у черновика пусто. */
    appliedAt: text("applied_at"),
    status: text("status", { enum: APPLICATION_STATUSES })
      .notNull()
      .default("draft"),
    /** Дедлайн подачи. Календарная дата в формате YYYY-MM-DD. */
    deadline: text("deadline"),
    notes: text("notes"),
    /** Время в пути в одну сторону, минуты. Пока проставляется вручную. */
    commuteMinutes: integer("commute_minutes"),

    /** Откуда импортирована заявка. null — создана вручную. */
    source: text("source", { enum: APPLICATION_SOURCES }),
    /**
     * Номер вакансии в источнике (Arbeitsagentur: referenznummer).
     * Уникален, чтобы одну вакансию нельзя было импортировать дважды.
     */
    refnr: text("refnr").unique("applications_refnr_unique"),

    /** Момент создания записи, unix timestamp. Ставится базой. */
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    /** Момент последнего изменения. Drizzle обновляет при каждом update(). */
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      "applications_status_check",
      sql`${table.status} IN (${sql.raw(
        APPLICATION_STATUSES.map((s) => `'${s}'`).join(", "),
      )})`,
    ),
  ],
);

/** Строка, прочитанная из БД. */
export type Application = typeof applications.$inferSelect;
/** Данные для вставки: необязательные поля можно не передавать. */
export type NewApplication = typeof applications.$inferInsert;
