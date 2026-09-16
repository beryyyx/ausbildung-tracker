import type { ApplicationSource } from "@/db/schema";

/** Параметры одного запроса к Arbeitsagentur: только то, что источник умеет сам. */
export type JobSourceQuery = {
  /** Профессия или ключевые слова, например "Fachinformatiker". */
  what: string;
  /** Город или почтовый индекс. */
  where: string;
  radiusKm: number;
  /** Номер страницы источника, начиная с 1. */
  page: number;
  pageSize: number;
};

/**
 * Параметры поиска на странице /suche: то же плюс фильтры,
 * которые применяет общий слой (search.ts), а не источник.
 */
export type JobSearchQuery = JobSourceQuery & {
  /** Минимальная дата старта, YYYY-MM-DD. null — фильтр выключен. Верхней границы нет. */
  startFrom: string | null;
};

export type JobKind = "ausbildung" | "duales-studium";

/** Вакансия в едином формате, не зависящем от источника. */
export type JobListing = {
  source: ApplicationSource;
  /** Уникальный номер вакансии в источнике. Защита от повторного импорта. */
  refnr: string;
  title: string;
  company: string | null;
  /** Профессия, как её называет источник. */
  profession: string | null;
  city: string | null;
  postalCode: string | null;
  distanceKm: number | null;
  /** Дата начала обучения, YYYY-MM-DD. */
  startDate: string | null;
  /** Дата публикации, YYYY-MM-DD. */
  publishedAt: string | null;
  /** Ссылка на вакансию: внешняя, если источник её даёт, иначе страница источника. */
  url: string;
  kind: JobKind;
};

export type JobSearchResult = {
  listings: JobListing[];
  /** Сколько всего вакансий нашёл источник по этому запросу. */
  total: number;
  page: number;
  pageSize: number;
  /** Как источник понял место поиска, например "Straelen". */
  resolvedLocation: string | null;
};

export type JobSourceErrorKind = "network" | "timeout" | "http" | "invalid-response";

/** Ошибка обращения к источнику. По kind интерфейс подбирает понятное сообщение. */
export class JobSourceError extends Error {
  readonly kind: JobSourceErrorKind;
  readonly status?: number;

  constructor(kind: JobSourceErrorKind, message: string, status?: number) {
    super(message);
    this.name = "JobSourceError";
    this.kind = kind;
    this.status = status;
  }
}
