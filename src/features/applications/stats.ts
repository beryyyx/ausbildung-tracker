import type { Application, ApplicationStatus } from "@/db/schema";
import { daysFromToday } from "@/lib/dates";

/** Числа для панели сводки и воронки на главной. Считаются из уже загруженных строк. */
export type ApplicationStats = {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  /** Все не-черновики: сколько заявок вообще ушло. */
  sent: number;
  /** Доля приглашений (приглашение + оффер) среди отправленных, 0–100. null, если отправленных нет. */
  invitationRate: number | null;
  /** Ближайший дедлайн среди черновиков: дата и дней до неё (отрицательное — просрочен). */
  nextDeadline: { date: string; days: number } | null;
};

export function summarizeApplications(all: Application[]): ApplicationStats {
  const byStatus: Record<ApplicationStatus, number> = {
    draft: 0,
    sent: 0,
    invitation: 0,
    rejected: 0,
    offer: 0,
  };
  for (const item of all) byStatus[item.status] += 1;

  const sent = all.length - byStatus.draft;
  const invitationRate =
    sent === 0 ? null : Math.round(((byStatus.invitation + byStatus.offer) / sent) * 100);

  // Дедлайн важен только у черновиков: отправленную заявку он уже не касается.
  // Берём ближайший будущий; если будущих нет, последний просроченный, чтобы его заметили.
  const deadlines = all
    .filter((item) => item.status === "draft" && item.deadline)
    .map((item) => ({ date: item.deadline as string, days: daysFromToday(item.deadline as string) }))
    .sort((a, b) => a.days - b.days);
  const nextDeadline = deadlines.find((d) => d.days >= 0) ?? deadlines.at(-1) ?? null;

  return { total: all.length, byStatus, sent, invitationRate, nextDeadline };
}
