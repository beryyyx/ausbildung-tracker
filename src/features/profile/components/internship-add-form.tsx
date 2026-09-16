"use client";

import { useActionState } from "react";

import { buttonClass } from "@/components/button";
import { Field, inputClass } from "@/components/form/field";
import { FormMessage } from "@/components/form/form-message";

import { INTERNSHIP_FIELD_LABELS, PROFILE_TEXTS } from "../labels";
import type { InternshipField, InternshipFormState } from "../validation";

type Props = {
  action: (
    state: InternshipFormState,
    formData: FormData,
  ) => Promise<InternshipFormState>;
};

/** Форма добавления практики: компания, сфера, даты, описание. */
export function InternshipAddForm({ action }: Props) {
  const [state, formAction, pending] = useActionState<
    InternshipFormState,
    FormData
  >(action, {});
  const errorOf = (field: InternshipField) => state.errors?.[field]?.[0];
  const valueOf = (field: InternshipField) => state.values?.[field] ?? "";

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && <FormMessage kind="error">{state.message}</FormMessage>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="company"
          label={INTERNSHIP_FIELD_LABELS.company}
          error={errorOf("company")}
          required
        >
          <input
            id="company"
            name="company"
            type="text"
            required
            defaultValue={valueOf("company")}
            aria-invalid={Boolean(errorOf("company"))}
            className={inputClass}
          />
        </Field>
        <Field
          name="field"
          label={INTERNSHIP_FIELD_LABELS.field}
          error={errorOf("field")}
        >
          <input
            id="field"
            name="field"
            type="text"
            defaultValue={valueOf("field")}
            placeholder="например, IT-Abteilung"
            aria-invalid={Boolean(errorOf("field"))}
            className={inputClass}
          />
        </Field>
        <Field
          name="startDate"
          label={INTERNSHIP_FIELD_LABELS.startDate}
          error={errorOf("startDate")}
        >
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={valueOf("startDate")}
            aria-invalid={Boolean(errorOf("startDate"))}
            className={inputClass}
          />
        </Field>
        <Field
          name="endDate"
          label={INTERNSHIP_FIELD_LABELS.endDate}
          error={errorOf("endDate")}
        >
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={valueOf("endDate")}
            aria-invalid={Boolean(errorOf("endDate"))}
            className={inputClass}
          />
        </Field>
        <Field
          name="description"
          label={INTERNSHIP_FIELD_LABELS.description}
          error={errorOf("description")}
          className="sm:col-span-2"
        >
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={valueOf("description")}
            placeholder="чем занимался, что понравилось"
            aria-invalid={Boolean(errorOf("description"))}
            className={inputClass}
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className={`${buttonClass("secondary")} w-full sm:w-auto`}
      >
        {pending ? PROFILE_TEXTS.adding : PROFILE_TEXTS.addInternship}
      </button>
    </form>
  );
}
