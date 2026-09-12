"use client";

import { useActionState } from "react";

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
      <div className="flex items-end gap-3">
        <Field name="file" label={FILE_FIELD_LABELS.file} error={error} className="flex-1">
          <input
            id="file"
            name="file"
            type="file"
            accept="application/pdf,.pdf"
            required
            aria-invalid={Boolean(error)}
            className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-surface-muted file:px-2 file:py-1 file:text-sm`}
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-3 py-control text-sm font-medium text-accent-on hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? PROFILE_TEXTS.uploading : PROFILE_TEXTS.upload}
        </button>
      </div>
      <p className="text-xs text-fg-muted">{PROFILE_TEXTS.filesHint}</p>
    </form>
  );
}
