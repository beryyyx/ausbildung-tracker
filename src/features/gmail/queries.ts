import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  GMAIL_ACCOUNT_ID,
  applications,
  gmailAccount,
  gmailMessages,
  type GmailAccount,
  type GmailMessage,
} from "@/db/schema";

import type { ApplicationOption } from "./types";

/** Единственная строка подключённого аккаунта. undefined, пока Gmail не подключён. */
export async function getGmailAccount(): Promise<GmailAccount | undefined> {
  return await db
    .select()
    .from(gmailAccount)
    .where(eq(gmailAccount.id, GMAIL_ACCOUNT_ID))
    .get();
}

/** id всех сохранённых писем в любом состоянии: их заголовки повторно не запрашиваются. */
export async function listKnownMessageIds(): Promise<Set<string>> {
  const rows = await db
    .select({ messageId: gmailMessages.messageId })
    .from(gmailMessages);
  return new Set(rows.map((row) => row.messageId));
}

/** Письма, ждущие решения: свежие сверху. */
export async function listPendingMessages(): Promise<GmailMessage[]> {
  return await db
    .select()
    .from(gmailMessages)
    .where(eq(gmailMessages.state, "pending"))
    .orderBy(desc(gmailMessages.receivedAt), desc(gmailMessages.id));
}

export async function getPendingMessage(
  id: number,
): Promise<GmailMessage | undefined> {
  return await db
    .select()
    .from(gmailMessages)
    .where(and(eq(gmailMessages.id, id), eq(gmailMessages.state, "pending")))
    .get();
}

/** Все заявки, по компании и профессии, чтобы одинаковые компании стояли рядом. */
export async function listApplicationOptions(): Promise<ApplicationOption[]> {
  return await db
    .select({
      id: applications.id,
      company: applications.company,
      position: applications.position,
      city: applications.city,
      status: applications.status,
    })
    .from(applications)
    .orderBy(asc(applications.company), asc(applications.position), asc(applications.id));
}
