"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { buttonClass } from "@/components/button";

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
      <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm">
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
          className={buttonClass("secondary", "sm")}
        >
          {SEARCH_LABELS.open}
        </Link>
      </span>
    );
  }

  return (
    <div className="flex shrink-0 flex-col gap-1 sm:items-end">
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={() => {
          startTransition(async () => {
            setResult(await importJobListing(listing));
          });
        }}
        className={`${buttonClass("secondary", "sm")} w-full sm:w-auto`}
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
