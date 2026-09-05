import { z } from "zod";

import type { JobSearchQuery } from "./types";

/** Значения по умолчанию из критериев поиска в CLAUDE.md. */
export const DEFAULT_WHAT = "Fachinformatiker";
export const DEFAULT_WHERE = "Straelen";
export const DEFAULT_RADIUS_KM = 50;
export const RADIUS_OPTIONS = [25, 50, 75, 100] as const;
export const PAGE_SIZE = 25;

type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const schema = z.object({
  was: z.string().trim().max(100).catch(DEFAULT_WHAT),
  wo: z
    .string()
    .trim()
    .max(100)
    .catch(DEFAULT_WHERE)
    .transform((value) => value || DEFAULT_WHERE),
  umkreis: z.coerce
    .number()
    .int()
    .refine((km): km is (typeof RADIUS_OPTIONS)[number] =>
      (RADIUS_OPTIONS as readonly number[]).includes(km),
    )
    .catch(DEFAULT_RADIUS_KM),
  page: z.coerce.number().int().min(1).max(500).catch(1),
});

/** Разбирает параметры адреса /suche. Любое кривое значение заменяется значением по умолчанию. */
export function parseSearchParams(raw: RawSearchParams): JobSearchQuery {
  const parsed = schema.parse({
    was: first(raw.was) ?? DEFAULT_WHAT,
    wo: first(raw.wo) ?? DEFAULT_WHERE,
    umkreis: first(raw.umkreis) ?? DEFAULT_RADIUS_KM,
    page: first(raw.page) ?? 1,
  });
  return {
    what: parsed.was,
    where: parsed.wo,
    radiusKm: parsed.umkreis,
    page: parsed.page,
    pageSize: PAGE_SIZE,
  };
}

/** Адрес страницы поиска для запроса, например для ссылок пагинации. */
export function buildSearchHref(
  query: JobSearchQuery,
  overrides: Partial<JobSearchQuery> = {},
): string {
  const merged = { ...query, ...overrides };
  const params = new URLSearchParams({
    was: merged.what,
    wo: merged.where,
    umkreis: String(merged.radiusKm),
  });
  if (merged.page > 1) params.set("page", String(merged.page));
  return `/suche?${params.toString()}`;
}
