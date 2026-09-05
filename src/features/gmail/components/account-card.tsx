import type { GmailAccount } from "@/db/schema";
import { formatDateTime } from "@/lib/dates";

import { disconnectGmail, syncGmail } from "../actions";
import { GMAIL_TEXTS } from "../labels";
import { SYNC_MESSAGE_LIMIT } from "../sync";
import type { SyncSummary } from "../types";

import { CONNECT_PATH } from "./connect-card";
import { DisconnectButton } from "./disconnect-button";
import { SyncForm } from "./sync-form";

/** Итог прошлой синхронизации из строки аккаунта. null, пока синхронизации не было. */
function persistedSummary(account: GmailAccount): SyncSummary | null {
  const { lastSyncListed, lastSyncExamined, lastSyncMatched } = account;
  if (lastSyncListed === null || lastSyncExamined === null || lastSyncMatched === null) {
    return null;
  }
  return {
    listed: lastSyncListed,
    examined: lastSyncExamined,
    matched: lastSyncMatched,
    unmatched: lastSyncExamined - lastSyncMatched,
    truncated: lastSyncListed >= SYNC_MESSAGE_LIMIT,
  };
}

/** Подключённый ящик: адрес, дата синхронизации, кнопки. При истёкшем подключении — предупреждение. */
export function AccountCard({ account }: { account: GmailAccount }) {
  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm text-zinc-500">{GMAIL_TEXTS.connectedAs}</p>
        <p className="text-lg font-semibold">{account.email}</p>
        <p className="mt-1 text-sm text-zinc-500">
          {GMAIL_TEXTS.lastSync}:{" "}
          {account.lastSyncedAt
            ? formatDateTime(account.lastSyncedAt)
            : GMAIL_TEXTS.neverSynced}
        </p>
      </div>

      {account.reconnectRequired && (
        <div
          role="alert"
          className="space-y-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <p className="font-medium">{GMAIL_TEXTS.expiredTitle}</p>
          <p>{GMAIL_TEXTS.expiredHint}</p>
          <a
            href={CONNECT_PATH}
            className="inline-block rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-700"
          >
            {GMAIL_TEXTS.reconnect}
          </a>
        </div>
      )}

      <SyncForm
        action={syncGmail}
        persisted={persistedSummary(account)}
        disabled={account.reconnectRequired}
        actions={<DisconnectButton action={disconnectGmail} />}
      />
    </section>
  );
}
