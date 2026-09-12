import type { ReactNode } from "react";

import { updateSettings } from "../actions";
import { ACCENT_LABELS, DENSITY_LABELS, SETTINGS_TEXTS, THEME_LABELS } from "../labels";
import { ACCENTS, DENSITIES, THEMES, type UiSettings } from "../settings";

import { Dropdown } from "./dropdown";

/**
 * Меню оформления в шапке. Каждая кнопка отправляет одно поле формы
 * в Server Action, JS для самого выбора не нужен. Меню остаётся открытым,
 * чтобы можно было перебрать несколько вариантов подряд.
 */
export function SettingsMenu({ settings }: { settings: UiSettings }) {
  return (
    <Dropdown
      className="relative"
      summary={
        <summary
          className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-edge bg-surface px-2.5 py-1.5 text-sm text-fg-muted hover:bg-surface-hover hover:text-fg [&::-webkit-details-marker]:hidden"
          aria-label={SETTINGS_TEXTS.menu}
        >
          <span aria-hidden className="inline-block h-3 w-3 rounded-full bg-accent" />
          {SETTINGS_TEXTS.menu}
        </summary>
      }
    >
      <form
        action={updateSettings}
        className="absolute right-0 z-10 mt-2 w-72 space-y-3 rounded-lg border border-edge bg-surface p-3 shadow-card"
      >
        <Group title={SETTINGS_TEXTS.theme}>
          {THEMES.map((value) => (
            <Option key={value} name="theme" value={value} active={settings.theme === value}>
              {THEME_LABELS[value]}
            </Option>
          ))}
        </Group>

        <Group title={SETTINGS_TEXTS.accent}>
          {ACCENTS.map((value) => (
            <Option key={value} name="accent" value={value} active={settings.accent === value}>
              {/* data-accent на самом кружке подставляет цвет этого акцента, см. globals.css */}
              <span
                aria-hidden
                data-accent={value}
                className="inline-block h-3 w-3 rounded-full bg-accent"
              />
              {ACCENT_LABELS[value]}
            </Option>
          ))}
        </Group>

        <Group title={SETTINGS_TEXTS.density}>
          {DENSITIES.map((value) => (
            <Option key={value} name="density" value={value} active={settings.density === value}>
              {DENSITY_LABELS[value]}
            </Option>
          ))}
        </Group>
      </form>
    </Dropdown>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-fg-subtle">
        {title}
      </legend>
      <div className="flex flex-wrap gap-1">{children}</div>
    </fieldset>
  );
}

/** Кнопка-вариант. Текущий выбор подсвечен акцентом и помечен aria-pressed. */
function Option({
  name,
  value,
  active,
  children,
}: {
  name: string;
  value: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${
        active
          ? "border-accent bg-accent-soft text-accent-fg"
          : "border-edge bg-surface text-fg-muted hover:bg-surface-hover hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
