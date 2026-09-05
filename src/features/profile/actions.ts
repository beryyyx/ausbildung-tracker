"use server";

import path from "node:path";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  type Zeugnis,
  type ZeugnisSlot,
} from "@/db/schema";
import { parseForm } from "@/lib/form-schema";

import { getFile, getProfile } from "./queries";
import { isPdf, removeUpload, writeUpload } from "./storage";
import {
  gradeInputSchema,
  internshipInputSchema,
  languageInputSchema,
  profileInputSchema,
  uploadInputSchema,
  zeugnisInputSchema,
  type GradeFormState,
  type InternshipFormState,
  type LanguageFormState,
  type ProfileFormState,
  type UploadFormState,
  type ZeugnisFormState,
} from "./validation";

const PROFILE_PATH = "/profile";

const idSchema = z.number().int().positive();
const slotSchema = z.enum(ZEUGNIS_SLOTS);

/* ---------- Личные данные и школа ---------- */

/** Сохраняет единственный профиль: первая отправка создаёт строку, остальные обновляют. */
export async function saveProfile(
  _previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = parseForm(profileInputSchema, formData);
  if (!parsed.success) return parsed.state;

  const existing = await getProfile();
  if (existing) {
    await db
      .update(profile)
      .set(parsed.data)
      .where(eq(profile.id, PROFILE_ID));
  } else {
    await db.insert(profile).values({ id: PROFILE_ID, ...parsed.data });
  }

  revalidatePath(PROFILE_PATH);
  return { saved: true, values: parsed.values };
}

/* ---------- Zeugnis и оценки ---------- */

/** Строка слота Zeugnis, создаётся при первом обращении. */
async function ensureZeugnis(slot: ZeugnisSlot): Promise<Zeugnis> {
  await db
    .insert(profileZeugnisse)
    .values({ slot })
    .onConflictDoNothing({ target: profileZeugnisse.slot });

  const zeugnis = await db
    .select()
    .from(profileZeugnisse)
    .where(eq(profileZeugnisse.slot, slot))
    .get();
  if (!zeugnis) throw new Error(`Не удалось создать Zeugnis для слота ${slot}`);
  return zeugnis;
}

export async function saveZeugnis(
  slot: ZeugnisSlot,
  _previous: ZeugnisFormState,
  formData: FormData,
): Promise<ZeugnisFormState> {
  if (!slotSchema.safeParse(slot).success) {
    return { message: "Неизвестный Zeugnis." };
  }

  const parsed = parseForm(zeugnisInputSchema, formData);
  if (!parsed.success) return parsed.state;

  const zeugnis = await ensureZeugnis(slot);
  await db
    .update(profileZeugnisse)
    .set(parsed.data)
    .where(eq(profileZeugnisse.id, zeugnis.id));

  revalidatePath(PROFILE_PATH);
  return { saved: true, values: parsed.values };
}

export async function addGrade(
  slot: ZeugnisSlot,
  _previous: GradeFormState,
  formData: FormData,
): Promise<GradeFormState> {
  if (!slotSchema.safeParse(slot).success) {
    return { message: "Неизвестный Zeugnis." };
  }

  // Диапазон оценки зависит от шкалы Zeugnis, поэтому сначала берём его строку.
  const zeugnis = await ensureZeugnis(slot);
  const parsed = parseForm(gradeInputSchema(zeugnis.scale), formData);
  if (!parsed.success) return parsed.state;

  await db
    .insert(profileGrades)
    .values({ zeugnisId: zeugnis.id, ...parsed.data });

  revalidatePath(PROFILE_PATH);
  return {};
}

export async function deleteGrade(id: number): Promise<void> {
  if (!idSchema.safeParse(id).success) return;

  await db.delete(profileGrades).where(eq(profileGrades.id, id));
  revalidatePath(PROFILE_PATH);
}

/* ---------- Языки ---------- */

export async function addLanguage(
  _previous: LanguageFormState,
  formData: FormData,
): Promise<LanguageFormState> {
  const parsed = parseForm(languageInputSchema, formData);
  if (!parsed.success) return parsed.state;

  await db.insert(profileLanguages).values(parsed.data);

  revalidatePath(PROFILE_PATH);
  return {};
}

export async function deleteLanguage(id: number): Promise<void> {
  if (!idSchema.safeParse(id).success) return;

  await db.delete(profileLanguages).where(eq(profileLanguages.id, id));
  revalidatePath(PROFILE_PATH);
}

/* ---------- Praktika ---------- */

export async function addInternship(
  _previous: InternshipFormState,
  formData: FormData,
): Promise<InternshipFormState> {
  const parsed = parseForm(internshipInputSchema, formData);
  if (!parsed.success) return parsed.state;

  await db.insert(profileInternships).values(parsed.data);

  revalidatePath(PROFILE_PATH);
  return {};
}

export async function deleteInternship(id: number): Promise<void> {
  if (!idSchema.safeParse(id).success) return;

  await db.delete(profileInternships).where(eq(profileInternships.id, id));
  revalidatePath(PROFILE_PATH);
}

/* ---------- Файлы ---------- */

export async function uploadFile(
  _previous: UploadFormState,
  formData: FormData,
): Promise<UploadFormState> {
  const parsed = uploadInputSchema.safeParse(formData.get("file"));
  if (!parsed.success) {
    return { errors: { file: parsed.error.issues.map((issue) => issue.message) } };
  }

  const file = parsed.data;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!isPdf(bytes)) {
    return { errors: { file: ["Содержимое файла не похоже на PDF."] } };
  }

  const storedName = await writeUpload(bytes);
  try {
    await db.insert(profileFiles).values({
      // Браузер обычно отдаёт только имя, но на всякий случай отрезаем путь.
      fileName: path.basename(file.name).slice(0, 255) || "document.pdf",
      storedName,
      sizeBytes: bytes.length,
    });
  } catch (error) {
    // Запись в базу не удалась: не оставляем файл-сироту на диске.
    await removeUpload(storedName);
    throw error;
  }

  revalidatePath(PROFILE_PATH);
  return { saved: true };
}

export async function deleteFile(id: number): Promise<void> {
  if (!idSchema.safeParse(id).success) return;

  const file = await getFile(id);
  if (!file) return;

  // Сначала запись, потом файл: если файл уже пропал, это не ошибка.
  await db.delete(profileFiles).where(eq(profileFiles.id, id));
  await removeUpload(file.storedName);

  revalidatePath(PROFILE_PATH);
}
