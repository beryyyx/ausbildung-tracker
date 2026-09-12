import { inputClass } from "@/components/form/field";

import { SEARCH_LABELS } from "../labels";
import { RADIUS_OPTIONS } from "../search-params";
import type { JobSearchQuery } from "../types";

/**
 * Обычная GET-форма без JavaScript: параметры попадают в адрес страницы,
 * поэтому поиск можно обновить или сохранить в закладки.
 */
export function SearchForm({ query }: { query: JobSearchQuery }) {
  return (
    <form
      method="get"
      action="/suche"
      className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr_1.3fr_auto] sm:items-end"
    >
      <label className="block text-sm font-medium text-fg">
        {SEARCH_LABELS.what}
        <input
          name="was"
          type="text"
          defaultValue={query.what}
          className={inputClass}
          placeholder="Fachinformatiker"
        />
      </label>

      <label className="block text-sm font-medium text-fg">
        {SEARCH_LABELS.where}
        <input
          name="wo"
          type="text"
          defaultValue={query.where}
          className={inputClass}
          placeholder="Straelen"
        />
      </label>

      <label className="block text-sm font-medium text-fg">
        {SEARCH_LABELS.radius}
        <select name="umkreis" defaultValue={query.radiusKm} className={inputClass}>
          {RADIUS_OPTIONS.map((km) => (
            <option key={km} value={km}>
              {km} км
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-fg">
        {SEARCH_LABELS.startFrom}
        <input
          name="start"
          type="date"
          defaultValue={query.startFrom ?? ""}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-accent px-4 py-control text-sm font-medium text-accent-on hover:bg-accent-hover"
      >
        {SEARCH_LABELS.submit}
      </button>
    </form>
  );
}
