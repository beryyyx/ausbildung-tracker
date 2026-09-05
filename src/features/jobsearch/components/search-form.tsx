import { SEARCH_LABELS } from "../labels";
import { RADIUS_OPTIONS } from "../search-params";
import type { JobSearchQuery } from "../types";

const inputClass =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500";

/**
 * Обычная GET-форма без JavaScript: параметры попадают в адрес страницы,
 * поэтому поиск можно обновить или сохранить в закладки.
 */
export function SearchForm({ query }: { query: JobSearchQuery }) {
  return (
    <form
      method="get"
      action="/suche"
      className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end"
    >
      <label className="block text-sm font-medium text-zinc-700">
        {SEARCH_LABELS.what}
        <input
          name="was"
          type="text"
          defaultValue={query.what}
          className={inputClass}
          placeholder="Fachinformatiker"
        />
      </label>

      <label className="block text-sm font-medium text-zinc-700">
        {SEARCH_LABELS.where}
        <input
          name="wo"
          type="text"
          defaultValue={query.where}
          className={inputClass}
          placeholder="Straelen"
        />
      </label>

      <label className="block text-sm font-medium text-zinc-700">
        {SEARCH_LABELS.radius}
        <select name="umkreis" defaultValue={query.radiusKm} className={inputClass}>
          {RADIUS_OPTIONS.map((km) => (
            <option key={km} value={km}>
              {km} км
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        {SEARCH_LABELS.submit}
      </button>
    </form>
  );
}
