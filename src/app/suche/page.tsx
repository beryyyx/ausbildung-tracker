import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{SEARCH_LABELS.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{SEARCH_LABELS.subtitle}</p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <SearchForm query={query} />
      </div>

      {outcome.ok ? (
        <ResultsList result={outcome.result} existing={outcome.existing} query={query} />
      ) : (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
        >
          <p className="font-medium">{SEARCH_LABELS.errorTitle}</p>
          <p className="mt-1">{SOURCE_ERROR_MESSAGES[outcome.kind]}</p>
          <Link
            href={buildSearchHref(query)}
            className="mt-3 inline-block rounded-md border border-red-300 bg-white px-3 py-1.5 font-medium text-red-700 hover:bg-red-100"
          >
            {SEARCH_LABELS.retry}
          </Link>
        </div>
      )}
    </div>
  );
}
