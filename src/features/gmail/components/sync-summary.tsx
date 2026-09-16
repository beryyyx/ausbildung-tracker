import { GMAIL_TEXTS } from "../labels";
import type { SyncSummary } from "../types";

/**
 * Итог синхронизации: четыре числа плиткой и замечания под ними. Без хуков,
 * поэтому годится и серверным, и клиентским компонентам. Число несовпавших
 * показываем всегда: по нему видно, работают ли правила сопоставления.
 */
export function SyncSummaryView({ summary }: { summary: SyncSummary }) {
  const stats = [
    [GMAIL_TEXTS.summaryListed, summary.listed],
    [GMAIL_TEXTS.summaryExamined, summary.examined],
    [GMAIL_TEXTS.summaryMatched, summary.matched],
    [GMAIL_TEXTS.summaryUnmatched, summary.unmatched],
  ] as const;

  return (
    <div className="space-y-2 rounded-md border border-edge-muted bg-surface-muted p-3 text-sm">
      <p className="text-xs font-medium tracking-wide text-fg-subtle uppercase">
        {GMAIL_TEXTS.summaryTitle}
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dd className="text-lg font-semibold tabular-nums text-fg">{value}</dd>
            <dt className="text-xs text-fg-muted">{label}</dt>
          </div>
        ))}
      </dl>
      {summary.examined === 0 && <p className="text-fg-muted">{GMAIL_TEXTS.summaryNothingNew}</p>}
      {summary.examined > 0 && summary.matched === 0 && (
        <p className="text-warning">{GMAIL_TEXTS.summaryLowMatch}</p>
      )}
      {summary.truncated && <p className="text-fg-muted">{GMAIL_TEXTS.summaryTruncated}</p>}
    </div>
  );
}
