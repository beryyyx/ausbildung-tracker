import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateApplication } from "@/features/applications/actions";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { DeleteButton } from "@/features/applications/components/delete-button";
import { StatusBadge } from "@/features/applications/components/status-badge";
import { SOURCE_LABELS } from "@/features/applications/labels";
import { getApplication } from "@/features/applications/queries";
import { applicationToFormValues } from "@/features/applications/validation";
import { formatDateTime } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Заявка" };

export default async function ApplicationPage({
  params,
}: PageProps<"/applications/[id]">) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const application = await getApplication(id);
  if (!application) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {application.company}
            </h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="mt-1 text-sm text-fg-muted">
            {application.position}
            {application.city ? `, ${application.city}` : ""}
          </p>
          {application.source && (
            <p className="mt-1 text-xs text-fg-subtle">
              Импорт из {SOURCE_LABELS[application.source]}
              {application.refnr ? `, номер ${application.refnr}` : ""}
            </p>
          )}
        </div>
        <DeleteButton id={application.id} />
      </div>

      <div className="rounded-lg border border-edge bg-surface p-card shadow-card">
        <ApplicationForm
          action={updateApplication.bind(null, application.id)}
          initialValues={applicationToFormValues(application)}
          submitLabel="Сохранить"
        />
      </div>

      <p className="text-xs text-fg-subtle">
        Создано {formatDateTime(application.createdAt)}, изменено{" "}
        {formatDateTime(application.updatedAt)}
      </p>
    </div>
  );
}
