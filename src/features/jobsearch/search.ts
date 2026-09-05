import "server-only";

import { findApplicationIdsByRefnr } from "./queries";
import { DEFAULT_JOB_SOURCE, getJobSource } from "./sources";
import {
  JobSourceError,
  type JobSearchQuery,
  type JobSearchResult,
  type JobSourceErrorKind,
} from "./types";

export type SearchOutcome =
  | {
      ok: true;
      result: JobSearchResult;
      /** refnr → id заявки для вакансий, которые уже импортированы. */
      existing: Map<string, number>;
    }
  | { ok: false; kind: JobSourceErrorKind | "unknown" };

/** Выполняет поиск в источнике и помечает уже импортированные вакансии. Ошибки не бросает. */
export async function runJobSearch(
  query: JobSearchQuery,
  sourceId = DEFAULT_JOB_SOURCE,
): Promise<SearchOutcome> {
  try {
    const result = await getJobSource(sourceId).search(query);
    const existing = await findApplicationIdsByRefnr(
      result.listings.map((listing) => listing.refnr),
    );
    return { ok: true, result, existing };
  } catch (error) {
    console.error("[jobsearch]", error);
    return {
      ok: false,
      kind: error instanceof JobSourceError ? error.kind : "unknown",
    };
  }
}
