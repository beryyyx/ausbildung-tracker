import "server-only";

import { searchArbeitsagentur } from "./arbeitsagentur";
import { findApplicationIdsByRefnr } from "./queries";
import {
  JobSourceError,
  type JobListing,
  type JobSearchQuery,
  type JobSourceErrorKind,
} from "./types";

/**
 * Сколько вакансий забираем у источника за один поиск. Источник не умеет
 * фильтровать по дате старта, поэтому фильтр, сортировка и страницы делаются у нас.
 */
const FETCH_LIMIT = 300;
/** Размер страницы источника. Arbeitsagentur отдаёт до 100 за запрос. */
const SOURCE_PAGE_SIZE = 100;
/** Сколько держим выдачу источника в памяти, чтобы листание страниц не дёргало API. */
const CACHE_TTL_MS = 5 * 60_000;
const CACHE_MAX_ENTRIES = 20;

type SourceBatch = {
  listings: JobListing[];
  /** Сколько всего нашёл источник, включая не забранное. */
  sourceTotal: number;
  resolvedLocation: string | null;
};

/** Страница результатов после фильтра и сортировки. */
export type SearchPage = {
  listings: JobListing[];
  page: number;
  totalPages: number;
  sourceTotal: number;
  /** Сколько вакансий реально забрали у источника, не больше FETCH_LIMIT. */
  fetched: number;
  /** Сколько вакансий с датой старта прошли фильтр. */
  matching: number;
  /** Сколько вакансий без даты старта, они идут в конце списка. */
  undated: number;
  resolvedLocation: string | null;
};

export type SearchOutcome =
  | {
      ok: true;
      result: SearchPage;
      /** refnr → id заявки для вакансий текущей страницы, которые уже импортированы. */
      existing: Map<string, number>;
    }
  | { ok: false; kind: JobSourceErrorKind | "unknown" };

const cache = new Map<string, { expiresAt: number; batch: SourceBatch }>();

/** Первая страница даёт общее число, остальные страницы до лимита забираются параллельно. */
async function fetchBatch(query: JobSearchQuery): Promise<SourceBatch> {
  const key = JSON.stringify([query.what, query.where, query.radiusKm]);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.batch;

  const base = {
    what: query.what,
    where: query.where,
    radiusKm: query.radiusKm,
    pageSize: SOURCE_PAGE_SIZE,
  };
  const firstPage = await searchArbeitsagentur({ ...base, page: 1 });
  const pagesNeeded = Math.min(
    Math.ceil(firstPage.total / SOURCE_PAGE_SIZE),
    FETCH_LIMIT / SOURCE_PAGE_SIZE,
  );
  const otherPages = await Promise.all(
    Array.from({ length: Math.max(0, pagesNeeded - 1) }, (_, index) =>
      searchArbeitsagentur({ ...base, page: index + 2 }),
    ),
  );

  // Страницы источника могут сдвигаться между запросами, поэтому убираем повторы.
  const seen = new Set<string>();
  const listings: JobListing[] = [];
  for (const result of [firstPage, ...otherPages]) {
    for (const listing of result.listings) {
      if (seen.has(listing.refnr)) continue;
      seen.add(listing.refnr);
      listings.push(listing);
    }
  }

  const batch: SourceBatch = {
    listings,
    sourceTotal: firstPage.total,
    resolvedLocation: firstPage.resolvedLocation,
  };

  // ponytail: при переполнении сбрасываем весь кэш, один пользователь редко ходит по 20 запросам сразу.
  if (cache.size >= CACHE_MAX_ENTRIES) cache.clear();
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, batch });

  return batch;
}

/** Сначала по дате старта, при равной дате ближе по расстоянию выше. */
function byStartDateThenDistance(a: JobListing, b: JobListing): number {
  const dateOrder = (a.startDate ?? "").localeCompare(b.startDate ?? "");
  if (dateOrder !== 0) return dateOrder;
  const distanceA = a.distanceKm ?? Number.MAX_SAFE_INTEGER;
  const distanceB = b.distanceKm ?? Number.MAX_SAFE_INTEGER;
  return distanceA - distanceB;
}

/**
 * Отбор по дате старта. Старт раньше границы выпадает, верхней границы нет.
 * Вакансии без даты не выбрасываем: они идут отдельно, в конец списка.
 */
function selectByStart(listings: JobListing[], startFrom: string | null) {
  const sorted = [...listings].sort(byStartDateThenDistance);
  return {
    dated: sorted.filter(
      (listing) =>
        listing.startDate !== null && (startFrom === null || listing.startDate >= startFrom),
    ),
    undated: sorted.filter((listing) => listing.startDate === null),
  };
}

/** Выполняет поиск, применяет фильтр по дате и помечает уже импортированные вакансии. Ошибки не бросает. */
export async function runJobSearch(query: JobSearchQuery): Promise<SearchOutcome> {
  try {
    const batch = await fetchBatch(query);
    const { dated, undated } = selectByStart(batch.listings, query.startFrom);
    const ordered = [...dated, ...undated];

    const totalPages = Math.max(1, Math.ceil(ordered.length / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const listings = ordered.slice(
      (page - 1) * query.pageSize,
      page * query.pageSize,
    );

    const existing = await findApplicationIdsByRefnr(
      listings.map((listing) => listing.refnr),
    );

    return {
      ok: true,
      result: {
        listings,
        page,
        totalPages,
        sourceTotal: batch.sourceTotal,
        fetched: batch.listings.length,
        matching: dated.length,
        undated: undated.length,
        resolvedLocation: batch.resolvedLocation,
      },
      existing,
    };
  } catch (error) {
    console.error("[jobsearch]", error);
    return {
      ok: false,
      kind: error instanceof JobSourceError ? error.kind : "unknown",
    };
  }
}
