import { Building2, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/badge";
import { buttonClass } from "@/components/button";
import { panelClass } from "@/components/panel";
import type { Application, ApplicationStatus } from "@/db/schema";
import { daysFromToday, formatDate } from "@/lib/dates";
import { pluralize } from "@/lib/plural";

import { deadlineHint, LIST_LABELS } from "../labels";
import { StatusSelect } from "./status-select";

const COLUMNS = LIST_LABELS.columns;

/**
 * Таблица заявок. На узком экране CSS (.table-cards в globals.css) раскладывает
 * строки в карточки, подписи столбцов берутся из data-label. Роли проставлены
 * явно: display: grid снял бы их, и скринридер перестал бы видеть таблицу.
 *
 * Заявки одной компании идут подряд под общей строкой-шапкой, название в них
 * не повторяется. Компании с одной заявкой остаются обычной строкой.
 */
export function ApplicationsTable({ items }: { items: Application[] }) {
  const groups = groupByCompany(items);

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
          {groups.flatMap((group) => [
            group.length > 1 && <GroupRow key={`group-${group[0].id}`} items={group} />,
            ...group.map((item) => {
              const grouped = group.length > 1;
              return (
              <tr key={item.id} role="row" className="transition-colors hover:bg-surface-hover">
                {/* В группе название спрятано (sr-only), на узком экране ячейка скрыта: ссылка на объявление есть на странице заявки. */}
                <td
                  role="cell"
                  className={`col-span-full whitespace-nowrap px-4 py-row text-base font-semibold text-fg md:text-sm ${grouped ? "max-md:hidden!" : ""}`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Link
                      href={`/applications/${item.id}`}
                      className={`rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent ${grouped ? "sr-only" : ""}`}
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
                        <ExternalLink aria-hidden size={14} />
                      </a>
                    )}
                  </span>
                </td>
                <td
                  role="cell"
                  className={`col-span-full px-4 py-row text-fg ${grouped ? "max-md:font-medium" : "max-md:-mt-1.5 max-md:text-fg-muted"}`}
                >
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
                    <Pencil aria-hidden size={14} />
                    {LIST_LABELS.edit}
                  </Link>
                </td>
              </tr>
              );
            }),
          ])}
        </tbody>
      </table>
    </div>
  );
}

/** Порядок групп — по первой заявке компании, внутри группы порядок списка сохраняется. */
function groupByCompany(items: Application[]): Application[][] {
  const groups = new Map<string, Application[]>();
  for (const item of items) {
    const key = item.company.trim().toLocaleLowerCase("de");
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.values()];
}

/** Строка-шапка группы: название компании один раз и число заявок. */
function GroupRow({ items }: { items: Application[] }) {
  const count = items.length;
  return (
    <tr role="row" className="group-row bg-surface-muted">
      <th
        role="columnheader"
        scope="colgroup"
        colSpan={8}
        className="col-span-full px-4 py-1.5 text-left text-sm font-semibold text-fg"
      >
        <span className="inline-flex items-center gap-2">
          <Building2 aria-hidden size={14} className="text-fg-subtle" />
          {items[0].company}
          <Badge className="border-neutral-edge bg-neutral-soft text-neutral">
            {count} {pluralize(count, ["заявка", "заявки", "заявок"])}
          </Badge>
        </span>
      </th>
    </tr>
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
    return (
      <Badge className="border-warning-edge bg-warning-soft text-warning">
        {text} · {deadlineHint(days)}
      </Badge>
    );
  }
  return <span className="text-fg">{text}</span>;
}
