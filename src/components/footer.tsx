import { CalendarDays, ExternalLink, Home, Target } from "lucide-react";

import { formatDate } from "@/lib/dates";
import {
  BOFROST_APPLY_FROM,
  BOFROST_CAREERS_URL,
  HOME_TOWN,
  MAX_COMMUTE_MINUTES,
  TARGET_START,
  monthsFromToday,
} from "@/lib/goals";
import { pluralize } from "@/lib/plural";

const ICON = "mr-1.5 inline-block align-[-2px] text-fg-subtle";

/** «· через N месяцев», пусто, если дата уже наступила. */
function inMonths(iso: string) {
  const months = monthsFromToday(iso);
  if (months <= 0) return null;
  return (
    <span className="text-fg-subtle">
      {" "}· через {months} {pluralize(months, ["месяц", "месяца", "месяцев"])}
    </span>
  );
}

/** Подвал: ориентиры из критериев поиска. Прижат к низу, чтобы под короткой страницей не было пустоты. */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-edge bg-surface">
      <ul className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-4 py-4 text-sm text-fg-muted">
        <li>
          <Target aria-hidden size={14} className={ICON} />
          Старт Ausbildung: <span className="text-fg">{formatDate(TARGET_START)}</span>
          {inMonths(TARGET_START)}
        </li>
        <li>
          <CalendarDays aria-hidden size={14} className={ICON} />
          Bofrost принимает заявки с <span className="text-fg">{formatDate(BOFROST_APPLY_FROM)}</span>
          {inMonths(BOFROST_APPLY_FROM)}
          <a
            href={BOFROST_CAREERS_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-1.5 rounded-sm text-accent-fg outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
          >
            karriere.bofrost.de
            <ExternalLink aria-hidden size={12} className="ml-0.5 inline-block align-[-1px]" />
          </a>
        </li>
        <li>
          <Home aria-hidden size={14} className={ICON} />
          Дом: <span className="text-fg">{HOME_TOWN}</span> · дорога до {MAX_COMMUTE_MINUTES} мин
        </li>
      </ul>
    </footer>
  );
}
