import { addGrade, deleteGrade, saveZeugnis } from "../actions";
import { PROFILE_TEXTS, ZEUGNIS_SCALE_LABELS, ZEUGNIS_SLOT_LABELS } from "../labels";
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
    <section className="space-y-4 rounded-lg border border-edge bg-surface p-card shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{ZEUGNIS_SLOT_LABELS[slot]}</h3>
        <span className="text-xs text-fg-muted">{ZEUGNIS_SCALE_LABELS[scale]}</span>
      </div>

      <ZeugnisTitleForm
        action={saveZeugnis.bind(null, slot)}
        idPrefix={idPrefix}
        initialTitle={zeugnis?.title ?? ""}
      />

      {grades.length === 0 ? (
        <p className="text-sm text-fg-muted">{PROFILE_TEXTS.emptyGrades}</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id} className="border-t border-edge-muted">
                <td className="py-row">{grade.subject}</td>
                <td className="w-16 py-row text-right tabular-nums">{grade.grade}</td>
                <td className="w-24 py-row text-right">
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

      <GradeAddForm
        action={addGrade.bind(null, slot)}
        idPrefix={idPrefix}
        range={GRADE_RANGES[scale]}
      />
    </section>
  );
}
