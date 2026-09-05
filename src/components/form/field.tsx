import type { ReactNode } from "react";

/** Классы для input, select и textarea во всех формах приложения. */
export const inputClass =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 aria-invalid:border-red-400";

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
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
