import Link from "next/link";

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
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Заявки</h1>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <Link
          href="/applications/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Новая заявка
        </Link>
      </div>

      {total === 0 ? (
        <EmptyState />
      ) : (
        <>
          <FilterBar filter={filter} counts={counts} />
          {items.length === 0 ? <NothingFound /> : <ApplicationsTable items={items} />}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
      <p className="text-lg font-medium text-zinc-900">Заявок пока нет</p>
      <p className="mt-1 text-sm text-zinc-500">
        Добавьте первую заявку, чтобы начать отслеживать ответы и дедлайны.
      </p>
      <Link
        href="/applications/new"
        className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Добавить заявку
      </Link>
    </div>
  );
}

/** Заявки есть, но под фильтры ни одна не подошла. */
function NothingFound() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
      <p className="text-lg font-medium text-zinc-900">{LIST_LABELS.nothingFoundTitle}</p>
      <p className="mt-1 text-sm text-zinc-500">{LIST_LABELS.nothingFoundHint}</p>
      <Link href="/" className="mt-4 inline-block text-sm text-zinc-700 underline hover:text-zinc-900">
        {LIST_LABELS.reset}
      </Link>
    </div>
  );
}
