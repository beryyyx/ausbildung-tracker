import type { ReactNode } from "react";

/** Классы для input, select и textarea во всех формах приложения. */
export const inputClass =
  "mt-1 block w-full rounded-md border border-edge bg-surface px-3 py-control text-sm text-fg outline-none transition-[border-color,box-shadow] duration-100 " +
  "placeholder:text-fg-subtle hover:border-neutral-edge focus:border-accent focus:ring-1 focus:ring-accent " +
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-muted " +
  "aria-invalid:border-danger aria-invalid:focus:ring-danger";

/**
 * Подпись, поле и ошибка под ним. `name` должен совпадать с id элемента
 * ввода внутри, чтобы клик по подписи ставил фокус в поле.
 */
export function Field({
  name,
  label,
  error,
  required,
  className,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-fg">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
