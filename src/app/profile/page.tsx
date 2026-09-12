import type { Metadata } from "next";

import { saveProfile } from "@/features/profile/actions";
import { FilesSection } from "@/features/profile/components/files-section";
import { InternshipsSection } from "@/features/profile/components/internships-section";
import { LanguagesSection } from "@/features/profile/components/languages-section";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ZeugnisSection } from "@/features/profile/components/zeugnis-section";
import { PROFILE_TEXTS, SECTION_TITLES } from "@/features/profile/labels";
import {
  getProfile,
  listFiles,
  listInternships,
  listLanguages,
  listZeugnisse,
} from "@/features/profile/queries";
import { profileToFormValues } from "@/features/profile/validation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: PROFILE_TEXTS.pageTitle };

export default async function ProfilePage() {
  const [profile, zeugnisse, languages, internships, files] = await Promise.all([
    getProfile(),
    listZeugnisse(),
    listLanguages(),
    listInternships(),
    listFiles(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {PROFILE_TEXTS.pageTitle}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">{PROFILE_TEXTS.pageHint}</p>
      </div>

      <div className="rounded-lg border border-edge bg-surface p-card shadow-card">
        <ProfileForm
          action={saveProfile}
          initialValues={profile ? profileToFormValues(profile) : undefined}
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{SECTION_TITLES.grades}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {zeugnisse.map((data) => (
            <ZeugnisSection key={data.slot} data={data} />
          ))}
        </div>
      </section>

      <LanguagesSection languages={languages} />
      <InternshipsSection internships={internships} />
      <FilesSection files={files} />
    </div>
  );
}
