import type { Internship } from "@/db/schema";
import { formatDate } from "@/lib/dates";

import { addInternship, deleteInternship } from "../actions";
import { PROFILE_TEXTS, SECTION_TITLES } from "../labels";

import { InternshipAddForm } from "./internship-add-form";
import { RowDeleteButton } from "./row-delete-button";

/** «01.02.2026 – 13.02.2026», «с 01.02.2026, по настоящее время» или «даты не указаны». */
function formatPeriod(internship: Internship): string {
  const { startDate, endDate } = internship;
  if (startDate && endDate) return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  if (startDate) return `с ${formatDate(startDate)}, ${PROFILE_TEXTS.internshipOngoing}`;
  if (endDate) return `до ${formatDate(endDate)}`;
  return PROFILE_TEXTS.internshipNoDates;
}

export function InternshipsSection({ internships }: { internships: Internship[] }) {
  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{SECTION_TITLES.internships}</h2>

      {internships.length === 0 ? (
        <p className="text-sm text-zinc-500">{PROFILE_TEXTS.emptyInternships}</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {internships.map((internship) => (
            <li key={internship.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0 text-sm">
                <p className="font-medium">
                  {internship.company}
                  {internship.field && (
                    <span className="font-normal text-zinc-500">, {internship.field}</span>
                  )}
                </p>
                <p className="text-zinc-500">{formatPeriod(internship)}</p>
                {internship.description && (
                  <p className="mt-1 whitespace-pre-line text-zinc-700">
                    {internship.description}
                  </p>
                )}
              </div>
              <RowDeleteButton
                action={deleteInternship.bind(null, internship.id)}
                ariaLabel={`${PROFILE_TEXTS.delete}: ${internship.company}`}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-zinc-200 pt-4">
        <InternshipAddForm action={addInternship} />
      </div>
    </section>
  );
}
