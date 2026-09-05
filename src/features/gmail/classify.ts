import { GMAIL_SUGGESTED_STATUSES, type GmailSuggestedStatus } from "@/db/schema";

import { normalizeText } from "./matching";

/**
 * Определение типа письма по ключевым словам в теме и первых строках.
 * Слова записаны в нормализованном виде (см. normalizeText): нижний регистр,
 * умлауты как ae/oe/ue/ss. Ищутся как подстроки, чтобы ловить немецкие
 * составные слова: «Terminvorschlag», «Absageschreiben».
 */
const KEYWORDS: Record<GmailSuggestedStatus, readonly string[]> = {
  invitation: [
    "einladung",
    "vorstellungsgespraech",
    "termin",
    "kennenlernen",
    "einladen",
    "gespraechstermin",
  ],
  rejected: [
    "absage",
    "leider",
    "bedauern",
    "bedauerlicherweise",
    "nicht beruecksichtigen",
    "abgesagt",
  ],
  sent: [
    "eingangsbestaetigung",
    "bewerbung erhalten",
    "eingegangen",
    "bewerbungseingang",
    "erhalten haben",
    "empfangsbestaetigung",
  ],
};

function kindsIn(text: string): GmailSuggestedStatus[] {
  const normalized = normalizeText(text);
  return GMAIL_SUGGESTED_STATUSES.filter((kind) =>
    KEYWORDS[kind].some((keyword) => normalized.includes(keyword)),
  );
}

/**
 * Тема важнее первых строк: если в теме слова ровно одного типа, берём его.
 * Если в теме пусто, смотрим первые строки. Слова разных типов сразу —
 * тип не определён (null), статус выберет пользователь.
 */
export function classifyMessage(
  subject: string,
  snippet: string,
): GmailSuggestedStatus | null {
  const inSubject = kindsIn(subject);
  if (inSubject.length === 1) return inSubject[0];
  if (inSubject.length > 1) return null;

  const inSnippet = kindsIn(snippet);
  return inSnippet.length === 1 ? inSnippet[0] : null;
}
