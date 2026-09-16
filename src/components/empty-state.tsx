import type { ReactNode } from "react";

/**
 * Пустое состояние: иконка, заголовок, подсказка и, если есть, действие.
 * `compact` — для блоков внутри карточек (оценки, языки), без иконки и с малыми отступами.
 */
export function EmptyState({
  title,
  hint,
  action,
  compact,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="rounded-md border border-dashed border-edge px-3 py-item text-center text-sm text-fg-muted">
        {title}
        {hint && <span className="block text-xs text-fg-subtle">{hint}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-edge bg-surface px-6 py-12 text-center">
      <span
        aria-hidden
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-fg-subtle"
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2.75C2 1.784 2.784 1 3.75 1h8.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25ZM5 5.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 5.25Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 8.25Zm0 3a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" />
        </svg>
      </span>
      <p className="text-lg font-medium text-fg">{title}</p>
      {hint && <p className="mt-1 max-w-md text-sm text-fg-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
