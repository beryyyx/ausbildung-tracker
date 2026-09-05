/** Размер файла для интерфейса: «340 КБ», «2,1 МБ». */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} КБ`;
  const mb = kb / 1024;
  return `${mb.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} МБ`;
}
