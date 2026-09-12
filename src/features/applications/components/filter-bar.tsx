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
      className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-edge bg-surface px-4 py-row text-sm shadow-card"
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
              className="h-4 w-4 rounded border-edge accent-accent"
            />
            <span className="text-fg">{STATUS_LABELS[status]}</span>
            <span className="text-xs text-fg-subtle">{counts[status]}</span>
          </label>
        ))}
      </fieldset>

      <input
        type="search"
        name="q"
        defaultValue={filter.q}
        placeholder={LIST_LABELS.searchPlaceholder}
        aria-label={LIST_LABELS.search}
        className="min-w-[14rem] flex-1 rounded-md border border-edge bg-surface px-3 py-1.5 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />

      <button
        type="submit"
        className="rounded-md bg-accent px-3 py-1.5 font-medium text-accent-on hover:bg-accent-hover"
      >
        {LIST_LABELS.apply}
      </button>

      {isFilterActive(filter) && (
        <Link href="/" className="text-fg-muted hover:text-fg">
          {LIST_LABELS.reset}
        </Link>
      )}
    </form>
  );
}
