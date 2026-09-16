import type { Metadata } from "next";

import { Panel } from "@/components/panel";
import { createApplication } from "@/features/applications/actions";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { applicationInputSchema } from "@/features/applications/validation";
import { toFormValues } from "@/lib/form-schema";

export const metadata: Metadata = { title: "Новая заявка" };

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-stack">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Новая заявка</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Обязательны только компания и профессия. Остальное можно заполнить позже.
        </p>
      </div>
      <Panel>
        <ApplicationForm
          action={createApplication}
          initialValues={toFormValues(applicationInputSchema, { status: "draft" })}
          submitLabel="Создать заявку"
        />
      </Panel>
    </div>
  );
}
