"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { APPLICATION_STATUSES, gmailMessages } from "@/db/schema";
import { setApplicationStatus } from "@/features/applications/actions";
import { getApplication } from "@/features/applications/queries";

import { deleteAccount } from "./account";
import { GMAIL_TEXTS } from "./labels";
import { getPendingMessage } from "./queries";
import { runGmailSync } from "./sync";
import type { SyncOutcome } from "./types";

const GMAIL_PATH = "/gmail";

const idSchema = z.number().int().positive();
const statusSchema = z.enum(APPLICATION_STATUSES);

export type SyncFormState = {
  outcome?: SyncOutcome;
};

/**
 * Кнопка «Синхронизировать». Итог возвращается форме, список предложений
 * обновляется через revalidate. Аргументы useActionState (состояние, FormData) не нужны.
 */
export async function syncGmail(): Promise<SyncFormState> {
  const outcome = await runGmailSync();
  revalidatePath(GMAIL_PATH);
  return { outcome };
}

/** Кнопка «Отключить»: токены стираются из базы. */
export async function disconnectGmail(): Promise<void> {
  await deleteAccount();
  revalidatePath(GMAIL_PATH);
}

export type SuggestionResult = { ok: true } | { ok: false; message: string };

/**
 * Подтверждение предложения: статус заявки меняется только здесь, по кнопке.
 * Заявку и статус пользователь мог выбрать вручную, поэтому проверяем всё заново.
 */
export async function applySuggestion(
  messageId: number,
  applicationId: number,
  status: string,
): Promise<SuggestionResult> {
  const parsedStatus = statusSchema.safeParse(status);
  if (
    !idSchema.safeParse(messageId).success ||
    !idSchema.safeParse(applicationId).success ||
    !parsedStatus.success
  ) {
    return { ok: false, message: GMAIL_TEXTS.applyError };
  }

  const [message, application] = await Promise.all([
    getPendingMessage(messageId),
    getApplication(applicationId),
  ]);
  if (!message || !application) {
    return { ok: false, message: GMAIL_TEXTS.applyError };
  }

  // Та же логика, что у быстрой смены статуса в таблице: подставляет дату отправки.
  await setApplicationStatus(applicationId, parsedStatus.data);
  await db
    .update(gmailMessages)
    .set({ applicationId, state: "applied" })
    .where(eq(gmailMessages.id, messageId));

  revalidatePath(GMAIL_PATH);
  return { ok: true };
}

/** «Не про заявку»: письмо больше не предлагается, заявки не трогаются. */
export async function dismissSuggestion(messageId: number): Promise<SuggestionResult> {
  if (!idSchema.safeParse(messageId).success) {
    return { ok: false, message: GMAIL_TEXTS.dismissError };
  }

  const message = await getPendingMessage(messageId);
  if (!message) return { ok: false, message: GMAIL_TEXTS.dismissError };

  await db
    .update(gmailMessages)
    .set({ state: "dismissed" })
    .where(eq(gmailMessages.id, messageId));

  revalidatePath(GMAIL_PATH);
  return { ok: true };
}
