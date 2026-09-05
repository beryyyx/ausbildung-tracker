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
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{ZEUGNIS_SLOT_LABELS[slot]}</h3>
        <span className="text-xs text-zinc-500">{ZEUGNIS_SCALE_LABELS[scale]}</span>
      </div>

      <ZeugnisTitleForm
        action={saveZeugnis.bind(null, slot)}
        idPrefix={idPrefix}
        initialTitle={zeugnis?.title ?? ""}
      />

      {grades.length === 0 ? (
        <p className="text-sm text-zinc-500">{PROFILE_TEXTS.emptyGrades}</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id} className="border-t border-zinc-100">
                <td className="py-1.5">{grade.subject}</td>
                <td className="w-16 py-1.5 text-right tabular-nums">{grade.grade}</td>
                <td className="w-24 py-1.5 text-right">
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
