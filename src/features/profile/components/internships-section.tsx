import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import type { Internship } from "@/db/schema";
import { formatDate } from "@/lib/dates";
import { pluralize } from "@/lib/plural";

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
  const count = internships.length;

  return (
    <Panel
      title={SECTION_TITLES.internships}
      aside={count > 0 ? `${count} ${pluralize(count, PROFILE_TEXTS.count.internships)}` : undefined}
    >
      <div className="space-y-5">
        {count === 0 ? (
          <EmptyState
            compact
            title={PROFILE_TEXTS.emptyInternships}
            hint={PROFILE_TEXTS.emptyInternshipsHint}
          />
        ) : (
          <ul className="divide-y divide-edge-muted">
            {internships.map((internship) => (
              <li key={internship.id} className="flex items-start justify-between gap-4 py-item">
                <div className="min-w-0 text-sm">
                  <p className="font-medium">
                    {internship.company}
                    {internship.field && (
                      <span className="font-normal text-fg-muted">, {internship.field}</span>
                    )}
                  </p>
                  <p className="text-xs text-fg-subtle">{formatPeriod(internship)}</p>
                  {internship.description && (
                    <p className="mt-1.5 whitespace-pre-line text-fg-muted">
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

        <div className="border-t border-edge-muted pt-4">
          <InternshipAddForm action={addInternship} />
        </div>
      </div>
    </Panel>
  );
}
