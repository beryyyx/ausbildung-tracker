import Link from "next/link";

import { buttonClass } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ApplicationsTable } from "@/features/applications/components/applications-table";
import { FilterBar } from "@/features/applications/components/filter-bar";
import {
  isFilterActive,
  parseApplicationFilter,
} from "@/features/applications/filters";
import { LIST_LABELS } from "@/features/applications/labels";
import { listApplications } from "@/features/applications/queries";
import { pluralize } from "@/lib/plural";

// Данные меняются между запросами, страницу нельзя запекать при сборке.
export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filter = parseApplicationFilter(await searchParams);
  const { items, counts, total } = await listApplications(filter);
  const filtered = isFilterActive(filter);

  const subtitle =
    total === 0
      ? "Пока ничего нет"
      : filtered
        ? `${LIST_LABELS.shown} ${items.length} ${LIST_LABELS.of} ${total}`
        : `${total} ${pluralize(total, ["заявка", "заявки", "заявок"])}`;

  return (
    <div className="space-y-stack">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Заявки</h1>
          <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>
        </div>
        <Link href="/applications/new" className={buttonClass("primary")}>
          {LIST_LABELS.newApplication}
        </Link>
      </div>

      {total === 0 ? (
        <EmptyState
          title={LIST_LABELS.emptyTitle}
          hint={LIST_LABELS.emptyHint}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/applications/new" className={buttonClass("primary")}>
                {LIST_LABELS.addFirst}
              </Link>
              <Link href="/suche" className={buttonClass("secondary")}>
                {LIST_LABELS.goSearch}
              </Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          <FilterBar filter={filter} counts={counts} />
          {items.length === 0 ? (
            <EmptyState
              title={LIST_LABELS.nothingFoundTitle}
              hint={LIST_LABELS.nothingFoundHint}
              action={
                <Link href="/" className={buttonClass("secondary")}>
                  {LIST_LABELS.reset}
                </Link>
              }
            />
          ) : (
            <ApplicationsTable items={items} />
          )}
        </div>
      )}
    </div>
  );
}
