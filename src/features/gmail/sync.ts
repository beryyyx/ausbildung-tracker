import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { GMAIL_ACCOUNT_ID, gmailAccount, gmailMessages, type NewGmailMessage } from "@/db/schema";

import { withAccessToken } from "./account";
import { classifyMessage } from "./classify";
import { fetchManyMetadata, listMessageIds } from "./client";
import { findCandidates, parseFromHeader } from "./matching";
import { listApplicationOptions, listKnownMessageIds } from "./queries";
import { GmailError, type SyncOutcome, type SyncSummary } from "./types";

/** Окно синхронизации в днях. */
export const SYNC_WINDOW_DAYS = 60;
/** Сколько писем максимум просматриваем за одну синхронизацию, свежие первыми. */
export const SYNC_MESSAGE_LIMIT = 1000;
/** Сколько строк вставляем одним запросом: у SQLite есть лимит на число параметров. */
const INSERT_CHUNK = 100;

/**
 * Поисковый запрос Gmail. Свои письма, чаты, спам и корзина не нужны;
 * рекламные и социальные рубрики убираем, ответы компаний туда не попадают.
 * Если рубрики в ящике выключены, эти условия просто ничего не отсекают.
 */
const SEARCH_QUERY = [
  `newer_than:${SYNC_WINDOW_DAYS}d`,
  "-from:me",
  "-in:chats",
  "-in:spam",
  "-in:trash",
  "-category:promotions",
  "-category:social",
].join(" ");

/**
 * Синхронизация: список писем за окно, заголовки только для новых,
 * сопоставление с заявками, сохранение совпавших. Ошибки не бросает.
 * В консоль попадают только числа и коды ошибок, никогда темы или текст.
 */
export async function runGmailSync(): Promise<SyncOutcome> {
  try {
    const [applications, known] = await Promise.all([
      listApplicationOptions(),
      listKnownMessageIds(),
    ]);

    const { ids, truncated } = await withAccessToken((token) =>
      listMessageIds(token, SEARCH_QUERY, SYNC_MESSAGE_LIMIT),
    );
    const fresh = ids.filter((id) => !known.has(id));
    const messages = await withAccessToken((token) => fetchManyMetadata(token, fresh));

    const rows: NewGmailMessage[] = [];
    for (const message of messages) {
      const sender = parseFromHeader(message.from);
      const candidates = findCandidates(sender, message.subject, applications);
      if (candidates.length === 0) continue;

      rows.push({
        messageId: message.id,
        fromAddress: sender.address,
        fromName: sender.name,
        subject: message.subject,
        receivedAt: message.receivedAt,
        // При нескольких кандидатах заявку выбирает пользователь.
        applicationId: candidates.length === 1 ? candidates[0] : null,
        suggestedStatus: classifyMessage(message.subject, message.snippet),
      });
    }

    for (let start = 0; start < rows.length; start += INSERT_CHUNK) {
      await db
        .insert(gmailMessages)
        .values(rows.slice(start, start + INSERT_CHUNK))
        .onConflictDoNothing({ target: gmailMessages.messageId });
    }

    const summary: SyncSummary = {
      listed: ids.length,
      examined: fresh.length,
      matched: rows.length,
      unmatched: fresh.length - rows.length,
      truncated,
    };

    await db
      .update(gmailAccount)
      .set({
        lastSyncedAt: new Date(),
        lastSyncListed: summary.listed,
        lastSyncExamined: summary.examined,
        lastSyncMatched: summary.matched,
      })
      .where(eq(gmailAccount.id, GMAIL_ACCOUNT_ID));

    console.info(
      `[gmail] sync: listed ${summary.listed}, examined ${summary.examined}, matched ${summary.matched}`,
    );
    return { ok: true, summary };
  } catch (error) {
    if (error instanceof GmailError) {
      // message — наша собственная строка с кодом ошибки Google, без содержимого писем.
      console.error(
        `[gmail] sync failed: ${error.kind}${error.status ? ` (${error.status})` : ""}: ${error.message}`,
      );
      return { ok: false, kind: error.kind };
    }
    console.error("[gmail] sync failed", error);
    return { ok: false, kind: "unknown" };
  }
}
