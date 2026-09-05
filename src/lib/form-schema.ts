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

export const optionalDate = z.preprocess(
  emptyToNull,
  z.iso.date({ error: "Дата должна быть в формате ГГГГ-ММ-ДД" }).nullable(),
);

/** Целое число из текстового поля. Пустое поле — null, не ноль. */
export const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (value) => {
      const cleaned = emptyToNull(value);
      return typeof cleaned === "string" ? Number(cleaned) : cleaned;
    },
    z
      .number({ error: "Введите число" })
      .int({ error: "Только целое число" })
      .min(min, `Не меньше ${min}`)
      .max(max, `Не больше ${max}`)
      .nullable(),
  );

export const requiredInt = (min: number, max: number, emptyMessage: string) =>
  z.preprocess(
    (value) => {
      const cleaned = emptyToNull(value);
      return typeof cleaned === "string" ? Number(cleaned) : cleaned;
    },
    z
      .number({ error: emptyMessage })
      .int({ error: "Только целое число" })
      .min(min, `Не меньше ${min}`)
      .max(max, `Не больше ${max}`),
  );

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

/** Сырые строки из полей формы по ключам схемы, ещё не проверенные. */
export function readFormValues<Schema extends z.ZodObject>(
  schema: Schema,
  formData: FormData,
): Record<FieldOf<Schema>, string> {
  const values = {} as Record<FieldOf<Schema>, string>;
  for (const field of Object.keys(schema.shape) as FieldOf<Schema>[]) {
    const raw = formData.get(field);
    values[field] = typeof raw === "string" ? raw : "";
  }
  return values;
}

/** Разбор FormData по схеме: либо данные для записи, либо состояние формы с ошибками. */
export function parseForm<Schema extends z.ZodObject>(
  schema: Schema,
  formData: FormData,
): ParseResult<Schema> {
  const values = readFormValues(schema, formData);
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
