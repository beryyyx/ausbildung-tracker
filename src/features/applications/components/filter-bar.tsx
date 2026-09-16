import Link from "next/link";

import { buttonClass } from "@/components/button";
import { panelClass } from "@/components/panel";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/db/schema";

import { isFilterActive, type ApplicationFilter } from "../filters";
import { LIST_LABELS, STATUS_DOT_STYLES, STATUS_LABELS } from "../labels";

/**
 * Обычная GET-форма без JavaScript: фильтры попадают в адрес страницы,
 * поэтому список можно обновить или сохранить в закладки. Статусы — чипы:
 * сам checkbox скрыт, выбранный чип подсвечен через peer-checked.
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
      className={`${panelClass} flex flex-col gap-3 px-4 py-item text-sm md:flex-row md:items-center`}
    >
      <fieldset className="flex flex-wrap items-center gap-1.5">
        <legend className="sr-only">{LIST_LABELS.statusFilter}</legend>
        {APPLICATION_STATUSES.map((status) => (
          <label key={status} className="cursor-pointer">
            <input
              type="checkbox"
              name="status"
              value={status}
              defaultChecked={filter.statuses.includes(status)}
              className="peer sr-only"
            />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-2.5 py-1 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent-fg peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface">
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_STYLES[status]}`} />
              {STATUS_LABELS[status]}
              <span className="tabular-nums text-fg-subtle">{counts[status]}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex items-center gap-2 md:ml-auto">
        <input
          type="search"
          name="q"
          defaultValue={filter.q}
          placeholder={LIST_LABELS.searchPlaceholder}
          aria-label={LIST_LABELS.search}
          className="min-w-0 flex-1 rounded-md border border-edge bg-surface px-3 py-1.5 outline-none transition-[border-color,box-shadow] placeholder:text-fg-subtle hover:border-neutral-edge focus:border-accent focus:ring-1 focus:ring-accent md:w-60 md:flex-none"
        />
        <button type="submit" className={buttonClass("primary", "sm")}>
          {LIST_LABELS.apply}
        </button>
        {isFilterActive(filter) && (
          <Link href="/" className={buttonClass("ghost", "sm")}>
            {LIST_LABELS.reset}
          </Link>
        )}
      </div>
    </form>
  );
}
