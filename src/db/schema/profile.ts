import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  check,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * Модуль «Профиль»: данные ученика для будущей генерации Anschreiben.
 * Профиль один, без аутентификации: в таблице `profile` всегда одна строка с id = 1.
 * Списки (Zeugnis, оценки, языки, практики, файлы) живут в своих таблицах.
 * Внешнего ключа на профиль у них нет: профиль единственный, ссылаться не на что.
 */

/** Schulabschluss по списку NRW. Ключи английские, подписи в UI-слое. */
export const SCHOOL_DEGREES = [
  "hauptschulabschluss",
  "mittlerer_schulabschluss", // Fachoberschulreife (FOR)
  "for_mit_qualifikation", // FOR mit Qualifikationsvermerk (FORQ)
  "fachhochschulreife",
  "abitur",
] as const;

export type SchoolDegree = (typeof SCHOOL_DEGREES)[number];

/**
 * Два слота Zeugnis: последний и предпоследний. Именно их обычно
 * прикладывают к заявке. Слоты фиксированные, при новом Zeugnis оценки
 * переносятся руками.
 */
export const ZEUGNIS_SLOTS = ["latest", "previous"] as const;

export type ZeugnisSlot = (typeof ZEUGNIS_SLOTS)[number];

/**
 * Шкала оценок в Zeugnis. Сейчас только Sek I (оценки 1–6).
 * Со второго полугодия EF или с Q1 появятся баллы 0–15: тогда сюда
 * добавится вторая шкала, а данные переносить не придётся.
 */
export const ZEUGNIS_SCALES = ["sek1"] as const;

export type ZeugnisScale = (typeof ZEUGNIS_SCALES)[number];

/** Уровни языка по шкале CEFR плюс родной язык. */
export const LANGUAGE_LEVELS = [
  "a1",
  "a2",
  "b1",
  "b2",
  "c1",
  "c2",
  "native",
] as const;

export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

/** Единственный допустимый id строки профиля. */
export const PROFILE_ID = 1;

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

export const profile = sqliteTable(
  "profile",
  {
    id: integer("id").primaryKey(),

    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    /** Дата рождения. Календарная дата в формате YYYY-MM-DD. */
    birthDate: text("birth_date"),
    /** Улица и номер дома. В Anschreiben улица и «PLZ Ort» идут отдельными строками. */
    street: text("street"),
    postalCode: text("postal_code"),
    city: text("city"),
    phone: text("phone"),
    email: text("email"),

    schoolName: text("school_name"),
    schoolDegree: text("school_degree", { enum: SCHOOL_DEGREES }),
    /** Год окончания школы (ожидаемый). */
    graduationYear: integer("graduation_year"),

    ...timestamps,
  },
  (table) => [
    check(
      "profile_singleton_check",
      sql`${table.id} = ${sql.raw(String(PROFILE_ID))}`,
    ),
    enumCheck("profile_school_degree_check", table.schoolDegree, SCHOOL_DEGREES),
  ],
);

export const profileZeugnisse = sqliteTable(
  "profile_zeugnisse",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Какой это Zeugnis: последний или предпоследний. У каждого слота одна строка. */
    slot: text("slot", { enum: ZEUGNIS_SLOTS })
      .notNull()
      .unique("profile_zeugnisse_slot_unique"),
    /** Подпись для себя, например «Klasse 10, Abschlusszeugnis 2026». */
    title: text("title"),
    scale: text("scale", { enum: ZEUGNIS_SCALES }).notNull().default("sek1"),

    ...timestamps,
  },
  (table) => [
    enumCheck("profile_zeugnisse_slot_check", table.slot, ZEUGNIS_SLOTS),
    enumCheck("profile_zeugnisse_scale_check", table.scale, ZEUGNIS_SCALES),
  ],
);

export const profileGrades = sqliteTable(
  "profile_grades",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    zeugnisId: integer("zeugnis_id")
      .notNull()
      .references(() => profileZeugnisse.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    /**
     * Оценка. Для шкалы sek1 это 1–6, проверяется Zod-схемой.
     * CHECK в БД заранее покрывает и будущие баллы 0–15.
     */
    grade: integer("grade").notNull(),

    ...timestamps,
  },
  (table) => [
    check("profile_grades_grade_check", sql`${table.grade} BETWEEN 0 AND 15`),
  ],
);

export const profileLanguages = sqliteTable(
  "profile_languages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    language: text("language").notNull(),
    level: text("level", { enum: LANGUAGE_LEVELS }).notNull(),

    ...timestamps,
  },
  (table) => [
    enumCheck("profile_languages_level_check", table.level, LANGUAGE_LEVELS),
  ],
);

/** Schülerpraktikum и другие практики: о них спрашивают почти всегда. */
export const profileInternships = sqliteTable("profile_internships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  /** Сфера деятельности или отдел, например «IT-Abteilung». */
  field: text("field"),
  /** Календарные даты в формате YYYY-MM-DD. */
  startDate: text("start_date"),
  endDate: text("end_date"),
  description: text("description"),

  ...timestamps,
});

/**
 * Загруженные PDF (свидетельства). Сами файлы лежат в папке uploads/ вне git,
 * в базе только исходное имя и имя файла внутри папки.
 */
export const profileFiles = sqliteTable("profile_files", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Имя файла, каким его загрузил пользователь. Показывается в списке. */
  fileName: text("file_name").notNull(),
  /** Имя файла внутри uploads/, генерируется сервером. Уникально. */
  storedName: text("stored_name").notNull().unique("profile_files_stored_name_unique"),
  sizeBytes: integer("size_bytes").notNull(),

  ...timestamps,
});

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;
export type Zeugnis = typeof profileZeugnisse.$inferSelect;
export type Grade = typeof profileGrades.$inferSelect;
export type NewGrade = typeof profileGrades.$inferInsert;
export type Language = typeof profileLanguages.$inferSelect;
export type NewLanguage = typeof profileLanguages.$inferInsert;
export type Internship = typeof profileInternships.$inferSelect;
export type NewInternship = typeof profileInternships.$inferInsert;
export type ProfileFile = typeof profileFiles.$inferSelect;
export type NewProfileFile = typeof profileFiles.$inferInsert;
