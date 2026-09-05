"use client";

import { useTransition } from "react";

import { GMAIL_TEXTS } from "../labels";

/** «Отключить» с подтверждением: токены удаляются из базы безвозвратно. */
export function DisconnectButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(GMAIL_TEXTS.confirmDisconnect)) return;
        startTransition(() => action());
      }}
      className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? GMAIL_TEXTS.disconnecting : GMAIL_TEXTS.disconnect}
    </button>
  );
}
