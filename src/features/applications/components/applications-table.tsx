import Link from "next/link";

import type { Application, ApplicationStatus } from "@/db/schema";
import { daysFromToday, formatDate } from "@/lib/dates";

import { StatusSelect } from "./status-select";

export function ApplicationsTable({ items }: { items: Application[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-edge bg-surface shadow-card">
      <table className="min-w-full divide-y divide-edge text-sm">
        <thead className="bg-surface-muted text-left text-xs font-medium uppercase tracking-wide text-fg-muted">
          <tr>
            <th className="px-4 py-row">Компания</th>
            <th className="px-4 py-row">Профессия</th>
            <th className="px-4 py-row">Город</th>
            <th className="px-4 py-row">В пути</th>
            <th className="px-4 py-row">Статус</th>
            <th className="px-4 py-row">Отправлено</th>
            <th className="px-4 py-row">Дедлайн</th>
            <th className="px-4 py-row">
              <span className="sr-only">Действия</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge-muted">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-surface-hover">
              <td className="whitespace-nowrap px-4 py-row font-medium text-fg">
                <Link
                  href={`/applications/${item.id}`}
                  className="hover:underline"
                >
                  {item.company}
                </Link>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-xs font-normal text-fg-subtle hover:text-fg"
                  >
                    объявление ↗
                  </a>
                )}
              </td>
              <td className="px-4 py-row text-fg">{item.position}</td>
              <td className="px-4 py-row text-fg-muted">{item.city || "—"}</td>
              <td className="whitespace-nowrap px-4 py-row text-fg-muted">
                {item.commuteMinutes === null ? "—" : `${item.commuteMinutes} мин`}
              </td>
              <td className="px-4 py-row">
                <StatusSelect id={item.id} status={item.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-row text-fg-muted">
                {formatDate(item.appliedAt) || "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-row">
                <DeadlineCell deadline={item.deadline} status={item.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-row text-right">
                <Link
                  href={`/applications/${item.id}`}
                  className="text-fg-muted hover:text-fg"
                >
                  Изменить
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Дедлайн важен только пока заявка не отправлена: подсвечиваем просроченные и близкие. */
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
      <span className="font-medium text-danger" title="Дедлайн прошёл">
        {text}
      </span>
    );
  }
  if (days <= 7) {
    const hint =
      days === 0 ? "сегодня" : days === 1 ? "завтра" : `через ${days} дн.`;
    return (
      <span className="font-medium text-warning">
        {text}
        <span className="ml-1 text-xs font-normal">{hint}</span>
      </span>
    );
  }
  return <span className="text-fg-muted">{text}</span>;
}
