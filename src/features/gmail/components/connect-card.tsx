import { GMAIL_TEXTS } from "../labels";

/** Адрес route handler, который отправляет на экран согласия Google. Обычная ссылка, не Link. */
export const CONNECT_PATH = "/api/gmail/connect";

/** Gmail ещё не подключён: объяснение прав и кнопка. */
export function ConnectCard() {
  return (
    <section className="space-y-4 rounded-lg border border-edge bg-surface p-card shadow-card">
      <div>
        <h2 className="text-lg font-semibold">{GMAIL_TEXTS.connectTitle}</h2>
        <p className="mt-1 text-sm text-fg-muted">{GMAIL_TEXTS.permissionsHint}</p>
      </div>
      <a
        href={CONNECT_PATH}
        className="inline-block rounded-md bg-accent px-4 py-control text-sm font-medium text-accent-on hover:bg-accent-hover"
      >
        {GMAIL_TEXTS.connect}
      </a>
    </section>
  );
}

/** Переменных Google в .env нет: подключать нечем. */
export function NotConfiguredCard() {
  return (
    <section className="rounded-lg border border-warning-edge bg-warning-soft p-card text-sm text-warning">
      <h2 className="text-lg font-semibold">{GMAIL_TEXTS.notConfiguredTitle}</h2>
      <p className="mt-1">{GMAIL_TEXTS.notConfiguredHint}</p>
    </section>
  );
}
