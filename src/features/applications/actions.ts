"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  APPLICATION_STATUSES,
  applications,
  type NewApplication,
} from "@/db/schema";
import { todayIso } from "@/lib/dates";

import { insertDatedNote } from "./notes";
import {
  NOTES_MAX_LENGTH,
  parseApplicationForm,
  type ApplicationFormState,
} from "./validation";

const idSchema = z.number().int().positive();
const statusSchema = z.enum(APPLICATION_STATUSES);
/** Одна строка для заметок: не пустая и заведомо короче всего поля. */
const noteLineSchema = z.string().trim().min(1).max(500);

export async function createApplication(
  _previous: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const parsed = parseApplicationForm(formData);
  if (!parsed.success) return parsed.state;

  await db.insert(applications).values(parsed.data);

  revalidatePath("/");
  redirect("/");
}

export async function updateApplication(
  id: number,
  _previous: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  if (!idSchema.safeParse(id).success) {
    return { message: "Некорректный номер заявки." };
  }

  const parsed = parseApplicationForm(formData);
  if (!parsed.success) return parsed.state;

  const updated = await db
    .update(applications)
    .set(parsed.data)
    .where(eq(applications.id, id))
    .returning({ id: applications.id });

  if (updated.length === 0) {
    return {
      message: "Заявка не найдена. Возможно, она уже удалена.",
      values: parsed.values,
    };
  }

  revalidatePath("/");
  revalidatePath(`/applications/${id}`);
  redirect("/");
}

export async function deleteApplication(id: number): Promise<void> {
  if (!idSchema.safeParse(id).success) return;

  await db.delete(applications).where(eq(applications.id, id));

  revalidatePath("/");
  redirect("/");
}

/**
 * Быстрая смена статуса из списка. Если заявка выходит из черновика,
 * а дата отправки пуста, подставляем сегодняшнюю.
 */
export async function setApplicationStatus(
  id: number,
  status: string,
): Promise<void> {
  if (!idSchema.safeParse(id).success) return;

  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedStatus.success) return;

  const current = await db
    .select({ appliedAt: applications.appliedAt })
    .from(applications)
    .where(eq(applications.id, id))
    .get();
  if (!current) return;

  const patch: Partial<NewApplication> = { status: parsedStatus.data };
  if (parsedStatus.data !== "draft" && !current.appliedAt) {
    patch.appliedAt = todayIso();
  }

  await db.update(applications).set(patch).where(eq(applications.id, id));

  revalidatePath("/");
  revalidatePath(`/applications/${id}`);
}

export type InsertNoteResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "not-found" | "too-long" };

/**
 * Вставляет датированную строку в заметки заявки по её дате (правило в notes.ts).
 * Так модуль Gmail складывает историю переписки туда, где её читают, и в хронологическом
 * порядке независимо от порядка нажатий. Длина ограничена тем же лимитом, что и в форме
 * заявки, иначе форму потом нельзя было бы сохранить.
 */
export async function insertApplicationNote(
  id: number,
  line: string,
): Promise<InsertNoteResult> {
  const parsedLine = noteLineSchema.safeParse(line);
  if (!idSchema.safeParse(id).success || !parsedLine.success) {
    return { ok: false, reason: "invalid" };
  }

  const current = await db
    .select({ notes: applications.notes })
    .from(applications)
    .where(eq(applications.id, id))
    .get();
  if (!current) return { ok: false, reason: "not-found" };

  const notes = insertDatedNote(current.notes, parsedLine.data);
  if (notes.length > NOTES_MAX_LENGTH) return { ok: false, reason: "too-long" };

  await db.update(applications).set({ notes }).where(eq(applications.id, id));

  revalidatePath("/");
  revalidatePath(`/applications/${id}`);
  return { ok: true };
}
