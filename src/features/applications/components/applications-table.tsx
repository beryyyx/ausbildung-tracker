import Link from "next/link";

import type { Application, ApplicationStatus } from "@/db/schema";
import { daysFromToday, formatDate } from "@/lib/dates";

import { StatusSelect } from "./status-select";

export function ApplicationsTable({ items }: { items: Application[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Компания</th>
            <th className="px-4 py-3">Профессия</th>
            <th className="px-4 py-3">Город</th>
            <th className="px-4 py-3">Статус</th>
            <th className="px-4 py-3">Отправлено</th>
            <th className="px-4 py-3">Дедлайн</th>
            <th className="px-4 py-3">
              <span className="sr-only">Действия</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-zinc-50">
              <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900">
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
                    className="ml-2 text-xs font-normal text-zinc-400 hover:text-zinc-700"
                  >
                    объявление ↗
                  </a>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-700">{item.position}</td>
              <td className="px-4 py-3 text-zinc-600">{item.city || "—"}</td>
              <td className="px-4 py-3">
                <StatusSelect id={item.id} status={item.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                {formatDate(item.appliedAt) || "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <DeadlineCell deadline={item.deadline} status={item.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <Link
                  href={`/applications/${item.id}`}
                  className="text-zinc-500 hover:text-zinc-900"
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
  if (!deadline) return <span className="text-zinc-400">—</span>;

  const text = formatDate(deadline);
  if (status !== "draft") return <span className="text-zinc-600">{text}</span>;

  const days = daysFromToday(deadline);
  if (days < 0) {
    return (
      <span className="font-medium text-red-600" title="Дедлайн прошёл">
        {text}
      </span>
    );
  }
  if (days <= 7) {
    const hint =
      days === 0 ? "сегодня" : days === 1 ? "завтра" : `через ${days} дн.`;
    return (
      <span className="font-medium text-amber-700">
        {text}
        <span className="ml-1 text-xs font-normal">{hint}</span>
      </span>
    );
  }
  return <span className="text-zinc-600">{text}</span>;
}
