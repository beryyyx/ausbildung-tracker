"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { buttonClass } from "@/components/button";
import { Field, inputClass } from "@/components/form/field";
import type { GmailMessage } from "@/db/schema";
import { StatusBadge } from "@/features/applications/components/status-badge";
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

  const sender = formatSender(message);
  const applicationFieldId = `suggestion-${message.id}-application`;
  const statusFieldId = `suggestion-${message.id}-status`;

  const run = (call: () => Promise<{ ok: true } | { ok: false; message: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await call();
      if (!result.ok) setError(result.message);
    });
  };

  return (
    <li className={`space-y-3 px-card py-item ${pending ? "opacity-70" : ""}`} aria-busy={pending}>
      <div className="min-w-0 space-y-1">
        <p className="truncate text-xs text-fg-subtle" title={sender}>
          {formatDateTime(message.receivedAt)} · {GMAIL_TEXTS.from} {sender}
        </p>
        <p className="font-medium text-fg">{message.subject || GMAIL_TEXTS.noSubject}</p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-muted">
          <span>{candidatesHint}.</span>
          {message.suggestedStatus ? (
            <span className="inline-flex items-center gap-1.5">
              {GMAIL_TEXTS.suggestedPrefix}: <StatusBadge status={message.suggestedStatus} />
            </span>
          ) : (
            <span>{GMAIL_TEXTS.suggestedUnknown}.</span>
          )}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <Field name={applicationFieldId} label={GMAIL_TEXTS.application}>
          <select
            id={applicationFieldId}
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
        </Field>

        <Field name={statusFieldId} label={GMAIL_TEXTS.status}>
          <select
            id={statusFieldId}
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
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending || !applicationId || !status}
          onClick={() => run(() => applySuggestion(message.id, Number(applicationId), status))}
          className={buttonClass("primary", "sm")}
        >
          {pending ? GMAIL_TEXTS.applying : GMAIL_TEXTS.apply}
        </button>
        <button
          type="button"
          disabled={pending || !applicationId}
          onClick={() => run(() => noteSuggestion(message.id, Number(applicationId)))}
          className={buttonClass("secondary", "sm")}
        >
          {GMAIL_TEXTS.note}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => dismissSuggestion(message.id))}
          className={buttonClass("ghost", "sm")}
        >
          {GMAIL_TEXTS.notRelated}
        </button>
        {applicationId && (
          <Link
            href={`/applications/${applicationId}`}
            className="ml-auto text-xs text-accent-fg underline-offset-2 hover:underline"
          >
            {GMAIL_TEXTS.openApplication}
          </Link>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
