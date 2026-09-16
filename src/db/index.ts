import "server-only";

import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

const DB_FILE = process.env.DB_FILE_NAME ?? "data/app.db";
const MIGRATIONS_FOLDER = path.resolve(process.cwd(), "drizzle");

function createDb() {
  const file = path.resolve(/*turbopackIgnore: true*/ process.cwd(), DB_FILE);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });

  // Локальное однопользовательское приложение: миграции применяются
  // автоматически при старте, чтобы `npm run dev` работал без лишних команд.
  // Уже применённые миграции пропускаются.
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  return db;
}

// В режиме разработки Next.js перезагружает модули при каждом изменении файлов.
// Соединение кэшируется в globalThis, чтобы не открывать файл БД заново.
const globalForDb = globalThis as unknown as {
  __db?: ReturnType<typeof createDb>;
};

export const db = globalForDb.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__db = db;
}
