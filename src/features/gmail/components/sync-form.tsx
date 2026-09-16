"use client";

import { useActionState, type ReactNode } from "react";

import { buttonClass } from "@/components/button";
import { FormMessage } from "@/components/form/form-message";

import type { SyncFormState } from "../actions";
import { GMAIL_TEXTS, SYNC_ERROR_MESSAGES } from "../labels";
import type { SyncSummary } from "../types";

import { SyncSummaryView } from "./sync-summary";

type Props = {
  action: (state: SyncFormState, formData: FormData) => Promise<SyncFormState>;
  /** Итог прошлой синхронизации из базы, пока в этой сессии не запускали новую. */
  persisted: SyncSummary | null;
  /** Подключение истекло: синхронизировать нельзя, сначала подключить заново. */
  disabled?: boolean;
  /** Соседние кнопки в той же строке, например «Отключить». */
  actions?: ReactNode;
};

/** Кнопка «Синхронизировать» и итог: свежий после нажатия, иначе сохранённый. */
export function SyncForm({ action, persisted, disabled, actions }: Props) {
  const [state, formAction, pending] = useActionState<SyncFormState, FormData>(
    action,
    {},
  );

  const outcome = state.outcome;
  const summary = outcome?.ok ? outcome.summary : persisted;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <form action={formAction}>
          <button
            type="submit"
            disabled={pending || disabled}
            aria-busy={pending}
            className={buttonClass("primary")}
          >
            {pending ? GMAIL_TEXTS.syncing : GMAIL_TEXTS.sync}
          </button>
        </form>
        {actions}
      </div>

      {outcome && !outcome.ok && (
        <FormMessage kind="error">{SYNC_ERROR_MESSAGES[outcome.kind]}</FormMessage>
      )}
      {summary && <SyncSummaryView summary={summary} />}
    </div>
  );
}
