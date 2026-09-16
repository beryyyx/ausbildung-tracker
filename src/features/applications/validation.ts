import { z } from "zod";

import { APPLICATION_STATUSES, type Application } from "@/db/schema";
import {
  emptyToNull,
  httpUrl,
  optionalDate,
  optionalInt,
  optionalText,
  parseForm,
  requiredText,
  type FieldOf,
  type FormState,
} from "@/lib/form-schema";

/** Предел поля заметок. Тот же лимит соблюдает дописывание строк из модуля Gmail. */
export const NOTES_MAX_LENGTH = 5000;

export const applicationInputSchema = z.object({
  company: requiredText("Укажите компанию", 200),
  position: requiredText("Укажите профессию", 200),
  city: optionalText(120),
  url: z.preprocess(emptyToNull, httpUrl().nullable()),
  appliedAt: optionalDate,
  status: z.enum(APPLICATION_STATUSES, { error: "Неизвестный статус" }),
  deadline: optionalDate,
  notes: optionalText(NOTES_MAX_LENGTH),
  /** Время в пути в минутах. Пустое поле — null, не ноль. */
  commuteMinutes: optionalInt(0, 600),
});

/** Проверенные данные, готовые к записи в базу. */
export type ApplicationInput = z.infer<typeof applicationInputSchema>;

export type ApplicationField = FieldOf<typeof applicationInputSchema>;

/** Сырые строки из полей формы, ещё не проверенные. */
export type ApplicationFormValues = Record<ApplicationField, string>;

/** Что сервер возвращает форме после отправки. */
export type ApplicationFormState = FormState<ApplicationField>;

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
    commuteMinutes:
      application.commuteMinutes === null ? "" : String(application.commuteMinutes),
  };
}
