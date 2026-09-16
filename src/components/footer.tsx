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

const TEXTS = {
  start: "Старт Ausbildung",
  bofrost: "Bofrost принимает заявки с",
  home: "Дом",
  commute: "дорога до",
} as const;

/** Подвал: ориентиры из критериев поиска. Прижат к низу, чтобы под короткой страницей не было пустоты. */
export function Footer() {
  const startMonths = monthsFromToday(TARGET_START);
  const bofrostMonths = monthsFromToday(BOFROST_APPLY_FROM);

  return (
    <footer className="mt-auto border-t border-edge bg-surface">
      <ul className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-4 py-4 text-sm text-fg-muted">
        <li>
          <Target aria-hidden size={14} className="mr-1.5 inline-block align-[-2px] text-fg-subtle" />
          {TEXTS.start}: <span className="text-fg">{formatDate(TARGET_START)}</span>
          {startMonths > 0 && <Countdown months={startMonths} />}
        </li>
        <li>
          <CalendarDays aria-hidden size={14} className="mr-1.5 inline-block align-[-2px] text-fg-subtle" />
          {TEXTS.bofrost} <span className="text-fg">{formatDate(BOFROST_APPLY_FROM)}</span>
          {bofrostMonths > 0 && <Countdown months={bofrostMonths} />}
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
          <Home aria-hidden size={14} className="mr-1.5 inline-block align-[-2px] text-fg-subtle" />
          {TEXTS.home}: <span className="text-fg">{HOME_TOWN}</span> · {TEXTS.commute}{" "}
          {MAX_COMMUTE_MINUTES} мин
        </li>
      </ul>
    </footer>
  );
}

function Countdown({ months }: { months: number }) {
  return (
    <span className="text-fg-subtle">
      {" "}· через {months} {pluralize(months, ["месяц", "месяца", "месяцев"])}
    </span>
  );
}
