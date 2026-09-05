/**
 * Сопоставление письма с заявками: по домену отправителя и по названию
 * компании в теме или имени отправителя. Чистые функции без базы,
 * поэтому список кандидатов можно пересчитать при показе страницы.
 */

export type MatchableApplication = {
  id: number;
  company: string;
};

export type Sender = {
  address: string;
  name: string | null;
};

/** Юридические формы и связки, которые не несут смысла при сравнении названий. */
const NOISE_WORDS = new Set([
  "gmbh",
  "mbh",
  "ag",
  "kg",
  "ohg",
  "se",
  "ev",
  "e",
  "v",
  "co",
  "cie",
  "inc",
  "ltd",
  "llc",
  "und",
  "and",
  "die",
  "der",
  "das",
  "the",
  "of",
  "group",
  "gruppe",
  "holding",
]);

/**
 * Почтовые сервисы: домен ничего не говорит о компании, сравниваем только по названию.
 * Письмо с личного ящика рекрутера всё ещё может совпасть по теме.
 */
const GENERIC_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "web.de",
  "gmx.de",
  "gmx.net",
  "outlook.com",
  "outlook.de",
  "hotmail.com",
  "hotmail.de",
  "live.de",
  "yahoo.de",
  "yahoo.com",
  "t-online.de",
  "icloud.com",
  "freenet.de",
  "posteo.de",
  "mail.de",
]);

/** Части составных доменных зон вроде `co.uk`, `com.de`: не считаются ядром домена. */
const SECOND_LEVEL_ZONES = new Set(["co", "com", "org", "net", "gov", "ac", "edu"]);

/** Минимальная длина слова, чтобы совпадение с доменом что-то значило. */
const MIN_TOKEN_LENGTH = 3;
/** Минимальная длина для совпадения по вхождению, иначе «sap» найдётся в «sapient». */
const MIN_PARTIAL_LENGTH = 5;

/** Нижний регистр, умлауты → ae/oe/ue/ss, остальные диакритики убираются, всё кроме букв и цифр → пробел. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Значимые слова названия компании: без юридических форм и связок. */
export function companyTokens(company: string): string[] {
  return normalizeText(company)
    .split(" ")
    .filter((token) => token.length >= MIN_TOKEN_LENGTH && !NOISE_WORDS.has(token));
}

/** Разбор заголовка From: `"Name" <addr@x.de>`, `Name <addr@x.de>` или просто `addr@x.de`. */
export function parseFromHeader(raw: string): Sender {
  const trimmed = raw.trim();
  const angle = trimmed.match(/^(.*?)<([^<>]+)>\s*$/);
  if (angle) {
    const name = angle[1].trim().replace(/^"(.*)"$/, "$1").trim();
    return { address: angle[2].trim().toLowerCase(), name: name || null };
  }
  return { address: trimmed.toLowerCase(), name: null };
}

/** Домен адреса без `@`. Пустая строка, если адрес без домена. */
export function senderDomain(address: string): string {
  const at = address.lastIndexOf("@");
  return at === -1 ? "" : address.slice(at + 1).toLowerCase();
}

/**
 * Ядро домена: метка перед доменной зоной. `karriere.bofrost.de` → `bofrost`,
 * `mail.example.co.uk` → `example`. Для почтовых сервисов пусто.
 */
export function domainCore(domain: string): string {
  if (!domain || GENERIC_DOMAINS.has(domain)) return "";
  const labels = domain.split(".").filter(Boolean);
  if (labels.length < 2) return "";
  labels.pop(); // зона верхнего уровня
  if (labels.length >= 2 && SECOND_LEVEL_ZONES.has(labels[labels.length - 1])) {
    labels.pop();
  }
  return normalizeText(labels[labels.length - 1] ?? "").replace(/ /g, "");
}

/** Есть ли фраза в тексте целиком, по границам слов. Оба уже нормализованы. */
function containsPhrase(text: string, phrase: string): boolean {
  if (!phrase) return false;
  return ` ${text} `.includes(` ${phrase} `);
}

/** Подходит ли заявка к письму. */
export function matchesApplication(
  company: string,
  sender: Sender,
  subject: string,
): boolean {
  const tokens = companyTokens(company);
  if (tokens.length === 0) return false;

  const core = domainCore(senderDomain(sender.address));
  if (core) {
    const joined = tokens.join("");
    if (tokens.includes(core) || joined === core) return true;
    // «bofrost» ↔ «bofrostonline», «deutschetelekom» ↔ «telekom»: только для длинных названий.
    if (
      core.length >= MIN_PARTIAL_LENGTH &&
      joined.length >= MIN_PARTIAL_LENGTH &&
      (joined.includes(core) || core.includes(joined))
    ) {
      return true;
    }
  }

  const phrase = tokens.join(" ");
  const haystack = normalizeText(`${subject} ${sender.name ?? ""} ${sender.address}`);
  return containsPhrase(haystack, phrase);
}

/** id всех заявок, к которым подходит письмо. Порядок как в списке заявок. */
export function findCandidates(
  sender: Sender,
  subject: string,
  applications: MatchableApplication[],
): number[] {
  return applications
    .filter((application) => matchesApplication(application.company, sender, subject))
    .map((application) => application.id);
}
