"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { buttonClass } from "@/components/button";

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
      aria-busy={pending}
      className={buttonClass("danger")}
    >
      <Trash2 aria-hidden size={14} />
      {pending ? "Удаляем…" : "Удалить"}
    </button>
  );
}
