import type { ApplicationStatus } from "@/db/schema";

/**
 * Виды ошибок модуля Gmail. По kind интерфейс подбирает понятное сообщение,
 * сами тексты в labels.ts. Тексты писем в ошибки никогда не попадают.
 */
export type GmailErrorKind =
  | "not-configured" // нет переменных окружения Google
  | "not-connected" // аккаунт не подключён
  | "reconnect-required" // Google отверг refresh_token (invalid_grant)
  | "invalid-client" // Google не принял GOOGLE_CLIENT_ID или GOOGLE_CLIENT_SECRET
  | "network"
  | "timeout"
  | "http"
  | "invalid-response";

export class GmailError extends Error {
  readonly kind: GmailErrorKind;
  readonly status?: number;

  constructor(kind: GmailErrorKind, message: string, status?: number) {
    super(message);
    this.name = "GmailError";
    this.kind = kind;
    this.status = status;
  }
}

/** Токены после обмена кода или обновления. refreshToken есть только при обмене кода. */
export type TokenSet = {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
};

/** Заявка в выпадающем списке предложения и при сопоставлении. */
export type ApplicationOption = {
  id: number;
  company: string;
  position: string;
  city: string | null;
  status: ApplicationStatus;
};

/** Заголовки одного письма. Snippet живёт только в памяти во время синхронизации. */
export type MessageMetadata = {
  id: string;
  /** Сырой заголовок From, например `"Name" <addr@example.de>`. */
  from: string;
  subject: string;
  /** Первые ~200 символов письма, как их отдаёт Gmail. В базу не пишется. */
  snippet: string;
  receivedAt: Date;
};

/** Сводка синхронизации: по ней видно, насколько хорошо работает сопоставление. */
export type SyncSummary = {
  /** Сколько писем за окно синхронизации нашёл Gmail (не больше лимита). */
  listed: number;
  /** Сколько из них новых: заголовки забирали и сопоставляли. */
  examined: number;
  /** Сколько новых писем совпало хотя бы с одной заявкой. */
  matched: number;
  /** Сколько новых писем не совпало ни с одной заявкой. */
  unmatched: number;
  /** Gmail нашёл больше писем, чем лимит: просмотрены только самые свежие. */
  truncated: boolean;
};

export type SyncOutcome =
  | { ok: true; summary: SyncSummary }
  | { ok: false; kind: GmailErrorKind | "unknown" };
