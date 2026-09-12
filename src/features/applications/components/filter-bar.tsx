import Link from "next/link";

import { APPLICATION_STATUSES, type ApplicationStatus } from "@/db/schema";

import { isFilterActive, type ApplicationFilter } from "../filters";
import { LIST_LABELS, STATUS_LABELS } from "../labels";

/**
 * Обычная GET-форма без JavaScript: фильтры попадают в адрес страницы,
 * поэтому список можно обновить или сохранить в закладки.
 */
export function FilterBar({
  filter,
  counts,
}: {
  filter: ApplicationFilter;
  counts: Record<ApplicationStatus, number>;
}) {
  return (
    <form
      method="get"
      action="/"
      className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm"
    >
      <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <legend className="sr-only">{LIST_LABELS.statusFilter}</legend>
        {APPLICATION_STATUSES.map((status) => (
          <label key={status} className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              name="status"
              value={status}
              defaultChecked={filter.statuses.includes(status)}
              className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
            />
            <span className="text-zinc-700">{STATUS_LABELS[status]}</span>
            <span className="text-xs text-zinc-400">{counts[status]}</span>
          </label>
        ))}
      </fieldset>

      <input
        type="search"
        name="q"
        defaultValue={filter.q}
        placeholder={LIST_LABELS.searchPlaceholder}
        aria-label={LIST_LABELS.search}
        className="min-w-[14rem] flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
      />

      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-700"
      >
        {LIST_LABELS.apply}
      </button>

      {isFilterActive(filter) && (
        <Link href="/" className="text-zinc-500 hover:text-zinc-900">
          {LIST_LABELS.reset}
        </Link>
      )}
    </form>
  );
}
