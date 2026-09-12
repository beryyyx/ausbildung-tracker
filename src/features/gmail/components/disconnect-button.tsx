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
      className="rounded-md border border-edge bg-surface px-4 py-control text-sm font-medium text-danger hover:bg-danger-soft disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? GMAIL_TEXTS.disconnecting : GMAIL_TEXTS.disconnect}
    </button>
  );
}
