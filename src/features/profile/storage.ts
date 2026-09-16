import "server-only";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Хранение загруженных PDF на диске. Папка задаётся UPLOADS_DIR в .env
 * (по умолчанию uploads/ в корне проекта) и не попадает в git.
 * Имена файлов генерирует сервер, поэтому пользовательский ввод в путь не попадает.
 */

// turbopackIgnore: иначе Turbopack при сборке пытается отследить путь и тащит
// в бандл весь проект (та же пометка стоит в src/db/index.ts).
const UPLOADS_DIR = path.resolve(
  /*turbopackIgnore: true*/ process.cwd(),
  process.env.UPLOADS_DIR ?? "uploads",
);

const PDF_SIGNATURE = Buffer.from("%PDF-", "ascii");

/** Настоящий ли это PDF: файл должен начинаться с «%PDF-». */
export function isPdf(bytes: Buffer): boolean {
  return (
    bytes.length >= PDF_SIGNATURE.length &&
    bytes.subarray(0, PDF_SIGNATURE.length).equals(PDF_SIGNATURE)
  );
}

/**
 * Абсолютный путь к файлу внутри папки загрузок. Берём только basename
 * и проверяем, что результат остался в папке: защита от «../» на всякий случай.
 */
function resolveStoredPath(storedName: string): string {
  const resolved = path.resolve(
    /*turbopackIgnore: true*/ UPLOADS_DIR,
    path.basename(storedName),
  );
  if (!resolved.startsWith(UPLOADS_DIR + path.sep)) {
    throw new Error("Недопустимое имя файла");
  }
  return resolved;
}

/** Сохраняет содержимое под случайным именем и возвращает это имя. */
export async function writeUpload(bytes: Buffer): Promise<string> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const storedName = `${randomUUID()}.pdf`;
  // flag "wx": упасть, если файл вдруг уже существует, а не перезаписать.
  await fs.writeFile(resolveStoredPath(storedName), bytes, { flag: "wx" });
  return storedName;
}

/** Читает файл целиком. null, если файла на диске уже нет. */
export async function readUpload(storedName: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(resolveStoredPath(storedName));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/** Удаляет файл. Отсутствие файла не считается ошибкой. */
export async function removeUpload(storedName: string): Promise<void> {
  try {
    await fs.unlink(resolveStoredPath(storedName));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
}
