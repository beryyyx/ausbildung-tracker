import type { Metadata } from "next";
import Link from "next/link";

import { buttonClass } from "@/components/button";
import { Panel } from "@/components/panel";
import { ResultsList } from "@/features/jobsearch/components/results-list";
import { SearchForm } from "@/features/jobsearch/components/search-form";
import { SEARCH_LABELS, SOURCE_ERROR_MESSAGES } from "@/features/jobsearch/labels";
import { runJobSearch } from "@/features/jobsearch/search";
import { buildSearchHref, parseSearchParams } from "@/features/jobsearch/search-params";

// Каждый запрос идёт в живой API и в базу, страницу нельзя запекать при сборке.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: SEARCH_LABELS.title };

export default async function SearchPage({ searchParams }: PageProps<"/suche">) {
  const query = parseSearchParams(await searchParams);
  const outcome = await runJobSearch(query);

  return (
    <div className="space-y-stack">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{SEARCH_LABELS.title}</h1>
        <p className="mt-1 text-sm text-fg-muted">{SEARCH_LABELS.subtitle}</p>
      </div>

      <Panel>
        <SearchForm query={query} />
      </Panel>

      {outcome.ok ? (
        <ResultsList result={outcome.result} existing={outcome.existing} query={query} />
      ) : (
        <div
          role="alert"
          className="rounded-lg border border-danger-edge bg-danger-soft p-card text-sm text-danger"
        >
          <p className="font-medium">{SEARCH_LABELS.errorTitle}</p>
          <p className="mt-1">{SOURCE_ERROR_MESSAGES[outcome.kind]}</p>
          <Link href={buildSearchHref(query)} className={`mt-4 ${buttonClass("danger", "sm")}`}>
            {SEARCH_LABELS.retry}
          </Link>
        </div>
      )}
    </div>
  );
}
