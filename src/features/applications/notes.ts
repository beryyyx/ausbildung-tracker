import { formatDateTime } from "@/lib/dates";

/**
 * Датированные строки в заметках заявки. Их дописывают автоматические источники
 * (сейчас Gmail), формат: `05.09.2026, 14:30 · текст`. Ручные заметки без такого
 * префикса никогда не переставляются; датированные держатся в хронологическом
 * порядке независимо от того, в каком порядке их добавили.
 */

/**
 * Признак датированной строки: дата, время, разделитель-точка. `\s` терпит
 * и неразрывные пробелы, которые форматирование дат может подставить вместо обычных.
 * Строка вроде «05.09.2026 позвонить» под правило не попадает: нет времени и разделителя.
 */
const DATED_LINE_PREFIX = /^(\d{2})\.(\d{2})\.(\d{4}),\s(\d{2}):(\d{2})\s·\s/;

/** Датированная строка из момента времени и текста. */
export function formatDatedNoteLine(date: Date, text: string): string {
  return `${formatDateTime(date)} · ${text}`;
}

/**
 * Ключ сортировки датированной строки: `YYYY-MM-DD HH:MM`, сравнивается как строка.
 * null для ручной заметки.
 */
export function datedNoteKey(line: string): string | null {
  const match = DATED_LINE_PREFIX.exec(line);
  if (!match) return null;
  const [, day, month, year, hours, minutes] = match;
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Вставляет датированную строку в заметки по её дате, а не в конец. Место: перед первой
 * датированной строкой с более поздней датой; если такой нет, сразу после последней
 * датированной; если датированных строк нет вовсе, в конец. При одинаковом времени новая
 * строка идёт после существующей. Ручные строки остаются на своих местах, даже если
 * стоят между датированными. Переводы строк приводятся к `\n`: textarea при отправке
 * формы может прислать `\r\n`.
 */
export function insertDatedNote(notes: string | null, line: string): string {
  if (!notes) return line;

  const lines = notes.split(/\r?\n/);
  const key = datedNoteKey(line);

  let insertAt = lines.length;
  if (key !== null) {
    const firstLater = lines.findIndex((existing) => {
      const existingKey = datedNoteKey(existing);
      return existingKey !== null && existingKey > key;
    });
    const lastDated = lines.findLastIndex((existing) => datedNoteKey(existing) !== null);
    if (firstLater !== -1) insertAt = firstLater;
    else if (lastDated !== -1) insertAt = lastDated + 1;
  }

  lines.splice(insertAt, 0, line);
  return lines.join("\n");
}
