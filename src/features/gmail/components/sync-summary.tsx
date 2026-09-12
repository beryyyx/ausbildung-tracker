import { GMAIL_TEXTS } from "../labels";
import type { SyncSummary } from "../types";

/**
 * Итог синхронизации. Без хуков, поэтому годится и серверным, и клиентским
 * компонентам. Число несовпавших показываем всегда: по нему видно,
 * работают ли правила сопоставления.
 */
export function SyncSummaryView({ summary }: { summary: SyncSummary }) {
  return (
    <div className="space-y-1 rounded-md border border-edge bg-surface-muted px-3 py-2 text-sm text-fg">
      <p className="font-medium text-fg">{GMAIL_TEXTS.summaryTitle}</p>
      <p>
        {GMAIL_TEXTS.summaryListed}: {summary.listed}, {GMAIL_TEXTS.summaryExamined}:{" "}
        {summary.examined}.
      </p>
      <p>
        {GMAIL_TEXTS.summaryMatched}: {summary.matched}, {GMAIL_TEXTS.summaryUnmatched}:{" "}
        {summary.unmatched}.
      </p>
      {summary.examined === 0 && <p className="text-fg-muted">{GMAIL_TEXTS.summaryNothingNew}</p>}
      {summary.examined > 0 && summary.matched === 0 && (
        <p className="text-warning">{GMAIL_TEXTS.summaryLowMatch}</p>
      )}
      {summary.truncated && <p className="text-fg-muted">{GMAIL_TEXTS.summaryTruncated}</p>}
    </div>
  );
}
