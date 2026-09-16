import {
  ClipboardList,
  Mail,
  Plus,
  Search,
  SearchX,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { buttonClass } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { panelClass } from "@/components/panel";
import { ApplicationsTable } from "@/features/applications/components/applications-table";
import { FilterBar } from "@/features/applications/components/filter-bar";
import { StatsPanel } from "@/features/applications/components/stats-panel";
import { StatusFunnel } from "@/features/applications/components/status-funnel";
import {
  isFilterActive,
  parseApplicationFilter,
} from "@/features/applications/filters";
import { DASHBOARD_LABELS, LIST_LABELS } from "@/features/applications/labels";
import { listApplications } from "@/features/applications/queries";
import { pluralize } from "@/lib/plural";

// Данные меняются между запросами, страницу нельзя запекать при сборке.
export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const filter = parseApplicationFilter(await searchParams);
  const { items, total, stats } = await listApplications(filter);
  const filtered = isFilterActive(filter);

  const subtitle =
    total === 0
      ? "Пока ничего нет"
      : filtered
        ? `${LIST_LABELS.shown} ${items.length} ${LIST_LABELS.of} ${total}`
        : `${total} ${pluralize(total, ["заявка", "заявки", "заявок"])}`;

  return (
    <div className="space-y-stack">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Заявки</h1>
          <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>
        </div>
        <Link href="/applications/new" className={buttonClass("primary")}>
          <Plus aria-hidden size={16} />
          {LIST_LABELS.newApplication}
        </Link>
      </div>

      <StatsPanel stats={stats} />

      {total === 0 ? (
        <GettingStarted />
      ) : (
        <>
          <StatusFunnel stats={stats} active={filter.statuses} />
          <div className="space-y-4">
            <FilterBar filter={filter} />
            {items.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={LIST_LABELS.nothingFoundTitle}
                hint={LIST_LABELS.nothingFoundHint}
                action={
                  <Link href="/" className={buttonClass("secondary")}>
                    {LIST_LABELS.reset}
                  </Link>
                }
              />
            ) : (
              <ApplicationsTable items={items} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

const STEPS: { key: keyof typeof DASHBOARD_LABELS.steps; href: string; icon: LucideIcon }[] = [
  { key: "add", href: "/applications/new", icon: ClipboardList },
  { key: "search", href: "/suche", icon: Search },
  { key: "profile", href: "/profile", icon: UserRound },
  { key: "gmail", href: "/gmail", icon: Mail },
];

/** Заявок ещё нет: вместо одной пустой карточки — четыре следующих шага по разделам. */
function GettingStarted() {
  return (
    <section aria-labelledby="getting-started" className="space-y-4">
      <h2 id="getting-started" className="text-lg font-semibold">
        {DASHBOARD_LABELS.gettingStarted}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ key, href, icon: Icon }, index) => (
          <li key={key}>
            <Link
              href={href}
              className={`${panelClass} flex h-full gap-3 p-card outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent`}
            >
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent-fg"
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">
                  <span className="mr-1.5 tabular-nums text-fg-subtle">{index + 1}.</span>
                  {DASHBOARD_LABELS.steps[key].title}
                </span>
                <span className="mt-0.5 block text-sm text-fg-muted">
                  {DASHBOARD_LABELS.steps[key].hint}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
