import type { GmailMessage } from "@/db/schema";

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
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{GMAIL_TEXTS.suggestionsTitle}</h2>

      {suggestions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {connected
            ? GMAIL_TEXTS.suggestionsEmpty
            : GMAIL_TEXTS.suggestionsEmptyNotConnected}
        </p>
      ) : (
        <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white shadow-sm">
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
