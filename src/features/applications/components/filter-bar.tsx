import { Search } from "lucide-react";
import Link from "next/link";

import { buttonClass } from "@/components/button";

import { isFilterActive, type ApplicationFilter } from "../filters";
import { LIST_LABELS } from "../labels";
import { StatusBadge } from "./status-badge";

/**
 * Обычная GET-форма без JavaScript: фильтры попадают в адрес страницы,
 * поэтому список можно обновить или сохранить в закладки. Статус выбирается
 * кликом по стадии воронки; здесь он только показан и передаётся дальше
 * скрытыми полями, чтобы поиск его не сбрасывал.
 */
export function FilterBar({ filter }: { filter: ApplicationFilter }) {
  return (
    <form
      method="get"
      action="/"
      className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center"
    >
      {filter.statuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-fg-muted">{LIST_LABELS.statusFilter}:</span>
          {filter.statuses.map((status) => (
            <span key={status}>
              <input type="hidden" name="status" value={status} />
              <StatusBadge status={status} />
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={filter.q}
          placeholder={LIST_LABELS.searchPlaceholder}
          aria-label={LIST_LABELS.search}
          className="min-w-0 flex-1 rounded-md border border-edge bg-surface px-3 py-1.5 outline-none transition-[border-color,box-shadow] placeholder:text-fg-subtle hover:border-neutral-edge focus:border-accent focus:ring-1 focus:ring-accent sm:w-80 sm:flex-none"
        />
        <button type="submit" className={buttonClass("primary", "sm")}>
          <Search aria-hidden size={14} />
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
