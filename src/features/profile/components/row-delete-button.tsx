"use client";

import { useTransition } from "react";

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
      className="text-sm text-red-700 hover:underline disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? PROFILE_TEXTS.deleting : PROFILE_TEXTS.delete}
    </button>
  );
}
