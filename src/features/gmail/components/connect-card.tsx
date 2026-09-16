import { Mail } from "lucide-react";

import { buttonClass } from "@/components/button";
import { Panel } from "@/components/panel";

import { GMAIL_TEXTS } from "../labels";

/** Адрес route handler, который отправляет на экран согласия Google. Обычная ссылка, не Link. */
export const CONNECT_PATH = "/api/gmail/connect";

/** Gmail ещё не подключён: объяснение прав и кнопка. */
export function ConnectCard() {
  return (
    <Panel title={GMAIL_TEXTS.connectTitle}>
      <div className="space-y-4">
        <p className="text-sm text-fg-muted">{GMAIL_TEXTS.permissionsHint}</p>
        <a href={CONNECT_PATH} className={buttonClass("primary")}>
          <Mail aria-hidden size={14} />
          {GMAIL_TEXTS.connect}
        </a>
      </div>
    </Panel>
  );
}

/** Переменных Google в .env нет: подключать нечем. */
export function NotConfiguredCard() {
  return (
    <section
      role="alert"
      className="rounded-lg border border-warning-edge bg-warning-soft p-card text-sm text-warning"
    >
      <h2 className="text-lg font-semibold">{GMAIL_TEXTS.notConfiguredTitle}</h2>
      <p className="mt-1">{GMAIL_TEXTS.notConfiguredHint}</p>
    </section>
  );
}
