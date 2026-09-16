/**
 * Классы кнопок и ссылок-кнопок. Одна функция на все страницы, чтобы состояния
 * (наведение, фокус, нажатие, отключённая) везде совпадали. Подходит и для
 * <button>, и для <Link>/<a>: у ссылок просто не бывает disabled.
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,box-shadow] duration-100 " +
  "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
  "disabled:pointer-events-none disabled:opacity-55 aria-busy:cursor-wait";

const SIZES: Record<ButtonSize, string> = {
  md: "px-4 py-control text-sm",
  sm: "px-2.5 py-1 text-xs",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-on shadow-card hover:bg-accent-hover active:bg-accent-hover active:shadow-none",
  secondary:
    "border border-edge bg-surface text-fg shadow-card hover:bg-surface-hover active:bg-surface-muted active:shadow-none",
  danger:
    "border border-danger-edge bg-surface text-danger hover:bg-danger-soft active:bg-danger-soft",
  ghost: "text-fg-muted hover:bg-surface-hover hover:text-fg active:bg-surface-muted",
};

export function buttonClass(variant: ButtonVariant = "secondary", size: ButtonSize = "md") {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]}`;
}
