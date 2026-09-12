"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { importJobListing, type ImportResult } from "../actions";
import { SEARCH_LABELS } from "../labels";
import type { JobListing } from "../types";

export function ImportButton({
  listing,
  existingId,
}: {
  listing: JobListing;
  /** id заявки, если вакансия уже импортирована. */
  existingId?: number;
}) {
  const [result, setResult] = useState<ImportResult | null>(
    existingId === undefined
      ? null
      : { status: "exists", applicationId: existingId },
  );
  const [pending, startTransition] = useTransition();

  if (result?.status === "created" || result?.status === "exists") {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm">
        <span
          className={
            result.status === "created"
              ? "font-medium text-success"
              : "text-fg-muted"
          }
        >
          {result.status === "created"
            ? SEARCH_LABELS.imported
            : SEARCH_LABELS.alreadyImported}
        </span>
        <Link
          href={`/applications/${result.applicationId}`}
          className="text-fg underline hover:text-fg"
        >
          {SEARCH_LABELS.open}
        </Link>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            setResult(await importJobListing(listing));
          });
        }}
        className="whitespace-nowrap rounded-md border border-edge bg-surface px-3 py-1.5 text-sm font-medium text-fg hover:bg-surface-hover disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? SEARCH_LABELS.importing : SEARCH_LABELS.import}
      </button>
      {result?.status === "error" && (
        <p className="text-xs text-danger" role="alert">
          {result.message}
        </p>
      )}
    </div>
  );
}
