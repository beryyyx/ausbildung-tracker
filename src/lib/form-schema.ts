import { z } from "zod";

/**
 * Общие кирпичики для Zod-схем форм и единый разбор FormData.
 * Схемы конкретных модулей живут в их validation.ts.
 */

/** Пустая строка из формы означает «поле не заполнено», в базе это null. */
export const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export const requiredText = (emptyMessage: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, emptyMessage)
    .max(max, `Не длиннее ${max} символов`);

export const optionalText = (max: number) =>
  z.preprocess(
    emptyToNull,
    z.string().max(max, `Не длиннее ${max} символов`).nullable(),
  );

/**
 * Ссылка только со схемой http или https. Голый z.url() принимает любую схему,
 * включая javascript:, а ссылка потом попадает в href.
 */
export const httpUrl = (message = "Ссылка должна начинаться с http:// или https://") =>
  z.url({ protocol: /^https?$/, error: message });

export const optionalDate = z.preprocess(
  emptyToNull,
  z.iso.date({ error: "Дата должна быть в формате ГГГГ-ММ-ДД" }).nullable(),
);

/** Текст из поля → число; пустое поле → null, чтобы «не заполнено» не превратилось в ноль. */
const toInt = (value: unknown) => {
  const cleaned = emptyToNull(value);
  return typeof cleaned === "string" ? Number(cleaned) : cleaned;
};

const intRange = (min: number, max: number, emptyMessage = "Введите число") =>
  z
    .number({ error: emptyMessage })
    .int({ error: "Только целое число" })
    .min(min, `Не меньше ${min}`)
    .max(max, `Не больше ${max}`);

/** Целое число из текстового поля. Пустое поле — null, не ноль. */
export const optionalInt = (min: number, max: number) =>
  z.preprocess(toInt, intRange(min, max).nullable());

export const requiredInt = (min: number, max: number, emptyMessage: string) =>
  z.preprocess(toInt, intRange(min, max, emptyMessage));

/** Что сервер возвращает форме после отправки. */
export type FormState<Field extends string> = {
  /** Ошибки по полям. */
  errors?: Partial<Record<Field, string[]>>;
  /** Общая ошибка, не привязанная к конкретному полю. */
  message?: string;
  /** Введённые значения, чтобы форма не очищалась после ошибки. */
  values?: Partial<Record<Field, string>>;
  /** Успешно сохранено, форма остаётся на странице. */
  saved?: boolean;
};

export type FieldOf<Schema extends z.ZodObject> = Extract<
  keyof z.output<Schema>,
  string
>;

export type ParseResult<Schema extends z.ZodObject> =
  | {
      success: true;
      data: z.output<Schema>;
      values: Record<FieldOf<Schema>, string>;
    }
  | { success: false; state: FormState<FieldOf<Schema>> };

/**
 * Значения полей формы из записи БД (или пустого объекта для новой формы):
 * ключи берутся из схемы, null → "", числа → строки, лишние поля записи пропускаются.
 */
export function toFormValues<Schema extends z.ZodObject>(
  schema: Schema,
  row: Partial<Record<FieldOf<Schema>, unknown>>,
): Record<FieldOf<Schema>, string> {
  const values = {} as Record<FieldOf<Schema>, string>;
  for (const field of Object.keys(schema.shape) as FieldOf<Schema>[]) {
    const value = row[field];
    values[field] = value == null ? "" : String(value);
  }
  return values;
}

/** Разбор FormData по схеме: либо данные для записи, либо состояние формы с ошибками. */
export function parseForm<Schema extends z.ZodObject>(
  schema: Schema,
  formData: FormData,
): ParseResult<Schema> {
  // Сырые строки по ключам схемы: их возвращаем форме, чтобы она не очистилась после ошибки.
  const values = {} as Record<FieldOf<Schema>, string>;
  for (const field of Object.keys(schema.shape) as FieldOf<Schema>[]) {
    const raw = formData.get(field);
    values[field] = typeof raw === "string" ? raw : "";
  }
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data as z.output<Schema>, values };
  }

  const { fieldErrors, formErrors } = z.flattenError(result.error);
  return {
    success: false,
    state: {
      errors: fieldErrors as Partial<Record<FieldOf<Schema>, string[]>>,
      message: formErrors[0],
      values,
    },
  };
}
