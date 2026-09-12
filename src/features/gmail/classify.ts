import { GMAIL_SUGGESTED_STATUSES, type GmailSuggestedStatus } from "@/db/schema";

import { normalizeText } from "./matching";

/**
 * Определение типа письма по ключевым словам в теме и первых строках.
 * Слова записаны в нормализованном виде (см. normalizeText): нижний регистр,
 * умлауты как ae/oe/ue/ss, знаки препинания заменены пробелом. Ищутся как
 * подстроки, чтобы ловить немецкие составные слова и формы: «absage» покрывает
 * «eine Absage» и «Absageschreiben», основа «nicht beruecksichtig» — и
 * «berücksichtigen», и «berücksichtigt». Одиночные «termin» и «leider» слишком
 * широкие (перенос срока, задержка ответа), поэтому только в сочетаниях.
 */
const KEYWORDS: Record<GmailSuggestedStatus, readonly string[]> = {
  invitation: [
    "einladung",
    "einladen",
    "vorstellungsgespraech",
    "bewerbungsgespraech",
    "kennenlerngespraech",
    "kennenlernen",
    "gespraechstermin",
    "terminvorschlag",
    "terminvorschlaege",
    "zu einem gespraech",
    "zum gespraech",
    "zum interview",
  ],
  rejected: [
    "absage",
    "abgesagt",
    "bedauerlicherweise",
    "wir bedauern",
    "unserem bedauern",
    "leider nicht",
    "leider keine",
    "leider muessen wir",
    "nicht beruecksichtig",
    "nicht weiter beruecksichtig",
    "anderen bewerber",
    "andere bewerber",
    "anderen kandidat",
    "andere kandidat",
    "fuer einen anderen",
    "keine zusage",
    "nicht entsprechen",
    "nicht entsprochen",
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
