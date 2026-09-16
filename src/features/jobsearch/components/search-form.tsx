import { buttonClass } from "@/components/button";
import { Field, inputClass } from "@/components/form/field";

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
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_2fr_1fr_1.3fr_auto] lg:items-end"
    >
      <Field name="was" label={SEARCH_LABELS.what}>
        <input
          id="was"
          name="was"
          type="text"
          defaultValue={query.what}
          className={inputClass}
          placeholder="Fachinformatiker"
        />
      </Field>

      <Field name="wo" label={SEARCH_LABELS.where}>
        <input
          id="wo"
          name="wo"
          type="text"
          defaultValue={query.where}
          className={inputClass}
          placeholder="Straelen"
        />
      </Field>

      <Field name="umkreis" label={SEARCH_LABELS.radius}>
        <select id="umkreis" name="umkreis" defaultValue={query.radiusKm} className={inputClass}>
          {RADIUS_OPTIONS.map((km) => (
            <option key={km} value={km}>
              {km} км
            </option>
          ))}
        </select>
      </Field>

      <Field name="start" label={SEARCH_LABELS.startFrom}>
        <input
          id="start"
          name="start"
          type="date"
          defaultValue={query.startFrom ?? ""}
          className={inputClass}
        />
      </Field>

      <button type="submit" className={`${buttonClass("primary")} sm:col-span-2 lg:col-span-1`}>
        {SEARCH_LABELS.submit}
      </button>
    </form>
  );
}
