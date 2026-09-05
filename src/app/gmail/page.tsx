import type { Metadata } from "next";

import { FormMessage } from "@/components/form/form-message";
import { AccountCard } from "@/features/gmail/components/account-card";
import { ConnectCard, NotConfiguredCard } from "@/features/gmail/components/connect-card";
import {
  SuggestionsList,
  type PendingSuggestion,
} from "@/features/gmail/components/suggestions-list";
import { getGmailEnv } from "@/features/gmail/env";
import {
  CALLBACK_ERROR_MESSAGES,
  GMAIL_TEXTS,
  isCallbackErrorCode,
} from "@/features/gmail/labels";
import { findCandidates } from "@/features/gmail/matching";
import {
  getGmailAccount,
  listApplicationOptions,
  listPendingMessages,
} from "@/features/gmail/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: GMAIL_TEXTS.pageTitle };

export default async function GmailPage({ searchParams }: PageProps<"/gmail">) {
  const { error } = await searchParams;
  const callbackError =
    typeof error !== "string"
      ? null
      : CALLBACK_ERROR_MESSAGES[isCallbackErrorCode(error) ? error : "unknown"];

  const env = getGmailEnv();
  const [account, messages, applications] = await Promise.all([
    getGmailAccount(),
    listPendingMessages(),
    listApplicationOptions(),
  ]);

  // Кандидаты пересчитываются при каждом показе: заявки могли добавиться или удалиться.
  const suggestions: PendingSuggestion[] = messages.map((message) => ({
    message,
    candidateIds: findCandidates(
      { address: message.fromAddress, name: message.fromName },
      message.subject,
      applications,
    ),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{GMAIL_TEXTS.pageTitle}</h1>
        <p className="mt-1 text-sm text-zinc-500">{GMAIL_TEXTS.pageHint}</p>
      </div>

      {callbackError && <FormMessage kind="error">{callbackError}</FormMessage>}

      {!env ? (
        <NotConfiguredCard />
      ) : account ? (
        <AccountCard account={account} />
      ) : (
        <ConnectCard />
      )}

      <SuggestionsList
        suggestions={suggestions}
        applications={applications}
        connected={Boolean(account)}
      />
    </div>
  );
}
