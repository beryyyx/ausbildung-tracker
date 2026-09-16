import type { ReactNode } from "react";

/** Классы карточки без внутреннего отступа, для таблиц и списков со своими отступами. */
export const panelClass = "rounded-lg border border-edge bg-surface shadow-card";

/**
 * Карточка с шапкой. Заголовок слева, `aside` справа (счётчик, подсказка, кнопка).
 * Без title шапки нет, остаётся просто карточка с отступом.
 */
export function Panel({
  title,
  hint,
  aside,
  id,
  className,
  children,
}: {
  title?: string;
  hint?: string;
  aside?: ReactNode;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${panelClass} ${className ?? ""}`}>
      {title && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-edge-muted px-card py-item">
          <div>
            <h2 className="text-lg font-semibold leading-tight">{title}</h2>
            {hint && <p className="mt-0.5 text-sm text-fg-muted">{hint}</p>}
          </div>
          {aside && <div className="text-sm text-fg-muted">{aside}</div>}
        </header>
      )}
      <div className="p-card">{children}</div>
    </section>
  );
}
