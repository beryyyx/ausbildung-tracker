import type { ReactNode } from "react";

/** Бейдж-пилюля. Цвет задаётся классами border-X-edge bg-X-soft text-X, точка красится в text-X. */
export function Badge({
  className,
  dot,
  children,
}: {
  className: string;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
