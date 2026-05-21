#!/usr/bin/env node
/**
 * check-design-tokens.mjs
 *
 * Static check for design-system token compliance. Flags places where source
 * code uses arbitrary color / spacing values instead of the tokens defined in
 * `tailwind.config.cjs` and described in `DESIGN.md`.
 *
 * Modes:
 *   - report  (default): print findings, always exit 0
 *   - strict           : exit 1 if any error-level finding
 *
 * Usage:
 *   npm run check:design          # report
 *   npm run check:design -- --strict
 *
 * Allowlist:
 *   - File paths in ALLOW_PATHS (policy tooling — see CLAUDE.md §8.5)
 *   - Lines containing `design-tokens-allow` comment
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC_DIR = "src";
const STRICT = process.argv.includes("--strict");

// Files where intentional non-token colors are allowed (policy tooling has its
// own visual language distinct from product UI — see CLAUDE.md §8.5).
const ALLOW_PATHS = [
  "src/components/policy-blocks/",
  "src/components/PolicyPanel.tsx",
  "src/components/MarkdownView.tsx",
  "src/lib/policy-validation.ts",
];

// Per-line escape hatch.
const LINE_ALLOW_MARKER = "design-tokens-allow";

// Extensions to scan.
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

// ---------- pattern definitions ----------

// Tailwind utility prefixes that take a color value.
const COLOR_PREFIXES = [
  "bg",
  "text",
  "border",
  "ring",
  "ring-offset",
  "outline",
  "fill",
  "stroke",
  "from",
  "to",
  "via",
  "decoration",
  "caret",
  "accent",
  "shadow",
  "divide",
  "placeholder",
];

// Tailwind utility prefixes that take a length value (spacing / sizing).
const LENGTH_PREFIXES = [
  "p", "px", "py", "pt", "pb", "pl", "pr",
  "m", "mx", "my", "mt", "mb", "ml", "mr",
  "gap", "gap-x", "gap-y",
  "space-x", "space-y",
  "w", "h", "min-w", "min-h", "max-w", "max-h",
  "top", "bottom", "left", "right",
  "inset", "inset-x", "inset-y",
];

// Arbitrary hex color inside a tailwind utility: e.g. bg-[#ff0000]
const RE_ARBITRARY_HEX = new RegExp(
  `\\b(${COLOR_PREFIXES.join("|")})-\\[#[0-9a-fA-F]{3,8}\\]`,
  "g"
);

// Arbitrary rgb/rgba/hsl/hsla inside a tailwind utility: e.g. bg-[rgba(28,28,28,0.04)]
const RE_ARBITRARY_FUNC_COLOR = new RegExp(
  `\\b(${COLOR_PREFIXES.join("|")})-\\[(rgba?|hsla?)\\(`,
  "g"
);

// Arbitrary px / rem / em length: e.g. p-[7px], gap-[12px], h-[42px]
const RE_ARBITRARY_LENGTH = new RegExp(
  `\\b(${LENGTH_PREFIXES.join("|")})-\\[\\d+(\\.\\d+)?(px|rem|em)\\]`,
  "g"
);

// Inline style with a hex color string: style={{ color: '#ff0000' }} etc.
const RE_INLINE_HEX = /style\s*=\s*\{\{[^}]*['"]#[0-9a-fA-F]{3,8}['"]/g;

// ---------- file walking ----------

const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      walk(p);
      continue;
    }
    const ext = entry.slice(entry.lastIndexOf("."));
    if (EXTS.has(ext)) files.push(p);
  }
}
walk(join(ROOT, SRC_DIR));

// ---------- scan ----------

const findings = {
  "arbitrary-hex": [],
  "arbitrary-rgba": [],
  "arbitrary-length": [],
  "inline-hex": [],
};

function isAllowedPath(rel) {
  return ALLOW_PATHS.some((p) => rel.startsWith(p));
}

for (const file of files) {
  const rel = relative(ROOT, file);
  if (isAllowedPath(rel)) continue;

  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes(LINE_ALLOW_MARKER)) return;
    const lineno = i + 1;

    const hits = (re, key) => {
      const matches = line.match(re);
      if (!matches) return;
      for (const m of matches) {
        findings[key].push({ rel, lineno, match: m });
      }
    };

    hits(RE_ARBITRARY_HEX, "arbitrary-hex");
    hits(RE_ARBITRARY_FUNC_COLOR, "arbitrary-rgba");
    hits(RE_ARBITRARY_LENGTH, "arbitrary-length");
    hits(RE_INLINE_HEX, "inline-hex");
  });
}

// ---------- report ----------

const CATEGORY_INFO = {
  "arbitrary-hex": {
    title: "Arbitrary hex color in tailwind utility",
    hint: "Use a token from tailwind.config.cjs (e.g. bg-charcoal, text-cream).",
  },
  "arbitrary-rgba": {
    title: "Arbitrary rgb/rgba/hsl color in tailwind utility",
    hint: "Use opacity modifier (e.g. bg-charcoal/10) or add a semantic token.",
  },
  "arbitrary-length": {
    title: "Arbitrary px/rem/em spacing or sizing",
    hint: "Use tailwind's spacing scale (p-2, gap-3, h-9, ...). Custom sizes belong in tailwind.config.cjs.",
  },
  "inline-hex": {
    title: "Inline style with hex color",
    hint: "Move to a tailwind class with a token, or extract into @layer components.",
  },
};

let totalErrors = 0;
let totalAll = 0;

for (const [key, items] of Object.entries(findings)) {
  totalAll += items.length;
  if (key !== "arbitrary-length") totalErrors += items.length; // length is warning-tier
}

if (totalAll === 0) {
  console.log(`✓ ${files.length} source file(s) scanned, no design-token violations.`);
  process.exit(0);
}

console.log(`\nDesign-token scan — ${files.length} file(s) scanned, ${totalAll} finding(s).\n`);

for (const [key, items] of Object.entries(findings)) {
  if (items.length === 0) continue;
  const info = CATEGORY_INFO[key];
  console.log(`▼ ${info.title}  [${items.length}]`);
  console.log(`  ${info.hint}\n`);

  // Group by file for readability.
  const byFile = new Map();
  for (const it of items) {
    if (!byFile.has(it.rel)) byFile.set(it.rel, []);
    byFile.get(it.rel).push(it);
  }
  for (const [rel, hits] of byFile) {
    console.log(`  ${rel}`);
    for (const h of hits) {
      console.log(`    L${h.lineno}: ${h.match}`);
    }
  }
  console.log();
}

console.log(
  `Summary: ${totalAll} finding(s) — ${totalErrors} error-tier, ${totalAll - totalErrors} warning-tier (arbitrary-length).`
);
console.log(
  `Allowlist: paths under [${ALLOW_PATHS.join(", ")}] and lines containing \`${LINE_ALLOW_MARKER}\`.`
);

if (STRICT && totalErrors > 0) {
  console.error(`\n✗ Strict mode: ${totalErrors} error-tier finding(s). Fix or allowlist before merging.`);
  process.exit(1);
}

// Report-only (or strict but no errors)
process.exit(0);
