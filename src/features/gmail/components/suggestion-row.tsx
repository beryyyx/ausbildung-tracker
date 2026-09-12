"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { inputClass } from "@/components/form/field";
import type { GmailMessage } from "@/db/schema";
import { STATUS_LABELS } from "@/features/applications/labels";
import { formatDateTime } from "@/lib/dates";

import { applySuggestion, dismissSuggestion, noteSuggestion } from "../actions";
import { GMAIL_TEXTS, formatSender, multipleCandidatesText } from "../labels";
import type { ApplicationOption } from "../types";

type Props = {
  message: GmailMessage;
  /** Заявки, подходящие по правилам сопоставления. Может быть пусто или несколько. */
  candidateIds: number[];
  applications: ApplicationOption[];
};

function optionLabel(application: ApplicationOption): string {
  const place = application.city ? `, ${application.city}` : "";
  return `${application.company} — ${application.position}${place} (${STATUS_LABELS[application.status]})`;
}

/**
 * Одно предложение: письмо, выбор заявки и статуса, три действия. «Применить»
 * меняет статус заявки, «Учесть без смены статуса» только записывает письмо
 * в заметки заявки, «Не про заявку» убирает письмо. Заявка предвыбрана,
 * только если подошла ровно одна. При нескольких кандидатах выбор за пользователем.
 */
export function SuggestionRow({ message, candidateIds, applications }: Props) {
  const [applicationId, setApplicationId] = useState<string>(
    candidateIds.length === 1 ? String(candidateIds[0]) : "",
  );
  const [status, setStatus] = useState<string>(message.suggestedStatus ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const candidateSet = new Set(candidateIds);
  const candidates = applications.filter((application) => candidateSet.has(application.id));
  const others = applications.filter((application) => !candidateSet.has(application.id));

  const candidatesHint =
    candidates.length === 0
      ? GMAIL_TEXTS.noCandidate
      : candidates.length === 1
        ? GMAIL_TEXTS.singleCandidate
        : multipleCandidatesText(candidates.length);
  const statusHint = message.suggestedStatus
    ? `${GMAIL_TEXTS.suggestedPrefix}: ${STATUS_LABELS[message.suggestedStatus]}`
    : GMAIL_TEXTS.suggestedUnknown;

  const sender = formatSender(message);

  const run = (call: () => Promise<{ ok: true } | { ok: false; message: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await call();
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <li className="space-y-3 px-4 py-4">
      <div className="min-w-0">
        <p className="text-xs text-fg-muted">
          {formatDateTime(message.receivedAt)} · {GMAIL_TEXTS.from} {sender}
        </p>
        <p className="font-medium text-fg">
          {message.subject || GMAIL_TEXTS.noSubject}
        </p>
        <p className="mt-1 text-xs text-fg-muted">
          {candidatesHint}. {statusHint}.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-medium text-fg">
          {GMAIL_TEXTS.application}
          <select
            value={applicationId}
            disabled={pending}
            onChange={(event) => setApplicationId(event.target.value)}
            className={inputClass}
          >
            <option value="">{GMAIL_TEXTS.chooseApplication}</option>
            {candidates.length > 0 && (
              <optgroup label={GMAIL_TEXTS.candidatesGroup}>
                {candidates.map((application) => (
                  <option key={application.id} value={application.id}>
                    {optionLabel(application)}
                  </option>
                ))}
              </optgroup>
            )}
            {others.length > 0 && (
              <optgroup label={GMAIL_TEXTS.othersGroup}>
                {others.map((application) => (
                  <option key={application.id} value={application.id}>
                    {optionLabel(application)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <label className="block text-sm font-medium text-fg sm:w-48">
          {GMAIL_TEXTS.status}
          <select
            value={status}
            disabled={pending}
            onChange={(event) => setStatus(event.target.value)}
            className={inputClass}
          >
            <option value="">{GMAIL_TEXTS.chooseStatus}</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pending || !applicationId || !status}
            onClick={() =>
              run(() => applySuggestion(message.id, Number(applicationId), status))
            }
            className="rounded-md bg-accent px-3 py-control text-sm font-medium text-accent-on hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? GMAIL_TEXTS.applying : GMAIL_TEXTS.apply}
          </button>
          <button
            type="button"
            disabled={pending || !applicationId}
            onClick={() => run(() => noteSuggestion(message.id, Number(applicationId)))}
            className="rounded-md border border-edge bg-surface px-3 py-control text-sm font-medium text-fg hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {GMAIL_TEXTS.note}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => dismissSuggestion(message.id))}
            className="rounded-md border border-edge bg-surface px-3 py-control text-sm font-medium text-fg hover:bg-surface-hover disabled:cursor-wait disabled:opacity-60"
          >
            {GMAIL_TEXTS.notRelated}
          </button>
        </div>
      </div>

      {applicationId && (
        <Link
          href={`/applications/${applicationId}`}
          className="text-xs text-fg-muted underline-offset-2 hover:underline"
        >
          {GMAIL_TEXTS.openApplication}
        </Link>
      )}

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
