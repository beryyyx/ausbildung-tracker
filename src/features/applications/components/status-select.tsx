"use client";

import { useOptimistic, useTransition } from "react";

import type { ApplicationStatus } from "@/db/schema";

import { setApplicationStatus } from "../actions";
import { STATUS_LABELS, STATUS_STYLES } from "../labels";

/**
 * Выпадающий список для смены статуса прямо в таблице, выглядит как бейдж
 * с точкой и стрелкой. Цвет меняется сразу, сервер догоняет в фоне.
 */
export function StatusSelect({
  id,
  status,
}: {
  id: number;
  status: ApplicationStatus;
}) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [pending, startTransition] = useTransition();

  return (
    <span
      className={`relative inline-flex items-center rounded-full border text-xs font-medium transition-opacity has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-1 has-[:focus-visible]:ring-offset-surface ${
        pending ? "opacity-60" : ""
      } ${STATUS_STYLES[optimisticStatus]}`}
    >
      <span aria-hidden className="pointer-events-none absolute left-2 h-1.5 w-1.5 rounded-full bg-current" />
      <select
        aria-label="Статус заявки"
        aria-busy={pending}
        value={optimisticStatus}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value as ApplicationStatus;
          startTransition(async () => {
            setOptimisticStatus(next);
            await setApplicationStatus(id, next);
          });
        }}
        className="cursor-pointer appearance-none bg-transparent py-0.5 pl-5 pr-6 text-inherit outline-none disabled:cursor-wait"
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-1.5"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" />
      </svg>
    </span>
  );
}
