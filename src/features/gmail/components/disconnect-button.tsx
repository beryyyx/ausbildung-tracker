"use client";

import { useTransition } from "react";

import { buttonClass } from "@/components/button";

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
      aria-busy={pending}
      className={buttonClass("danger")}
    >
      {pending ? GMAIL_TEXTS.disconnecting : GMAIL_TEXTS.disconnect}
    </button>
  );
}
