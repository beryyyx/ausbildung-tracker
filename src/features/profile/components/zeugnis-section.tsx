import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";

import { addGrade, deleteGrade, saveZeugnis } from "../actions";
import {
  GRADE_FIELD_LABELS,
  PROFILE_TEXTS,
  ZEUGNIS_SCALE_LABELS,
  ZEUGNIS_SLOT_LABELS,
} from "../labels";
import type { ZeugnisWithGrades } from "../queries";
import { GRADE_RANGES } from "../validation";

import { RowDeleteButton } from "./row-delete-button";
import { GradeAddForm, ZeugnisTitleForm } from "./zeugnis-forms";

/** Один слот Zeugnis: название, таблица оценок, строка добавления. */
export function ZeugnisSection({ data }: { data: ZeugnisWithGrades }) {
  const { slot, zeugnis, grades } = data;
  // Пока слот пуст, строки в базе нет: показываем шкалу по умолчанию.
  const scale = zeugnis?.scale ?? "sek1";
  const idPrefix = `zeugnis-${slot}`;

  return (
    <Panel title={ZEUGNIS_SLOT_LABELS[slot]} aside={ZEUGNIS_SCALE_LABELS[scale]}>
      <div className="space-y-5">
        <ZeugnisTitleForm
          action={saveZeugnis.bind(null, slot)}
          idPrefix={idPrefix}
          initialTitle={zeugnis?.title ?? ""}
        />

        {grades.length === 0 ? (
          <EmptyState compact title={PROFILE_TEXTS.emptyGrades} hint={PROFILE_TEXTS.emptyGradesHint} />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-medium text-fg-subtle">
              <tr>
                <th scope="col" className="pb-1 font-medium">{GRADE_FIELD_LABELS.subject}</th>
                <th scope="col" className="pb-1 text-right font-medium">{GRADE_FIELD_LABELS.grade}</th>
                <th scope="col" className="pb-1">
                  <span className="sr-only">{PROFILE_TEXTS.delete}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-muted border-t border-edge-muted">
              {grades.map((grade) => (
                <tr key={grade.id} className="transition-colors hover:bg-surface-hover">
                  <td className="py-row">{grade.subject}</td>
                  <td className="w-16 py-row text-right font-medium tabular-nums">{grade.grade}</td>
                  <td className="w-24 py-1 text-right">
                    <RowDeleteButton
                      action={deleteGrade.bind(null, grade.id)}
                      ariaLabel={`${PROFILE_TEXTS.delete}: ${grade.subject}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="border-t border-edge-muted pt-4">
          <GradeAddForm
            action={addGrade.bind(null, slot)}
            idPrefix={idPrefix}
            range={GRADE_RANGES[scale]}
          />
        </div>
      </div>
    </Panel>
  );
}
