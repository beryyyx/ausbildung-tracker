import "server-only";

import { z } from "zod";

import { GmailError, type MessageMetadata } from "./types";

/**
 * Запросы к Gmail REST API. Только GET: список писем, заголовки письма, адрес ящика.
 * Ничего не отправляется, не помечается и не удаляется.
 */

const API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";
const TIMEOUT_MS = 15_000;
/** Максимум, который Gmail отдаёт за одну страницу списка. */
const LIST_PAGE_SIZE = 500;
/** Сколько запросов заголовков идёт одновременно. Лимит Gmail — 50 таких запросов в секунду. */
const METADATA_CONCURRENCY = 8;

const profileSchema = z.object({ emailAddress: z.string().min(1) });

const listSchema = z.object({
  messages: z.array(z.object({ id: z.string().min(1) })).optional(),
  nextPageToken: z.string().optional(),
});

const messageSchema = z.object({
  id: z.string().min(1),
  snippet: z.string().optional(),
  /** Момент получения в миллисекундах, строкой. */
  internalDate: z.string().regex(/^\d+$/),
  payload: z
    .object({
      headers: z
        .array(z.object({ name: z.string(), value: z.string() }))
        .optional(),
    })
    .optional(),
});

async function getJson(url: URL, accessToken: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new GmailError("timeout", "Gmail не ответил вовремя");
    }
    throw new GmailError("network", "Нет соединения с Gmail");
  }

  if (!response.ok) {
    // Тело ошибки не читаем: в нём нет ничего нужного, а статуса достаточно.
    throw new GmailError("http", `Gmail ответил ${response.status}`, response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new GmailError("invalid-response", "Gmail вернул не JSON");
  }
}

/** Адрес подключённого ящика. Запрашивается один раз при подключении. */
export async function fetchProfile(accessToken: string): Promise<{ email: string }> {
  const json = await getJson(new URL(`${API_BASE}/profile`), accessToken);
  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    throw new GmailError("invalid-response", "Неожиданный формат профиля Gmail");
  }
  return { email: parsed.data.emailAddress };
}

/**
 * id писем по поисковому запросу Gmail, свежие первыми. Забирает страницами,
 * пока не наберёт `limit`. Возвращает и флаг, что писем было больше лимита.
 */
export async function listMessageIds(
  accessToken: string,
  query: string,
  limit: number,
): Promise<{ ids: string[]; truncated: boolean }> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  while (ids.length < limit) {
    const url = new URL(`${API_BASE}/messages`);
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", String(Math.min(LIST_PAGE_SIZE, limit - ids.length)));
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const parsed = listSchema.safeParse(await getJson(url, accessToken));
    if (!parsed.success) {
      throw new GmailError("invalid-response", "Неожиданный формат списка писем Gmail");
    }

    for (const message of parsed.data.messages ?? []) ids.push(message.id);

    pageToken = parsed.data.nextPageToken;
    if (!pageToken) return { ids, truncated: false };
  }

  return { ids, truncated: true };
}

function headerValue(
  headers: { name: string; value: string }[] | undefined,
  name: string,
): string {
  const lower = name.toLowerCase();
  return headers?.find((header) => header.name.toLowerCase() === lower)?.value ?? "";
}

/** Gmail экранирует snippet как HTML: возвращаем обычный текст для поиска ключевых слов. */
function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Заголовки From и Subject плюс snippet одного письма. Формат metadata:
 * тело письма Gmail не отдаёт, и мы его не запрашиваем.
 */
export async function fetchMessageMetadata(
  accessToken: string,
  id: string,
): Promise<MessageMetadata> {
  const url = new URL(`${API_BASE}/messages/${encodeURIComponent(id)}`);
  url.searchParams.set("format", "metadata");
  url.searchParams.append("metadataHeaders", "From");
  url.searchParams.append("metadataHeaders", "Subject");

  const parsed = messageSchema.safeParse(await getJson(url, accessToken));
  if (!parsed.success) {
    throw new GmailError("invalid-response", "Неожиданный формат письма Gmail");
  }

  const headers = parsed.data.payload?.headers;
  return {
    id: parsed.data.id,
    from: headerValue(headers, "From"),
    subject: headerValue(headers, "Subject"),
    snippet: decodeEntities(parsed.data.snippet ?? ""),
    receivedAt: new Date(Number(parsed.data.internalDate)),
  };
}

/** Заголовки многих писем с ограниченным числом одновременных запросов. */
export async function fetchManyMetadata(
  accessToken: string,
  ids: string[],
): Promise<MessageMetadata[]> {
  const results: MessageMetadata[] = new Array(ids.length);
  let next = 0;

  const worker = async () => {
    while (next < ids.length) {
      const index = next++;
      results[index] = await fetchMessageMetadata(accessToken, ids[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(METADATA_CONCURRENCY, ids.length) }, worker),
  );
  return results;
}
