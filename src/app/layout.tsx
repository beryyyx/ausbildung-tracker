import type { Metadata } from "next";
import Link from "next/link";

import { NavLink } from "@/components/nav-link";
import { SettingsMenu } from "@/features/settings/components/settings-menu";
import { readSettings } from "@/features/settings/cookies";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ausbildung Tracker",
    template: "%s · Ausbildung Tracker",
  },
  description: "Учёт заявок на Ausbildung",
};

const NAV_ITEMS = [
  { href: "/", label: "Заявки" },
  { href: "/suche", label: "Поиск" },
  { href: "/profile", label: "Профиль" },
  { href: "/gmail", label: "Gmail" },
] as const;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Настройки оформления читаются на сервере: страница приходит сразу в нужной теме.
  const settings = await readSettings();

  return (
    <html
      lang="ru"
      className="h-full antialiased"
      data-theme={settings.theme === "system" ? undefined : settings.theme}
      data-accent={settings.accent}
      data-density={settings.density}
    >
      <body className="flex min-h-full flex-col bg-canvas text-fg">
        <header className="border-b border-edge bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4">
            <Link href="/" className="flex items-center gap-2 py-3 font-semibold tracking-tight">
              <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm bg-accent" />
              Ausbildung Tracker
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2 py-2">
              <SettingsMenu settings={settings} />
              <Link
                href="/applications/new"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-on hover:bg-accent-hover"
              >
                + Добавить
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
