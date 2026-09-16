"use client";

import { useActionState } from "react";

import { buttonClass } from "@/components/button";
import { Field, inputClass } from "@/components/form/field";
import { FormMessage } from "@/components/form/form-message";

import { FILE_FIELD_LABELS, PROFILE_TEXTS } from "../labels";
import type { UploadFormState } from "../validation";

type Props = {
  action: (state: UploadFormState, formData: FormData) => Promise<UploadFormState>;
};

/** Загрузка одного PDF. Проверка типа и размера идёт на сервере. */
export function FileUploadForm({ action }: Props) {
  const [state, formAction, pending] = useActionState<UploadFormState, FormData>(
    action,
    {},
  );
  const error = state.errors?.file?.[0];

  return (
    <form action={formAction} className="space-y-2" noValidate>
      {state.message && <FormMessage kind="error">{state.message}</FormMessage>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field name="file" label={FILE_FIELD_LABELS.file} error={error} className="min-w-0 flex-1">
          <input
            id="file"
            name="file"
            type="file"
            accept="application/pdf,.pdf"
            required
            aria-invalid={Boolean(error)}
            className={`${inputClass} cursor-pointer file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-surface-muted file:px-2 file:py-0.5 file:text-sm file:font-medium file:text-fg`}
          />
        </Field>
        <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass("secondary")}>
          {pending ? PROFILE_TEXTS.uploading : PROFILE_TEXTS.upload}
        </button>
      </div>
      <p className="text-xs text-fg-subtle">{PROFILE_TEXTS.filesHint}</p>
    </form>
  );
}
