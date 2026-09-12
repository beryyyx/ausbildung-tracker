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
    <section className="space-y-4 rounded-lg border border-edge bg-surface p-card shadow-card">
      <div>
        <p className="text-sm text-fg-muted">{GMAIL_TEXTS.connectedAs}</p>
        <p className="text-lg font-semibold">{account.email}</p>
        <p className="mt-1 text-sm text-fg-muted">
          {GMAIL_TEXTS.lastSync}:{" "}
          {account.lastSyncedAt
            ? formatDateTime(account.lastSyncedAt)
            : GMAIL_TEXTS.neverSynced}
        </p>
      </div>

      {account.reconnectRequired && (
        <div
          role="alert"
          className="space-y-2 rounded-md border border-warning-edge bg-warning-soft px-4 py-row text-sm text-warning"
        >
          <p className="font-medium">{GMAIL_TEXTS.expiredTitle}</p>
          <p>{GMAIL_TEXTS.expiredHint}</p>
          <a
            href={CONNECT_PATH}
            className="inline-block rounded-md bg-accent px-3 py-1.5 font-medium text-accent-on hover:bg-accent-hover"
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
