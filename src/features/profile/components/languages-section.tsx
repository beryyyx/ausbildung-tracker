import type { Language } from "@/db/schema";

import { addLanguage, deleteLanguage } from "../actions";
import { LANGUAGE_LEVEL_LABELS, PROFILE_TEXTS, SECTION_TITLES } from "../labels";

import { LanguageAddForm } from "./language-add-form";
import { RowDeleteButton } from "./row-delete-button";

export function LanguagesSection({ languages }: { languages: Language[] }) {
  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{SECTION_TITLES.languages}</h2>

      {languages.length === 0 ? (
        <p className="text-sm text-zinc-500">{PROFILE_TEXTS.emptyLanguages}</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {languages.map((language) => (
              <tr key={language.id} className="border-t border-zinc-100">
                <td className="py-1.5">{language.language}</td>
                <td className="w-24 py-1.5 text-right">
                  {LANGUAGE_LEVEL_LABELS[language.level]}
                </td>
                <td className="w-24 py-1.5 text-right">
                  <RowDeleteButton
                    action={deleteLanguage.bind(null, language.id)}
                    ariaLabel={`${PROFILE_TEXTS.delete}: ${language.language}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <LanguageAddForm action={addLanguage} />
    </section>
  );
}
