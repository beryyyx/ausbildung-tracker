import { z } from "zod";

import {
  LANGUAGE_LEVELS,
  SCHOOL_DEGREES,
  type Profile,
  type ZeugnisScale,
} from "@/db/schema";
import {
  emptyToNull,
  optionalDate,
  optionalInt,
  optionalText,
  requiredInt,
  requiredText,
  type FieldOf,
  type FormState,
} from "@/lib/form-schema";

/* ---------- Личные данные и школа ---------- */

export const profileInputSchema = z.object({
  firstName: requiredText("Укажите имя", 100),
  lastName: requiredText("Укажите фамилию", 100),
  birthDate: optionalDate,
  street: optionalText(200),
  postalCode: optionalText(10),
  city: optionalText(120),
  phone: optionalText(40),
  email: z.preprocess(
    emptyToNull,
    z.email({ error: "Некорректный адрес email" }).nullable(),
  ),
  schoolName: optionalText(200),
  schoolDegree: z.preprocess(
    emptyToNull,
    z.enum(SCHOOL_DEGREES, { error: "Неизвестный Schulabschluss" }).nullable(),
  ),
  graduationYear: optionalInt(1990, 2100),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type ProfileField = FieldOf<typeof profileInputSchema>;
export type ProfileFormValues = Record<ProfileField, string>;
export type ProfileFormState = FormState<ProfileField>;

/** Запись из базы → значения для полей формы. */
export function profileToFormValues(profile: Profile): ProfileFormValues {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    birthDate: profile.birthDate ?? "",
    street: profile.street ?? "",
    postalCode: profile.postalCode ?? "",
    city: profile.city ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    schoolName: profile.schoolName ?? "",
    schoolDegree: profile.schoolDegree ?? "",
    graduationYear:
      profile.graduationYear === null ? "" : String(profile.graduationYear),
  };
}

/* ---------- Zeugnis и оценки ---------- */

export const zeugnisInputSchema = z.object({
  title: optionalText(120),
});

export type ZeugnisField = FieldOf<typeof zeugnisInputSchema>;
export type ZeugnisFormState = FormState<ZeugnisField>;

/**
 * Допустимый диапазон оценки для каждой шкалы. Пока только Sek I (1–6);
 * шкала баллов Oberstufe (0–15) добавится сюда же.
 */
export const GRADE_RANGES: Record<ZeugnisScale, { min: number; max: number }> =
  {
    sek1: { min: 1, max: 6 },
  };

export function gradeInputSchema(scale: ZeugnisScale) {
  const { min, max } = GRADE_RANGES[scale];
  return z.object({
    subject: requiredText("Укажите предмет", 80),
    grade: requiredInt(min, max, `Оценка от ${min} до ${max}`),
  });
}

export type GradeField = FieldOf<ReturnType<typeof gradeInputSchema>>;
export type GradeFormState = FormState<GradeField>;

/* ---------- Языки ---------- */

export const languageInputSchema = z.object({
  language: requiredText("Укажите язык", 60),
  level: z.enum(LANGUAGE_LEVELS, { error: "Выберите уровень" }),
});

export type LanguageField = FieldOf<typeof languageInputSchema>;
export type LanguageFormState = FormState<LanguageField>;

/* ---------- Praktika ---------- */

export const internshipInputSchema = z
  .object({
    company: requiredText("Укажите компанию", 200),
    field: optionalText(120),
    startDate: optionalDate,
    endDate: optionalDate,
    description: optionalText(2000),
  })
  .check((ctx) => {
    const { startDate, endDate } = ctx.value;
    if (startDate && endDate && endDate < startDate) {
      ctx.issues.push({
        code: "custom",
        input: endDate,
        path: ["endDate"],
        message: "Окончание раньше начала",
      });
    }
  });

export type InternshipField = FieldOf<typeof internshipInputSchema>;
export type InternshipFormState = FormState<InternshipField>;

/* ---------- Файлы ---------- */

export const MAX_UPLOAD_MB = 10;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

/**
 * Проверка загружаемого файла: наличие, размер, тип. Браузер не всегда
 * проставляет MIME, поэтому расширения тоже достаточно. Настоящая проверка
 * содержимого (сигнатура %PDF-) идёт на сервере в storage.ts.
 */
export const uploadInputSchema = z
  .file({ error: "Выберите файл" })
  .min(1, "Файл пустой")
  .max(MAX_UPLOAD_BYTES, `Файл больше ${MAX_UPLOAD_MB} МБ`)
  .refine(
    (file) => file.type === "application/pdf" || /\.pdf$/i.test(file.name),
    "Можно загрузить только PDF",
  );

export type UploadField = "file";
export type UploadFormState = FormState<UploadField>;
