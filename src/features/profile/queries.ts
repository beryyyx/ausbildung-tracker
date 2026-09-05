import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  PROFILE_ID,
  ZEUGNIS_SLOTS,
  profile,
  profileFiles,
  profileGrades,
  profileInternships,
  profileLanguages,
  profileZeugnisse,
  type Grade,
  type Internship,
  type Language,
  type Profile,
  type ProfileFile,
  type Zeugnis,
  type ZeugnisSlot,
} from "@/db/schema";

/** Единственная строка профиля. undefined, пока форму ни разу не сохраняли. */
export async function getProfile(): Promise<Profile | undefined> {
  return await db
    .select()
    .from(profile)
    .where(eq(profile.id, PROFILE_ID))
    .get();
}

export type ZeugnisWithGrades = {
  slot: ZeugnisSlot;
  /** null, пока в этот слот ничего не сохраняли. */
  zeugnis: Zeugnis | null;
  grades: Grade[];
};

/** Оба слота Zeugnis в фиксированном порядке, каждый со своими оценками. */
export async function listZeugnisse(): Promise<ZeugnisWithGrades[]> {
  const zeugnisse = await db.select().from(profileZeugnisse);
  const grades = await db
    .select()
    .from(profileGrades)
    .orderBy(asc(profileGrades.createdAt), asc(profileGrades.id));

  return ZEUGNIS_SLOTS.map((slot) => {
    const zeugnis = zeugnisse.find((z) => z.slot === slot) ?? null;
    return {
      slot,
      zeugnis,
      grades: zeugnis ? grades.filter((g) => g.zeugnisId === zeugnis.id) : [],
    };
  });
}

export async function listLanguages(): Promise<Language[]> {
  return await db
    .select()
    .from(profileLanguages)
    .orderBy(asc(profileLanguages.createdAt), asc(profileLanguages.id));
}

/** Практики: свежие сверху, без даты начала в конце. */
export async function listInternships(): Promise<Internship[]> {
  return await db
    .select()
    .from(profileInternships)
    .orderBy(
      sql`${profileInternships.startDate} IS NULL`,
      desc(profileInternships.startDate),
      desc(profileInternships.id),
    );
}

export async function listFiles(): Promise<ProfileFile[]> {
  return await db
    .select()
    .from(profileFiles)
    .orderBy(desc(profileFiles.createdAt), desc(profileFiles.id));
}

export async function getFile(id: number): Promise<ProfileFile | undefined> {
  return await db
    .select()
    .from(profileFiles)
    .where(eq(profileFiles.id, id))
    .get();
}
