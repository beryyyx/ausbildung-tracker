import { GMAIL_TEXTS } from "../labels";

/** Адрес route handler, который отправляет на экран согласия Google. Обычная ссылка, не Link. */
export const CONNECT_PATH = "/api/gmail/connect";

/** Gmail ещё не подключён: объяснение прав и кнопка. */
export function ConnectCard() {
  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{GMAIL_TEXTS.connectTitle}</h2>
        <p className="mt-1 text-sm text-zinc-600">{GMAIL_TEXTS.permissionsHint}</p>
      </div>
      <a
        href={CONNECT_PATH}
        className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        {GMAIL_TEXTS.connect}
      </a>
    </section>
  );
}

/** Переменных Google в .env нет: подключать нечем. */
export function NotConfiguredCard() {
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
      <h2 className="text-lg font-semibold">{GMAIL_TEXTS.notConfiguredTitle}</h2>
      <p className="mt-1">{GMAIL_TEXTS.notConfiguredHint}</p>
    </section>
  );
}
