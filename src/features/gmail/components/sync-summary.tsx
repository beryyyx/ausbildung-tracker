import { GMAIL_TEXTS } from "../labels";
import type { SyncSummary } from "../types";

/**
 * Итог синхронизации. Без хуков, поэтому годится и серверным, и клиентским
 * компонентам. Число несовпавших показываем всегда: по нему видно,
 * работают ли правила сопоставления.
 */
export function SyncSummaryView({ summary }: { summary: SyncSummary }) {
  return (
    <div className="space-y-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
      <p className="font-medium text-zinc-900">{GMAIL_TEXTS.summaryTitle}</p>
      <p>
        {GMAIL_TEXTS.summaryListed}: {summary.listed}, {GMAIL_TEXTS.summaryExamined}:{" "}
        {summary.examined}.
      </p>
      <p>
        {GMAIL_TEXTS.summaryMatched}: {summary.matched}, {GMAIL_TEXTS.summaryUnmatched}:{" "}
        {summary.unmatched}.
      </p>
      {summary.examined === 0 && <p className="text-zinc-500">{GMAIL_TEXTS.summaryNothingNew}</p>}
      {summary.examined > 0 && summary.matched === 0 && (
        <p className="text-amber-700">{GMAIL_TEXTS.summaryLowMatch}</p>
      )}
      {summary.truncated && <p className="text-zinc-500">{GMAIL_TEXTS.summaryTruncated}</p>}
    </div>
  );
}
