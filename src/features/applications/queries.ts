import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  APPLICATION_STATUSES,
  applications,
  type Application,
  type ApplicationStatus,
} from "@/db/schema";

import type { ApplicationFilter } from "./filters";

export type ApplicationList = {
  /** Заявки, прошедшие оба фильтра. */
  items: Application[];
  /** Сколько заявок каждого статуса подходит под текст поиска (выбранные статусы не учитываются). */
  counts: Record<ApplicationStatus, number>;
  /** Всего заявок в базе, без фильтров. */
  total: number;
};

/**
 * Список заявок с фильтром. Сначала ближайшие дедлайны, заявки без дедлайна в конце,
 * при равенстве свежие изменения выше.
 *
 * ponytail: фильтруем в памяти, а не в SQL. Заявок десятки, зато поиск правильно
 * работает с регистром и умлаутами, а счётчики считаются без второго запроса.
 * Перенести в WHERE, если строк станут тысячи.
 */
export async function listApplications(
  filter: ApplicationFilter,
): Promise<ApplicationList> {
  const all = await db
    .select()
    .from(applications)
    .orderBy(
      sql`${applications.deadline} IS NULL`,
      asc(applications.deadline),
      desc(applications.updatedAt),
    );

  const needle = filter.q.toLocaleLowerCase("de");
  const matchesText = (item: Application) =>
    needle === "" ||
    [item.company, item.position, item.city ?? ""].some((field) =>
      field.toLocaleLowerCase("de").includes(needle),
    );

  const byText = all.filter(matchesText);

  const counts = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [status, 0]),
  ) as Record<ApplicationStatus, number>;
  for (const item of byText) counts[item.status] += 1;

  const items =
    filter.statuses.length === 0
      ? byText
      : byText.filter((item) => filter.statuses.includes(item.status));

  return { items, counts, total: all.length };
}

export async function getApplication(
  id: number,
): Promise<Application | undefined> {
  return await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .get();
}
