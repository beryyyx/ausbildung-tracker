import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { applications, type Application } from "@/db/schema";

import type { ApplicationFilter } from "./filters";
import { summarizeApplications, type ApplicationStats } from "./stats";

export type ApplicationList = {
  /** Заявки, прошедшие оба фильтра. */
  items: Application[];
  /** Всего заявок в базе, без фильтров. */
  total: number;
  /** Сводка по всем заявкам для панели и воронки, фильтры не учитываются. */
  stats: ApplicationStats;
};

/**
 * Список заявок с фильтром. Сначала ближайшие дедлайны, заявки без дедлайна в конце,
 * при равенстве свежие изменения выше. Группировку по компании делает таблица.
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

  const items =
    filter.statuses.length === 0
      ? byText
      : byText.filter((item) => filter.statuses.includes(item.status));

  return { items, total: all.length, stats: summarizeApplications(all) };
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
