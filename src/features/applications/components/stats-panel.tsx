import { CalendarClock, Layers, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { panelClass } from "@/components/panel";
import { formatDate } from "@/lib/dates";

import { DASHBOARD_LABELS, LIST_LABELS, STATUS_ICONS } from "../labels";
import type { ApplicationStats } from "../stats";

/** Пять чисел крупно над списком: всего, черновики, ждут ответа, приглашения, ближайший дедлайн. */
export function StatsPanel({ stats }: { stats: ApplicationStats }) {
  const { byStatus, invitationRate, nextDeadline } = stats;
  const invitations = byStatus.invitation + byStatus.offer;

  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <Tile icon={Layers} label={DASHBOARD_LABELS.total} value={stats.total} />
      <Tile
        icon={STATUS_ICONS.draft}
        label={DASHBOARD_LABELS.drafts}
        value={byStatus.draft}
        hint={DASHBOARD_LABELS.draftsHint}
      />
      <Tile icon={STATUS_ICONS.sent} label={DASHBOARD_LABELS.waiting} value={byStatus.sent} />
      <Tile
        icon={STATUS_ICONS.invitation}
        label={DASHBOARD_LABELS.invitations}
        value={invitations}
        // При нуле отправленных доли нет, а не 0 %.
        hint={invitationRate === null ? undefined : `${invitationRate} % ${DASHBOARD_LABELS.invitationRate}`}
      />
      <DeadlineTile deadline={nextDeadline} />
    </dl>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  /** Цвет числа для дедлайна: близкий жёлтый, просроченный красный. */
  tone?: "warning" | "danger";
  className?: string;
}) {
  const valueColor =
    tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-fg";

  return (
    <div className={`${panelClass} flex flex-col gap-1 px-card py-4 ${className ?? ""}`}>
      <dt className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">
        {label}
        <Icon aria-hidden size={16} className="shrink-0 text-fg-subtle" />
      </dt>
      <dd className={`text-3xl font-semibold tabular-nums tracking-tight ${valueColor}`}>{value}</dd>
      {hint && <dd className="text-xs text-fg-muted">{hint}</dd>}
    </div>
  );
}

function DeadlineTile({ deadline }: { deadline: ApplicationStats["nextDeadline"] }) {
  if (!deadline) {
    return (
      <Tile
        icon={CalendarClock}
        label={DASHBOARD_LABELS.nextDeadline}
        value={DASHBOARD_LABELS.noDeadline}
        hint={DASHBOARD_LABELS.noDeadlineHint}
        className="max-md:col-span-2"
      />
    );
  }

  const { days } = deadline;
  const value =
    days < 0
      ? LIST_LABELS.deadlinePassed
      : days === 0
        ? LIST_LABELS.deadlineToday
        : days === 1
          ? LIST_LABELS.deadlineTomorrow
          : `${days} дн.`;

  return (
    <Tile
      icon={CalendarClock}
      label={DASHBOARD_LABELS.nextDeadline}
      value={value}
      hint={formatDate(deadline.date)}
      tone={days < 0 ? "danger" : days <= 7 ? "warning" : undefined}
      className="max-md:col-span-2"
    />
  );
}
