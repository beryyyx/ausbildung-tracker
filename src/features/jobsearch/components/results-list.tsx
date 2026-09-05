import Link from "next/link";

import { formatDate } from "@/lib/dates";
import { pluralize } from "@/lib/plural";

import {
  JOB_KIND_LABELS,
  SEARCH_LABELS,
  SPECIALIZATION_LABELS,
  SPECIALIZATION_STYLES,
} from "../labels";
import type { SearchPage } from "../search";
import { buildSearchHref } from "../search-params";
import { detectSpecializations } from "../specialization";
import type { JobListing, JobSearchQuery } from "../types";
import { ImportButton } from "./import-button";

export function ResultsList({
  result,
  existing,
  query,
}: {
  result: SearchPage;
  /** refnr → id заявки для уже импортированных вакансий. */
  existing: Map<string, number>;
  query: JobSearchQuery;
}) {
  if (result.sourceTotal === 0) {
    return (
      <EmptyState title={SEARCH_LABELS.emptyTitle} hint={SEARCH_LABELS.emptyHint} />
    );
  }

  if (result.listings.length === 0) {
    return (
      <EmptyState
        title={SEARCH_LABELS.noneAfterDate}
        hint={`${SEARCH_LABELS.sourceFound} ${result.sourceTotal} ${pluralize(result.sourceTotal, ["вакансию", "вакансии", "вакансий"])}, ${SEARCH_LABELS.allStartEarlier}${query.startFrom ? ` ${formatDate(query.startFrom)}` : ""}. ${SEARCH_LABELS.moveDateHint}`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Summary result={result} query={query} />

      <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white shadow-sm">
        {result.listings.map((listing) => (
          <li
            key={listing.refnr}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <ListingCard listing={listing} />
            <ImportButton listing={listing} existingId={existing.get(listing.refnr)} />
          </li>
        ))}
      </ul>

      <Pagination query={query} page={result.page} totalPages={result.totalPages} />
    </div>
  );
}

function Summary({ result, query }: { result: SearchPage; query: JobSearchQuery }) {
  const parts = [
    `${SEARCH_LABELS.sourceFound} ${result.sourceTotal} ${pluralize(result.sourceTotal, ["вакансию", "вакансии", "вакансий"])}`,
    result.sourceTotal > result.fetched
      ? `${SEARCH_LABELS.truncated} ${result.fetched}`
      : null,
    query.startFrom
      ? `${SEARCH_LABELS.matchingFrom} ${formatDate(query.startFrom)}: ${result.matching}`
      : `${SEARCH_LABELS.withDate}: ${result.matching}`,
    `${SEARCH_LABELS.withoutDate}: ${result.undated}`,
    result.resolvedLocation
      ? `${SEARCH_LABELS.searchingAround} ${result.resolvedLocation}, ${query.radiusKm} км`
      : null,
  ].filter(Boolean);

  return <p className="text-sm text-zinc-500">{parts.join(" · ")}</p>;
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
      <p className="text-lg font-medium text-zinc-900">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{hint}</p>
    </div>
  );
}

function ListingCard({ listing }: { listing: JobListing }) {
  const specializations = detectSpecializations(listing.title, listing.profession);
  const place = [listing.city, listing.postalCode].filter(Boolean).join(" ");

  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {listing.kind === "duales-studium" && (
          <Badge className="border-violet-200 bg-violet-50 text-violet-700">
            {JOB_KIND_LABELS[listing.kind]}
          </Badge>
        )}
        {specializations.map((code) => (
          <Badge key={code} className={SPECIALIZATION_STYLES[code]}>
            {code} · {SPECIALIZATION_LABELS[code]}
          </Badge>
        ))}
        {listing.startDate === null && (
          <Badge className="border-zinc-200 bg-zinc-100 text-zinc-500">
            {SEARCH_LABELS.undated}
          </Badge>
        )}
        <a
          href={listing.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-zinc-900 hover:underline"
        >
          {listing.title}
        </a>
      </div>

      <p className="text-sm text-zinc-700">
        {listing.company ?? "Компания не указана"}
        {place && <> · {place}</>}
        {listing.distanceKm !== null && (
          <>
            {" "}
            · {listing.distanceKm} {SEARCH_LABELS.distance}
          </>
        )}
      </p>

      <p className="text-xs text-zinc-500">
        {listing.profession && (
          <>
            {SEARCH_LABELS.profession}: {listing.profession}
          </>
        )}
        {listing.startDate && (
          <>
            {listing.profession && " · "}
            {SEARCH_LABELS.start} {formatDate(listing.startDate)}
          </>
        )}
        {listing.publishedAt && (
          <> · {SEARCH_LABELS.published} {formatDate(listing.publishedAt)}</>
        )}
      </p>
    </div>
  );
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function Pagination({
  query,
  page,
  totalPages,
}: {
  query: JobSearchQuery;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const linkClass =
    "rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50";

  return (
    <nav
      className="flex items-center justify-between text-sm text-zinc-500"
      aria-label="Страницы"
    >
      {page > 1 ? (
        <Link href={buildSearchHref(query, { page: page - 1 })} className={linkClass}>
          {SEARCH_LABELS.previous}
        </Link>
      ) : (
        <span />
      )}
      <span>
        {SEARCH_LABELS.page} {page} из {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildSearchHref(query, { page: page + 1 })} className={linkClass}>
          {SEARCH_LABELS.next}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
