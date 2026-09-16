import Link from "next/link";

import { Badge } from "@/components/badge";
import { buttonClass } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { panelClass } from "@/components/panel";
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
    return <EmptyState title={SEARCH_LABELS.emptyTitle} hint={SEARCH_LABELS.emptyHint} />;
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

      <ul className={`${panelClass} divide-y divide-edge-muted`}>
        {result.listings.map((listing) => (
          <li
            key={listing.refnr}
            className="flex flex-col gap-3 px-card py-item transition-colors hover:bg-surface-hover sm:flex-row sm:items-start sm:justify-between"
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

  return <p className="text-sm text-fg-muted">{parts.join(" · ")}</p>;
}

function ListingCard({ listing }: { listing: JobListing }) {
  const specializations = detectSpecializations(listing.title, listing.profession);
  const place = [listing.city, listing.postalCode].filter(Boolean).join(" ");

  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <a
        href={listing.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-sm font-medium text-fg outline-none hover:text-accent-fg hover:underline focus-visible:ring-2 focus-visible:ring-accent"
      >
        {listing.title}
      </a>

      {(listing.kind === "duales-studium" ||
        specializations.length > 0 ||
        listing.startDate === null) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {listing.kind === "duales-studium" && (
            <Badge className="border-purple-edge bg-purple-soft text-purple">
              {JOB_KIND_LABELS[listing.kind]}
            </Badge>
          )}
          {specializations.map((code) => (
            <Badge key={code} dot className={SPECIALIZATION_STYLES[code]}>
              {code} · {SPECIALIZATION_LABELS[code]}
            </Badge>
          ))}
          {listing.startDate === null && (
            <Badge className="border-neutral-edge bg-neutral-soft text-neutral">
              {SEARCH_LABELS.undated}
            </Badge>
          )}
        </div>
      )}

      <p className="text-sm text-fg-muted">
        <span className="text-fg">{listing.company ?? SEARCH_LABELS.noCompany}</span>
        {place && <> · {place}</>}
        {listing.distanceKm !== null && (
          <>
            {" "}
            · {listing.distanceKm} {SEARCH_LABELS.distance}
          </>
        )}
      </p>

      <p className="text-xs text-fg-subtle">
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

  const linkClass = buttonClass("secondary", "sm");

  return (
    <nav
      className="flex items-center justify-between text-sm text-fg-muted"
      aria-label={SEARCH_LABELS.pages}
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
