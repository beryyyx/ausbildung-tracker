import type { NextRequest } from "next/server";

import { getFile } from "@/features/profile/queries";
import { readUpload } from "@/features/profile/storage";

export const dynamic = "force-dynamic";

/**
 * Отдаёт загруженный PDF по id записи. Путь к файлу берётся только из базы,
 * в адресе его нет, поэтому подставить чужой путь нельзя.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext<"/profile/files/[id]">,
) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return notFoundResponse();

  const file = await getFile(id);
  if (!file) return notFoundResponse();

  const bytes = await readUpload(file.storedName);
  if (!bytes) return notFoundResponse();

  // Имя для заголовка: ASCII-вариант для старых клиентов и полное имя в UTF-8.
  const asciiName = file.fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const utf8Name = encodeURIComponent(file.fileName);

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `inline; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`,
      "Cache-Control": "private, no-store",
    },
  });
}

function notFoundResponse(): Response {
  return new Response("Файл не найден", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
