import Link from "next/link";

import { Badge } from "@/components/badge";
import { buttonClass } from "@/components/button";
import { panelClass } from "@/components/panel";
import type { Application, ApplicationStatus } from "@/db/schema";
import { daysFromToday, formatDate } from "@/lib/dates";

import { LIST_LABELS } from "../labels";
import { StatusSelect } from "./status-select";

const COLUMNS = LIST_LABELS.columns;

/**
 * Таблица заявок. На узком экране CSS (.table-cards в globals.css) раскладывает
 * строки в карточки, подписи столбцов берутся из data-label. Роли проставлены
 * явно: display: grid снял бы их, и скринридер перестал бы видеть таблицу.
 */
export function ApplicationsTable({ items }: { items: Application[] }) {
  return (
    <div className={`${panelClass} overflow-x-auto`}>
      <table role="table" className="table-cards min-w-full text-sm">
        <thead
          role="rowgroup"
          className="border-b border-edge bg-surface-muted text-left text-xs font-medium tracking-wide text-fg-muted"
        >
          <tr role="row">
            <th role="columnheader" scope="col" className="whitespace-nowrap px-4 py-row">{COLUMNS.company}</th>
            <th role="columnheader" scope="col" className="whitespace-nowrap px-4 py-row">{COLUMNS.position}</th>
            <th role="columnheader" scope="col" className="whitespace-nowrap px-4 py-row">{COLUMNS.city}</th>
            <th role="columnheader" scope="col" className="whitespace-nowrap px-4 py-row">{COLUMNS.commute}</th>
            <th role="columnheader" scope="col" className="whitespace-nowrap px-4 py-row">{COLUMNS.status}</th>
            <th role="columnheader" scope="col" className="whitespace-nowrap px-4 py-row">{COLUMNS.appliedAt}</th>
            <th role="columnheader" scope="col" className="whitespace-nowrap px-4 py-row">{COLUMNS.deadline}</th>
            <th role="columnheader" scope="col" className="whitespace-nowrap px-4 py-row">
              <span className="sr-only">{COLUMNS.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup" className="divide-y divide-edge-muted">
          {items.map((item) => (
            <tr key={item.id} role="row" className="transition-colors hover:bg-surface-hover">
              <td role="cell" className="col-span-full whitespace-nowrap px-4 py-row font-medium text-fg">
                <span className="inline-flex items-center gap-1.5">
                  <Link
                    href={`/applications/${item.id}`}
                    className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {item.company}
                  </Link>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      title={LIST_LABELS.openListing}
                      className="rounded-sm text-fg-subtle outline-none hover:text-accent-fg focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="sr-only">{LIST_LABELS.openListing}</span>
                      <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.75.75 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z" />
                      </svg>
                    </a>
                  )}
                </span>
              </td>
              <td role="cell" className="col-span-full px-4 py-row text-fg max-md:-mt-1.5 max-md:text-fg-muted">
                {item.position}
              </td>
              <td role="cell" data-label={COLUMNS.city} className="px-4 py-row text-fg-muted">
                {item.city || "—"}
              </td>
              <td role="cell" data-label={COLUMNS.commute} className="whitespace-nowrap px-4 py-row text-fg-muted">
                {item.commuteMinutes === null ? "—" : `${item.commuteMinutes} мин`}
              </td>
              <td role="cell" data-label={COLUMNS.status} className="px-4 py-row">
                <StatusSelect id={item.id} status={item.status} />
              </td>
              <td role="cell" data-label={COLUMNS.appliedAt} className="whitespace-nowrap px-4 py-row text-fg-muted">
                {formatDate(item.appliedAt) || "—"}
              </td>
              <td role="cell" data-label={COLUMNS.deadline} className="whitespace-nowrap px-4 py-row">
                <DeadlineCell deadline={item.deadline} status={item.status} />
              </td>
              <td role="cell" className="col-span-full whitespace-nowrap px-4 py-row text-right max-md:mt-1">
                <Link
                  href={`/applications/${item.id}`}
                  className={`${buttonClass("secondary", "sm")} max-md:w-full md:border-transparent md:bg-transparent md:shadow-none`}
                >
                  {LIST_LABELS.edit}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Дедлайн важен только пока заявка не отправлена: просроченные и близкие показываем бейджем. */
function DeadlineCell({
  deadline,
  status,
}: {
  deadline: string | null;
  status: ApplicationStatus;
}) {
  if (!deadline) return <span className="text-fg-subtle">—</span>;

  const text = formatDate(deadline);
  if (status !== "draft") return <span className="text-fg-muted">{text}</span>;

  const days = daysFromToday(deadline);
  if (days < 0) {
    return (
      <Badge className="border-danger-edge bg-danger-soft text-danger">
        {text} · {LIST_LABELS.deadlinePassed}
      </Badge>
    );
  }
  if (days <= 7) {
    const hint =
      days === 0
        ? LIST_LABELS.deadlineToday
        : days === 1
          ? LIST_LABELS.deadlineTomorrow
          : `${LIST_LABELS.deadlineInDays} ${days} дн.`;
    return (
      <Badge className="border-warning-edge bg-warning-soft text-warning">
        {text} · {hint}
      </Badge>
    );
  }
  return <span className="text-fg">{text}</span>;
}
