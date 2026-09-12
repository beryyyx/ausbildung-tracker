// Проверка контраста WCAG по токенам из globals.css. Запуск: node scripts/contrast.mjs src/app/globals.css [--all]
// Читает пары light-dark(#a, #b) и считает контраст «текст на фоне» для обеих тем.
// Порог 4.5:1 для текста, 1.5:1 для рамок бейджей (декоративный ориентир, не WCAG).
import { readFileSync } from "node:fs";

const css = readFileSync(process.argv[2], "utf8");
const tokens = {};
for (const m of css.matchAll(/--([a-z-]+):\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/gi)) {
  tokens[m[1]] = { light: m[2], dark: m[3] };
}
// Акценты: по одному набору на data-accent
const accents = {};
for (const m of css.matchAll(/\[data-accent="(\w+)"\]\s*\{([^}]*)\}/g)) {
  const a = {};
  for (const t of m[2].matchAll(/--([a-z-]+):\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/gi)) {
    a[t[1]] = { light: t[2], dark: t[3] };
  }
  accents[m[1]] = a;
}

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const rows = [];
const check = (label, fg, bg, min) => {
  for (const theme of ["light", "dark"]) {
    const r = ratio(fg[theme], bg[theme]);
    rows.push({ theme, label, fg: fg[theme], bg: bg[theme], ratio: r.toFixed(2), min, ok: r >= min ? "ok" : "FAIL" });
  }
};

for (const bg of ["canvas", "surface", "surface-muted", "surface-hover"]) {
  for (const fg of ["fg", "fg-muted", "fg-subtle"]) check(`${fg} / ${bg}`, tokens[fg], tokens[bg], 4.5);
}
check("edge / surface", tokens.edge, tokens.surface, 1.2);
for (const x of ["neutral", "info", "success", "warning", "danger", "purple"]) {
  check(`${x} / ${x}-soft`, tokens[x], tokens[`${x}-soft`], 4.5);
  check(`${x} / surface`, tokens[x], tokens.surface, 4.5);
  check(`${x}-edge / ${x}-soft (рамка)`, tokens[`${x}-edge`], tokens[`${x}-soft`], 1.5);
}
const white = { light: "#ffffff", dark: "#ffffff" };
for (const [name, a] of Object.entries(accents)) {
  check(`accent-on / accent (${name})`, white, a.accent, 4.5);
  check(`accent-fg / surface (${name})`, a["accent-fg"], tokens.surface, 4.5);
  check(`accent-fg / canvas (${name})`, a["accent-fg"], tokens.canvas, 4.5);
}

const fails = rows.filter((r) => r.ok === "FAIL");
console.table(process.argv.includes("--all") ? rows : fails);
console.log(fails.length ? `${fails.length} пар ниже порога` : "все пары проходят");
