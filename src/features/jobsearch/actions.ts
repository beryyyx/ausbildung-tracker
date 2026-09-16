"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { APPLICATION_SOURCES, applications } from "@/db/schema";
import { SOURCE_LABELS } from "@/features/applications/labels";
import { formatDate, todayIso } from "@/lib/dates";
import { httpUrl } from "@/lib/form-schema";

import { JOB_KIND_LABELS } from "./labels";
import type { JobListing } from "./types";

/** Данные приходят с клиента, поэтому проверяем их заново, даже если их собрал наш же сервер. */
const listingSchema = z.object({
  source: z.enum(APPLICATION_SOURCES),
  refnr: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(300),
  company: z.string().trim().max(200).nullable(),
  profession: z.string().trim().max(200).nullable(),
  city: z.string().trim().max(120).nullable(),
  postalCode: z.string().trim().max(10).nullable(),
  distanceKm: z.number().min(0).nullable(),
  startDate: z.iso.date().nullable(),
  publishedAt: z.iso.date().nullable(),
  url: httpUrl(),
  kind: z.enum(["ausbildung", "duales-studium"]),
});

export type ImportResult =
  | { status: "created"; applicationId: number }
  | { status: "exists"; applicationId: number }
  | { status: "error"; message: string };

function buildNotes(listing: z.infer<typeof listingSchema>): string {
  const facts = [
    listing.startDate ? `Старт: ${formatDate(listing.startDate)}` : null,
    listing.distanceKm !== null ? `Расстояние: ${listing.distanceKm} км` : null,
    listing.kind === "duales-studium" ? JOB_KIND_LABELS[listing.kind] : null,
  ].filter(Boolean);

  return [
    `Импорт из ${SOURCE_LABELS[listing.source]}, ${formatDate(todayIso())}.`,
    `Вакансия: ${listing.title}`,
    facts.length > 0 ? facts.join(", ") : null,
    `Номер: ${listing.refnr}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function findByRefnr(refnr: string) {
  return await db
    .select({ id: applications.id })
    .from(applications)
    .where(eq(applications.refnr, refnr))
    .get();
}

/** Создаёт черновик заявки из вакансии. Повторный импорт той же вакансии не создаёт дубль. */
export async function importJobListing(input: JobListing): Promise<ImportResult> {
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: "Некорректные данные вакансии." };
  }
  const listing = parsed.data;

  const existing = await findByRefnr(listing.refnr);
  if (existing) return { status: "exists", applicationId: existing.id };

  try {
    const [row] = await db
      .insert(applications)
      .values({
        company: listing.company ?? "Компания не указана",
        position: listing.profession ?? listing.title,
        city: listing.city,
        url: listing.url,
        status: "draft",
        source: listing.source,
        refnr: listing.refnr,
        notes: buildNotes(listing),
      })
      .returning({ id: applications.id });

    revalidatePath("/");
    revalidatePath("/suche");
    return { status: "created", applicationId: row.id };
  } catch (error) {
    // Гонка: ту же вакансию добавили между проверкой и вставкой.
    if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") {
      const raced = await findByRefnr(listing.refnr);
      if (raced) return { status: "exists", applicationId: raced.id };
    }
    console.error("[jobsearch] import failed", error);
    return { status: "error", message: "Не удалось сохранить заявку." };
  }
}
