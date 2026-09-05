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
              ? "font-medium text-emerald-700"
              : "text-zinc-500"
          }
        >
          {result.status === "created"
            ? SEARCH_LABELS.imported
            : SEARCH_LABELS.alreadyImported}
        </span>
        <Link
          href={`/applications/${result.applicationId}`}
          className="text-zinc-700 underline hover:text-zinc-900"
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
        className="whitespace-nowrap rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? SEARCH_LABELS.importing : SEARCH_LABELS.import}
      </button>
      {result?.status === "error" && (
        <p className="text-xs text-red-600" role="alert">
          {result.message}
        </p>
      )}
    </div>
  );
}
