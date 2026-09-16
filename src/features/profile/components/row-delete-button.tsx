"use client";

import { useTransition } from "react";

import { buttonClass } from "@/components/button";

import { PROFILE_TEXTS } from "../labels";

/**
 * Кнопка удаления строки списка. Действие приходит уже с привязанным id
 * (action.bind(null, id) на сервере). Подтверждение спрашиваем только там,
 * где удаление необратимо, например у файлов.
 */
export function RowDeleteButton({
  action,
  confirmText,
  ariaLabel,
}: {
  action: () => Promise<void>;
  confirmText?: string;
  ariaLabel?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={ariaLabel}
      onClick={() => {
        if (confirmText && !window.confirm(confirmText)) return;
        startTransition(() => action());
      }}
      aria-busy={pending}
      className={`${buttonClass("ghost", "sm")} hover:bg-danger-soft hover:text-danger`}
    >
      {pending ? PROFILE_TEXTS.deleting : PROFILE_TEXTS.delete}
    </button>
  );
}
