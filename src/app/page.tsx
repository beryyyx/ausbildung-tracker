import Link from "next/link";

import { ApplicationsTable } from "@/features/applications/components/applications-table";
import { listApplications } from "@/features/applications/queries";
import { pluralize } from "@/lib/plural";

// Данные меняются между запросами, страницу нельзя запекать при сборке.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await listApplications();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Заявки</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {items.length === 0
              ? "Пока ничего нет"
              : `${items.length} ${pluralize(items.length, ["заявка", "заявки", "заявок"])}`}
          </p>
        </div>
        <Link
          href="/applications/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Новая заявка
        </Link>
      </div>

      {items.length === 0 ? <EmptyState /> : <ApplicationsTable items={items} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
      <p className="text-lg font-medium text-zinc-900">Заявок пока нет</p>
      <p className="mt-1 text-sm text-zinc-500">
        Добавьте первую заявку, чтобы начать отслеживать ответы и дедлайны.
      </p>
      <Link
        href="/applications/new"
        className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Добавить заявку
      </Link>
    </div>
  );
}
