import "server-only";

import { z } from "zod";

import {
  JobSourceError,
  type JobListing,
  type JobSource,
} from "../types";

/**
 * Bundesagentur für Arbeit, Jobsuche API, версия v6.
 * Пути v4 и v5 из старой документации отдают 403 «No match found for request».
 * Формат ответа снят с живой выдачи 2026-09-05 (100 вакансий вокруг Straelen).
 */
const SEARCH_URL =
  "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs";
/** Публичный ключ из документации bundesAPI, не секрет. */
const API_KEY = "jobboerse-jobsuche";
/** angebotsart: 1 работа, 2 самозанятость, 4 Ausbildung, 34 практика. */
const ANGEBOTSART_AUSBILDUNG = "4";
const TIMEOUT_MS = 10_000;
/** Страница вакансии на сайте агентства, если у вакансии нет внешней ссылки. */
const DETAIL_URL = "https://www.arbeitsagentur.de/jobsuche/jobdetail/";

/**
 * Схемы ответа. Необязательные поля в JSON отсутствуют, а не равны null.
 * Лишние поля (facetten, координаты, флаги рабочего времени) пропускаем через loose().
 */
const addressSchema = z
  .object({
    plz: z.string().optional(),
    ort: z.string().optional(),
    region: z.string().optional(),
    land: z.string().optional(),
  })
  .loose();

const locationSchema = z
  .object({ adresse: addressSchema.optional() })
  .loose();

const listingSchema = z
  .object({
    referenznummer: z.string(),
    firma: z.string().optional(),
    stellenangebotsTitel: z.string().optional(),
    hauptberuf: z.string().optional(),
    alleBerufe: z.array(z.string()).optional(),
    stellenlokationen: z.array(locationSchema).optional(),
    /** Расстояние от места поиска в км. */
    entfernung: z.number().optional(),
    eintrittszeitraum: z.object({ von: z.string().optional() }).loose().optional(),
    datumErsteVeroeffentlichung: z.string().optional(),
    /** "AUSBILDUNG" или "DUALES_STUDIUM". */
    ausbildungsart: z.string().optional(),
    externeURL: z.string().optional(),
  })
  .loose();

const responseSchema = z
  .object({
    /** При пустой выдаче поля нет совсем. */
    ergebnisliste: z.array(listingSchema).optional(),
    maxErgebnisse: z.number(),
    page: z.number(),
    size: z.number(),
    woOutput: z.object({ bereinigterOrt: z.string().optional() }).loose().optional(),
  })
  .loose();

type ArbeitsagenturListing = z.infer<typeof listingSchema>;

function toListing(raw: ArbeitsagenturListing): JobListing {
  const address = raw.stellenlokationen?.[0]?.adresse;
  return {
    source: "arbeitsagentur",
    refnr: raw.referenznummer,
    title: raw.stellenangebotsTitel ?? raw.hauptberuf ?? "Ausbildung",
    company: raw.firma ?? null,
    profession: raw.hauptberuf ?? raw.alleBerufe?.[0] ?? null,
    city: address?.ort ?? null,
    postalCode: address?.plz ?? null,
    distanceKm: raw.entfernung ?? null,
    startDate: raw.eintrittszeitraum?.von ?? null,
    publishedAt: raw.datumErsteVeroeffentlichung ?? null,
    url: raw.externeURL ?? `${DETAIL_URL}${encodeURIComponent(raw.referenznummer)}`,
    kind: raw.ausbildungsart === "DUALES_STUDIUM" ? "duales-studium" : "ausbildung",
  };
}

function isTimeout(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "TimeoutError"
  );
}

export const arbeitsagenturSource: JobSource = {
  id: "arbeitsagentur",
  name: "Arbeitsagentur",

  async search(query) {
    const params = new URLSearchParams({
      angebotsart: ANGEBOTSART_AUSBILDUNG,
      wo: query.where,
      umkreis: String(query.radiusKm),
      page: String(query.page),
      size: String(query.pageSize),
    });
    const what = query.what.trim();
    if (what) params.set("was", what);

    let response: Response;
    try {
      response = await fetch(`${SEARCH_URL}?${params}`, {
        headers: { "X-API-Key": API_KEY, Accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });
    } catch (error) {
      if (isTimeout(error)) {
        throw new JobSourceError("timeout", `No response within ${TIMEOUT_MS} ms`);
      }
      throw new JobSourceError("network", "Request failed");
    }

    if (!response.ok) {
      throw new JobSourceError("http", `HTTP ${response.status}`, response.status);
    }

    const body: unknown = await response.json().catch(() => undefined);
    const parsed = responseSchema.safeParse(body);
    if (!parsed.success) {
      throw new JobSourceError("invalid-response", "Unexpected response shape");
    }

    return {
      listings: (parsed.data.ergebnisliste ?? []).map(toListing),
      total: parsed.data.maxErgebnisse,
      page: parsed.data.page,
      pageSize: parsed.data.size,
      resolvedLocation: parsed.data.woOutput?.bereinigterOrt ?? null,
    };
  },
};
