import "server-only";

import type { ApplicationSource } from "@/db/schema";

import type { JobSource } from "../types";
import { arbeitsagenturSource } from "./arbeitsagentur";

/**
 * Реестр источников. Ключи совпадают с APPLICATION_SOURCES в схеме БД,
 * поэтому TypeScript не даст забыть зарегистрировать новый источник.
 */
export const JOB_SOURCES: Record<ApplicationSource, JobSource> = {
  arbeitsagentur: arbeitsagenturSource,
};

export const DEFAULT_JOB_SOURCE: ApplicationSource = "arbeitsagentur";

export function getJobSource(id: ApplicationSource): JobSource {
  return JOB_SOURCES[id];
}
