import { EmptyState } from "@/components/empty-state";
import { Panel } from "@/components/panel";
import type { Language } from "@/db/schema";
import { pluralize } from "@/lib/plural";

import { addLanguage, deleteLanguage } from "../actions";
import { LANGUAGE_LEVEL_LABELS, PROFILE_TEXTS, SECTION_TITLES } from "../labels";

import { LanguageAddForm } from "./language-add-form";
import { RowDeleteButton } from "./row-delete-button";

export function LanguagesSection({ languages }: { languages: Language[] }) {
  const count = languages.length;

  return (
    <Panel
      title={SECTION_TITLES.languages}
      aside={count > 0 ? `${count} ${pluralize(count, PROFILE_TEXTS.count.languages)}` : undefined}
    >
      <div className="space-y-5">
        {count === 0 ? (
          <EmptyState
            compact
            title={PROFILE_TEXTS.emptyLanguages}
            hint={PROFILE_TEXTS.emptyLanguagesHint}
          />
        ) : (
          <ul className="divide-y divide-edge-muted text-sm">
            {languages.map((language) => (
              <li
                key={language.id}
                className="flex items-center gap-3 py-row transition-colors hover:bg-surface-hover"
              >
                <span className="flex-1 font-medium">{language.language}</span>
                <span className="rounded-md border border-edge bg-surface-muted px-1.5 py-0.5 text-xs font-medium text-fg-muted">
                  {LANGUAGE_LEVEL_LABELS[language.level]}
                </span>
                <RowDeleteButton
                  action={deleteLanguage.bind(null, language.id)}
                  ariaLabel={`${PROFILE_TEXTS.delete}: ${language.language}`}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-edge-muted pt-4">
          <LanguageAddForm action={addLanguage} />
        </div>
      </div>
    </Panel>
  );
}
