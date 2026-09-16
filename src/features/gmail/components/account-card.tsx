import { buttonClass } from "@/components/button";
import { Panel } from "@/components/panel";
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
  const lastSync = account.lastSyncedAt
    ? formatDateTime(account.lastSyncedAt)
    : GMAIL_TEXTS.neverSynced;

  return (
    <Panel
      title={account.email}
      hint={`${GMAIL_TEXTS.connectedAs}. ${GMAIL_TEXTS.lastSync}: ${lastSync}`}
      aside={
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${
            account.reconnectRequired
              ? "border-warning-edge bg-warning-soft text-warning"
              : "border-success-edge bg-success-soft text-success"
          }`}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {account.reconnectRequired ? GMAIL_TEXTS.expiredTitle : GMAIL_TEXTS.connectedBadge}
        </span>
      }
    >
      <div className="space-y-4">
        {account.reconnectRequired && (
          <div
            role="alert"
            className="space-y-2 rounded-md border border-warning-edge bg-warning-soft px-4 py-3 text-sm text-warning"
          >
            <p className="font-medium">{GMAIL_TEXTS.expiredTitle}</p>
            <p>{GMAIL_TEXTS.expiredHint}</p>
            <a href={CONNECT_PATH} className={buttonClass("primary", "sm")}>
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
      </div>
    </Panel>
  );
}
