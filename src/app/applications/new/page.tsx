import type { Metadata } from "next";

import { createApplication } from "@/features/applications/actions";
import { ApplicationForm } from "@/features/applications/components/application-form";

export const metadata: Metadata = { title: "Новая заявка" };

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Новая заявка</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Обязательны только компания и профессия. Остальное можно заполнить позже.
        </p>
      </div>
      <div className="rounded-lg border border-edge bg-surface p-card shadow-card">
        <ApplicationForm action={createApplication} submitLabel="Создать заявку" />
      </div>
    </div>
  );
}
