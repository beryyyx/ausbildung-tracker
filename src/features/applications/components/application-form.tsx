"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";

import { FIELD_LABELS, STATUS_LABELS } from "../labels";
import type {
  ApplicationField,
  ApplicationFormState,
  ApplicationFormValues,
} from "../validation";

type Props = {
  /** Server Action: создать или обновить. Для обновления id привязывается через bind. */
  action: (
    state: ApplicationFormState,
    formData: FormData,
  ) => Promise<ApplicationFormState>;
  initialValues?: Partial<ApplicationFormValues>;
  submitLabel: string;
};

const EMPTY_VALUES: ApplicationFormValues = {
  company: "",
  position: "",
  city: "",
  url: "",
  appliedAt: "",
  status: "draft",
  deadline: "",
  notes: "",
};

const inputClass =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 aria-invalid:border-red-400";

export function ApplicationForm({ action, initialValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<
    ApplicationFormState,
    FormData
  >(action, {});

  // После неудачной отправки показываем то, что ввёл пользователь,
  // иначе значения из базы, иначе пустую форму.
  const values: ApplicationFormValues = {
    ...EMPTY_VALUES,
    ...initialValues,
    ...state.values,
  };

  const errorOf = (field: ApplicationField) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          name="company"
          label={FIELD_LABELS.company}
          error={errorOf("company")}
          required
        >
          <input
            id="company"
            name="company"
            type="text"
            required
            autoFocus
            defaultValue={values.company}
            aria-invalid={Boolean(errorOf("company"))}
            className={inputClass}
          />
        </Field>

        <Field
          name="position"
          label={FIELD_LABELS.position}
          error={errorOf("position")}
          required
        >
          <input
            id="position"
            name="position"
            type="text"
            required
            defaultValue={values.position}
            aria-invalid={Boolean(errorOf("position"))}
            className={inputClass}
          />
        </Field>

        <Field name="city" label={FIELD_LABELS.city} error={errorOf("city")}>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={values.city}
            aria-invalid={Boolean(errorOf("city"))}
            className={inputClass}
          />
        </Field>

        <Field
          name="status"
          label={FIELD_LABELS.status}
          error={errorOf("status")}
        >
          <select
            id="status"
            name="status"
            defaultValue={values.status}
            aria-invalid={Boolean(errorOf("status"))}
            className={inputClass}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          name="url"
          label={FIELD_LABELS.url}
          error={errorOf("url")}
          className="sm:col-span-2"
        >
          <input
            id="url"
            name="url"
            type="url"
            inputMode="url"
            placeholder="https://"
            defaultValue={values.url}
            aria-invalid={Boolean(errorOf("url"))}
            className={inputClass}
          />
        </Field>

        <Field
          name="appliedAt"
          label={FIELD_LABELS.appliedAt}
          error={errorOf("appliedAt")}
        >
          <input
            id="appliedAt"
            name="appliedAt"
            type="date"
            defaultValue={values.appliedAt}
            aria-invalid={Boolean(errorOf("appliedAt"))}
            className={inputClass}
          />
        </Field>

        <Field
          name="deadline"
          label={FIELD_LABELS.deadline}
          error={errorOf("deadline")}
        >
          <input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={values.deadline}
            aria-invalid={Boolean(errorOf("deadline"))}
            className={inputClass}
          />
        </Field>

        <Field
          name="notes"
          label={FIELD_LABELS.notes}
          error={errorOf("notes")}
          className="sm:col-span-2"
        >
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={values.notes}
            aria-invalid={Boolean(errorOf("notes"))}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 border-t border-zinc-200 pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Сохраняем…" : submitLabel}
        </button>
        <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
          Отмена
        </Link>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  required,
  className,
  children,
}: {
  name: ApplicationField;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
