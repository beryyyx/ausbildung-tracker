"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Пункт навигации в шапке. Текущий раздел подчёркнут акцентом, как вкладка. */
export function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  /** Готовый элемент иконки: компонент из lucide нельзя передать в клиентский компонент. */
  icon: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 font-medium outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent ${
        active
          ? "border-accent text-fg"
          : "border-transparent text-fg-muted hover:border-edge hover:text-fg"
      }`}
    >
      <span aria-hidden className={active ? "text-accent-fg" : ""}>
        {icon}
      </span>
      {children}
    </Link>
  );
}
