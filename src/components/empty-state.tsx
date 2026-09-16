import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Пустое состояние: иконка, заголовок, подсказка и, если есть, действие.
 * `compact` — для блоков внутри карточек (оценки, языки), без иконки и с малыми отступами.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
  action,
  compact,
}: {
  /** Иконка lucide, по умолчанию Inbox. */
  icon?: LucideIcon;
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
    <div className="flex flex-col items-center rounded-lg border border-dashed border-edge bg-surface px-6 py-10 text-center">
      <span
        aria-hidden
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-fg-muted"
      >
        <Icon size={22} />
      </span>
      <p className="text-lg font-medium text-fg">{title}</p>
      {hint && <p className="mt-1 max-w-md text-sm text-fg-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
