import { MailCheck } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { panelClass } from "@/components/panel";
import type { GmailMessage } from "@/db/schema";
import { pluralize } from "@/lib/plural";

import { GMAIL_TEXTS } from "../labels";
import type { ApplicationOption } from "../types";

import { SuggestionRow } from "./suggestion-row";

/** Письмо, ждущее решения, и заявки, которые к нему подходят по текущим правилам. */
export type PendingSuggestion = {
  message: GmailMessage;
  candidateIds: number[];
};

export function SuggestionsList({
  suggestions,
  applications,
  connected,
}: {
  suggestions: PendingSuggestion[];
  applications: ApplicationOption[];
  connected: boolean;
}) {
  const count = suggestions.length;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold">{GMAIL_TEXTS.suggestionsTitle}</h2>
        {count > 0 && (
          <span className="text-sm text-fg-muted">
            {count} {pluralize(count, ["письмо", "письма", "писем"])}
          </span>
        )}
      </div>

      {count === 0 ? (
        <EmptyState
          icon={MailCheck}
          title={GMAIL_TEXTS.suggestionsEmptyTitle}
          hint={
            connected
              ? GMAIL_TEXTS.suggestionsEmpty
              : GMAIL_TEXTS.suggestionsEmptyNotConnected
          }
        />
      ) : (
        <ul className={`${panelClass} divide-y divide-edge-muted`}>
          {suggestions.map(({ message, candidateIds }) => (
            <SuggestionRow
              key={message.id}
              message={message}
              candidateIds={candidateIds}
              applications={applications}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
