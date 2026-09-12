"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Пункт навигации в шапке. Текущий раздел подчёркнут акцентом, как вкладка. */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border-b-2 px-2 py-3 font-medium ${
        active
          ? "border-accent text-fg"
          : "border-transparent text-fg-muted hover:border-edge hover:text-fg"
      }`}
    >
      {children}
    </Link>
  );
}
