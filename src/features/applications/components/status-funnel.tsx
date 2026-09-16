import Link from "next/link";

import { Panel } from "@/components/panel";
import type { ApplicationStatus } from "@/db/schema";

import {
  DASHBOARD_LABELS,
  STATUS_DOT_STYLES,
  STATUS_ICONS,
  STATUS_LABELS,
  STATUS_STYLES,
} from "../labels";
import type { ApplicationStats } from "../stats";

/** Стадии воронки в порядке движения заявки. Отказ — не стадия, он показан числом отдельно. */
const STAGES = ["draft", "sent", "invitation", "offer"] as const;

/**
 * Одна полоса, ширина сегмента пропорциональна числу заявок в статусе.
 * Полоса декоративная: числа и подписи живут в легенде под ней, каждая
 * стадия — ссылка на уже существующий фильтр списка.
 */
export function StatusFunnel({
  stats,
  active = [],
}: {
  stats: ApplicationStats;
  /** Статусы из текущего фильтра списка: их стадии подсвечены. */
  active?: ApplicationStatus[];
}) {
  const { byStatus } = stats;
  const inFunnel = STAGES.reduce((sum, stage) => sum + byStatus[stage], 0);

  return (
    <Panel
      title={DASHBOARD_LABELS.funnelTitle}
      hint={DASHBOARD_LABELS.funnelHint}
      aside={
        byStatus.rejected > 0 ? (
          <Link
            href="/?status=rejected"
            className="inline-flex items-center gap-1.5 rounded-sm text-danger outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
          >
            {DASHBOARD_LABELS.rejected}: <span className="tabular-nums">{byStatus.rejected}</span>
          </Link>
        ) : undefined
      }
    >
      {inFunnel === 0 ? (
        <p className="text-sm text-fg-muted">{DASHBOARD_LABELS.funnelEmpty}</p>
      ) : (
        <div className="space-y-3">
          {/* Дорожка пустая, с рамкой: серая заливка черновиков должна отличаться от пустой дорожки. */}
          <div aria-hidden className="flex h-3.5 gap-0.5 overflow-hidden rounded-full border border-edge p-0.5">
            {STAGES.map((stage) =>
              byStatus[stage] > 0 ? (
                <span
                  key={stage}
                  className={`min-w-1 rounded-full ${STATUS_DOT_STYLES[stage]}`}
                  style={{ flexGrow: byStatus[stage] }}
                />
              ) : null,
            )}
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((stage) => {
              const Icon = STATUS_ICONS[stage];
              const count = byStatus[stage];
              const isActive = active.includes(stage);
              // Пустые стадии приглушены, чтобы цвет не спорил с заполненными.
              // Повторный клик по активной стадии снимает фильтр.
              return (
                <li key={stage}>
                  <Link
                    href={isActive ? "/" : `/?status=${stage}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent ${STATUS_STYLES[stage]} ${count === 0 && !isActive ? "opacity-60" : ""} ${isActive ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
                  >
                    <Icon aria-hidden size={16} className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate font-medium">{STATUS_LABELS[stage]}</span>
                    <span className="tabular-nums text-base font-semibold">{count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Panel>
  );
}
