import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Panel } from "@/components/panel";
import { updateApplication } from "@/features/applications/actions";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { DeleteButton } from "@/features/applications/components/delete-button";
import { StatusBadge } from "@/features/applications/components/status-badge";
import { SOURCE_LABELS } from "@/features/applications/labels";
import { getApplication } from "@/features/applications/queries";
import { applicationInputSchema } from "@/features/applications/validation";
import { toFormValues } from "@/lib/form-schema";
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
    <div className="mx-auto max-w-2xl space-y-stack">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">
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

      <Panel>
        <ApplicationForm
          action={updateApplication.bind(null, application.id)}
          initialValues={toFormValues(applicationInputSchema, application)}
          submitLabel="Сохранить"
        />
      </Panel>

      <p className="text-xs text-fg-subtle">
        Создано {formatDateTime(application.createdAt)}, изменено{" "}
        {formatDateTime(application.updatedAt)}
      </p>
    </div>
  );
}
