import { z } from "zod";

import { APPLICATION_STATUSES, type Application } from "@/db/schema";

/** Пустая строка из формы означает «поле не заполнено», в базе это null. */
const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const optionalText = (max: number) =>
  z.preprocess(
    emptyToNull,
    z.string().trim().max(max, `Не длиннее ${max} символов`).nullable(),
  );

const optionalDate = z.preprocess(
  emptyToNull,
  z.iso.date({ error: "Дата должна быть в формате ГГГГ-ММ-ДД" }).nullable(),
);

export const applicationInputSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Укажите компанию")
    .max(200, "Не длиннее 200 символов"),
  position: z
    .string()
    .trim()
    .min(1, "Укажите профессию")
    .max(200, "Не длиннее 200 символов"),
  city: optionalText(120),
  url: z.preprocess(
    emptyToNull,
    z.url({ error: "Ссылка должна начинаться с http:// или https://" }).nullable(),
  ),
  appliedAt: optionalDate,
  status: z.enum(APPLICATION_STATUSES, { error: "Неизвестный статус" }),
  deadline: optionalDate,
  notes: optionalText(5000),
});

/** Проверенные данные, готовые к записи в базу. */
export type ApplicationInput = z.infer<typeof applicationInputSchema>;

export type ApplicationField = keyof ApplicationInput;

export const APPLICATION_FIELDS = Object.keys(
  applicationInputSchema.shape,
) as ApplicationField[];

/** Сырые строки из полей формы, ещё не проверенные. */
export type ApplicationFormValues = Record<ApplicationField, string>;

/** Что сервер возвращает форме после отправки. */
export type ApplicationFormState = {
  /** Ошибки по полям. */
  errors?: Partial<Record<ApplicationField, string[]>>;
  /** Общая ошибка, не привязанная к конкретному полю. */
  message?: string;
  /** Введённые значения, чтобы форма не очищалась после ошибки. */
  values?: Partial<ApplicationFormValues>;
};

export function readFormValues(formData: FormData): ApplicationFormValues {
  const values = {} as ApplicationFormValues;
  for (const field of APPLICATION_FIELDS) {
    const raw = formData.get(field);
    values[field] = typeof raw === "string" ? raw : "";
  }
  return values;
}

export function parseApplicationForm(
  formData: FormData,
):
  | { success: true; data: ApplicationInput; values: ApplicationFormValues }
  | { success: false; state: ApplicationFormState } {
  const values = readFormValues(formData);
  const result = applicationInputSchema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data, values };
  }

  const { fieldErrors, formErrors } = z.flattenError(result.error);
  return {
    success: false,
    state: { errors: fieldErrors, message: formErrors[0], values },
  };
}

/** Запись из базы → значения для полей формы. */
export function applicationToFormValues(
  application: Application,
): ApplicationFormValues {
  return {
    company: application.company,
    position: application.position,
    city: application.city ?? "",
    url: application.url ?? "",
    appliedAt: application.appliedAt ?? "",
    status: application.status,
    deadline: application.deadline ?? "",
    notes: application.notes ?? "",
  };
}
