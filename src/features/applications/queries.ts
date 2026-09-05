import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { applications, type Application } from "@/db/schema";

/**
 * Все заявки. Сначала ближайшие дедлайны, заявки без дедлайна в конце,
 * при равенстве свежие изменения выше.
 */
export async function listApplications(): Promise<Application[]> {
  return await db
    .select()
    .from(applications)
    .orderBy(
      sql`${applications.deadline} IS NULL`,
      asc(applications.deadline),
      desc(applications.updatedAt),
    );
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
