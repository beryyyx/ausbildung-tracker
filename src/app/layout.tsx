import { ClipboardList, Mail, Plus, Search, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonClass } from "@/components/button";
import { Footer } from "@/components/footer";
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
  { href: "/", label: "Заявки", icon: ClipboardList },
  { href: "/suche", label: "Поиск", icon: Search },
  { href: "/profile", label: "Профиль", icon: UserRound },
  { href: "/gmail", label: "Gmail", icon: Mail },
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
          {/* На узком экране навигация уходит на вторую строку и прокручивается по горизонтали. */}
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 px-4">
            <Link
              href="/"
              className="mr-auto flex items-center gap-2 py-3 font-semibold tracking-tight md:mr-0"
            >
              <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-sm bg-accent" />
              Ausbildung Tracker
            </Link>
            <nav className="order-last -mx-1 flex basis-full items-center gap-1 overflow-x-auto text-sm md:order-none md:mx-0 md:basis-auto md:flex-1">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href} icon={<item.icon size={16} />}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2 py-2">
              <SettingsMenu settings={settings} />
              <Link href="/applications/new" className={buttonClass("primary", "sm")}>
                <Plus aria-hidden size={14} />
                <span className="sr-only sm:not-sr-only">Добавить</span>
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
