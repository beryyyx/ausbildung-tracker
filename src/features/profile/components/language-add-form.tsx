"use client";

import { useActionState } from "react";

import { buttonClass } from "@/components/button";
import { Field, inputClass } from "@/components/form/field";
import { FormMessage } from "@/components/form/form-message";

import { LANGUAGE_FIELD_LABELS, LANGUAGE_LEVEL_LABELS, PROFILE_TEXTS } from "../labels";
import type { LanguageField, LanguageFormState } from "../validation";

type Props = {
  action: (
    state: LanguageFormState,
    formData: FormData,
  ) => Promise<LanguageFormState>;
};

/** Строка добавления языка: язык, уровень, кнопка. */
export function LanguageAddForm({ action }: Props) {
  const [state, formAction, pending] = useActionState<LanguageFormState, FormData>(
    action,
    {},
  );
  const errorOf = (field: LanguageField) => state.errors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-2" noValidate>
      {state.message && <FormMessage kind="error">{state.message}</FormMessage>}
      <div className="grid grid-cols-[1fr_8rem] gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
        <Field
          name="language"
          label={LANGUAGE_FIELD_LABELS.language}
          error={errorOf("language")}
          className="min-w-0"
        >
          <input
            id="language"
            name="language"
            type="text"
            required
            defaultValue={state.values?.language ?? ""}
            placeholder="например, Deutsch"
            aria-invalid={Boolean(errorOf("language"))}
            className={inputClass}
          />
        </Field>
        <Field name="level" label={LANGUAGE_FIELD_LABELS.level} error={errorOf("level")}>
          <select
            id="level"
            name="level"
            defaultValue={state.values?.level ?? "b2"}
            aria-invalid={Boolean(errorOf("level"))}
            className={inputClass}
          >
            {Object.entries(LANGUAGE_LEVEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
          {pending ? PROFILE_TEXTS.adding : PROFILE_TEXTS.addLanguage}
        </button>
      </div>
    </form>
  );
}
