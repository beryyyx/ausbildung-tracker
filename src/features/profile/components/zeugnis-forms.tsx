"use client";

import { useActionState } from "react";

import { buttonClass } from "@/components/button";
import { Field, inputClass } from "@/components/form/field";
import { FormMessage } from "@/components/form/form-message";

import { GRADE_FIELD_LABELS, PROFILE_TEXTS, ZEUGNIS_FIELD_LABELS } from "../labels";
import type { GradeField, GradeFormState, ZeugnisFormState } from "../validation";

type ZeugnisTitleFormProps = {
  /** Server Action с уже привязанным слотом. */
  action: (
    state: ZeugnisFormState,
    formData: FormData,
  ) => Promise<ZeugnisFormState>;
  /** Уникальный префикс id полей: на странице две такие формы. */
  idPrefix: string;
  initialTitle: string;
};

/** Название Zeugnis, например «Klasse 10, Abschlusszeugnis 2026». */
export function ZeugnisTitleForm({
  action,
  idPrefix,
  initialTitle,
}: ZeugnisTitleFormProps) {
  const [state, formAction, pending] = useActionState<ZeugnisFormState, FormData>(
    action,
    {},
  );
  const title = state.values?.title ?? initialTitle;
  const error = state.errors?.title?.[0];
  const inputId = `${idPrefix}-title`;

  return (
    <form action={formAction} className="space-y-2" noValidate>
      {state.message && <FormMessage kind="error">{state.message}</FormMessage>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field
          name={inputId}
          label={ZEUGNIS_FIELD_LABELS.title}
          error={error}
          className="min-w-0 flex-1"
        >
          <input
            id={inputId}
            name="title"
            type="text"
            defaultValue={title}
            placeholder={PROFILE_TEXTS.zeugnisTitlePlaceholder}
            aria-invalid={Boolean(error)}
            className={inputClass}
          />
        </Field>
        <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass("secondary")}>
          {pending ? PROFILE_TEXTS.saving : PROFILE_TEXTS.save}
        </button>
      </div>
      {state.saved && !error && (
        <p className="text-sm text-success" role="status">
          {PROFILE_TEXTS.saved}
        </p>
      )}
    </form>
  );
}

type GradeAddFormProps = {
  /** Server Action с уже привязанным слотом. */
  action: (state: GradeFormState, formData: FormData) => Promise<GradeFormState>;
  idPrefix: string;
  /** Допустимые оценки для шкалы этого Zeugnis. */
  range: { min: number; max: number };
};

/** Строка добавления оценки: предмет, оценка, кнопка. */
export function GradeAddForm({ action, idPrefix, range }: GradeAddFormProps) {
  const [state, formAction, pending] = useActionState<GradeFormState, FormData>(
    action,
    {},
  );
  const errorOf = (field: GradeField) => state.errors?.[field]?.[0];
  const subjectId = `${idPrefix}-subject`;
  const gradeId = `${idPrefix}-grade`;

  const grades: number[] = [];
  for (let value = range.min; value <= range.max; value++) grades.push(value);

  return (
    <form action={formAction} className="space-y-2" noValidate>
      {state.message && <FormMessage kind="error">{state.message}</FormMessage>}
      <div className="grid grid-cols-[1fr_6rem] gap-3 sm:grid-cols-[1fr_6rem_auto] sm:items-end">
        <Field
          name={subjectId}
          label={GRADE_FIELD_LABELS.subject}
          error={errorOf("subject")}
          className="min-w-0"
        >
          <input
            id={subjectId}
            name="subject"
            type="text"
            required
            defaultValue={state.values?.subject ?? ""}
            placeholder="например, Informatik"
            aria-invalid={Boolean(errorOf("subject"))}
            className={inputClass}
          />
        </Field>
        <Field name={gradeId} label={GRADE_FIELD_LABELS.grade} error={errorOf("grade")}>
          <select
            id={gradeId}
            name="grade"
            defaultValue={state.values?.grade ?? String(range.min)}
            aria-invalid={Boolean(errorOf("grade"))}
            className={inputClass}
          >
            {grades.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={`${buttonClass("secondary")} col-span-2 sm:col-span-1`}
        >
          {pending ? PROFILE_TEXTS.adding : PROFILE_TEXTS.addGrade}
        </button>
      </div>
    </form>
  );
}
