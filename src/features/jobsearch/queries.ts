import "server-only";

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { applications } from "@/db/schema";

/** Какие вакансии уже есть среди заявок: refnr → id заявки. */
export async function findApplicationIdsByRefnr(
  refnrs: string[],
): Promise<Map<string, number>> {
  if (refnrs.length === 0) return new Map();

  const rows = await db
    .select({ id: applications.id, refnr: applications.refnr })
    .from(applications)
    .where(inArray(applications.refnr, refnrs));

  const map = new Map<string, number>();
  for (const row of rows) {
    if (row.refnr) map.set(row.refnr, row.id);
  }
  return map;
}
