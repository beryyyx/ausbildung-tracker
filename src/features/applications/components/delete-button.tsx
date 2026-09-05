"use client";

import { useTransition } from "react";

import { deleteApplication } from "../actions";

export function DeleteButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Удалить заявку? Это действие нельзя отменить.")) {
          return;
        }
        startTransition(() => deleteApplication(id));
      }}
      className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Удаляем…" : "Удалить"}
    </button>
  );
}
