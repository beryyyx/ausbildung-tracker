"use client";

import { useOptimistic, useTransition } from "react";

import type { ApplicationStatus } from "@/db/schema";

import { setApplicationStatus } from "../actions";
import { STATUS_LABELS, STATUS_STYLES } from "../labels";

/**
 * Выпадающий список для смены статуса прямо в таблице.
 * Цвет меняется сразу, сервер догоняет в фоне.
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
    <select
      aria-label="Статус заявки"
      value={optimisticStatus}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value as ApplicationStatus;
        startTransition(async () => {
          setOptimisticStatus(next);
          await setApplicationStatus(id, next);
        });
      }}
      className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium outline-none focus:ring-2 focus:ring-accent disabled:cursor-wait disabled:opacity-60 ${STATUS_STYLES[optimisticStatus]}`}
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
