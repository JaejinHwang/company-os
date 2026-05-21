#!/usr/bin/env node
/**
 * check-policy.mjs
 *
 * Static validator for every `src/screens/*\/policy.md`. Catches the kind of
 * silent-failure that the runtime parser swallows (invalid JSON in a fenced
 * block falls back to a code block; missing required fields just disappear
 * from the UI; cross-refs to non-existent ids look fine until clicked).
 *
 * Run: `npm run check:policy`
 * Exit code 1 if any policy file has at least one error.
 *
 * Checks per file:
 *   - All fenced ```scenarios | ux-requirements | section | states``` blocks
 *     parse as JSON.
 *   - scenario / ux-requirement / section ids are unique within the file
 *     and have their required fields.
 *   - ux-requirement.scenarios values reference existing scenario ids.
 *   - state.options[].value contains the state.default value.
 *   - state.binding.valueMap keys reference existing option values.
 *   - rule.kind is "must" | "must-not".
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCREENS_DIR = "src/screens";

const policies = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_")) continue; // _registry.ts, _template, etc.
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (entry === "policy.md") policies.push(p);
  }
}
walk(join(ROOT, SCREENS_DIR));

let errors = 0;
function err(file, msg) {
  console.error(`✗ ${relative(ROOT, file)}: ${msg}`);
  errors += 1;
}

function extractBlocks(src, lang) {
  const re = new RegExp("```" + lang + "\\s*\\n([\\s\\S]*?)\\n```", "g");
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

function parseJSONSafe(file, label, raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {
    err(file, `${label}: invalid JSON — ${e.message}`);
    return null;
  }
}

function validateState(file, ctx, state) {
  if (!state || typeof state !== "object") {
    err(file, `${ctx}: state must be an object`);
    return;
  }
  if (!state.id) {
    err(file, `${ctx}: state missing id`);
    return;
  }
  const tag = `state "${state.id}"`;
  if (!state.label) err(file, `${ctx}: ${tag} missing label`);
  if (!Array.isArray(state.options) || state.options.length === 0) {
    err(file, `${ctx}: ${tag} missing options[]`);
    return;
  }
  if (!state.default) err(file, `${ctx}: ${tag} missing default`);

  const optionValues = new Set();
  for (const o of state.options) {
    if (!o?.value) err(file, `${ctx}: ${tag} option missing value`);
    if (!o?.label) err(file, `${ctx}: ${tag} option missing label`);
    if (o?.value) optionValues.add(o.value);
  }
  if (state.default && !optionValues.has(state.default)) {
    err(
      file,
      `${ctx}: ${tag} default "${state.default}" not in options[]`
    );
  }

  const binding = state.binding;
  if (binding && typeof binding === "object" && binding.valueMap) {
    if (typeof binding.valueMap !== "object" || Array.isArray(binding.valueMap)) {
      err(file, `${ctx}: ${tag} binding.valueMap must be an object`);
    } else {
      for (const key of Object.keys(binding.valueMap)) {
        if (!optionValues.has(key)) {
          err(
            file,
            `${ctx}: ${tag} binding.valueMap key "${key}" not in options[].value`
          );
        }
      }
    }
    if (binding.kind && binding.kind !== "real" && binding.kind !== "visual") {
      err(file, `${ctx}: ${tag} binding.kind must be "real" or "visual"`);
    }
  }
}

function validatePolicy(file, src) {
  // 1. scenarios
  const scenarioIds = new Set();
  for (const raw of extractBlocks(src, "scenarios")) {
    const data = parseJSONSafe(file, "scenarios block", raw);
    if (!data) continue;
    if (!Array.isArray(data)) {
      err(file, "scenarios block: must be an array");
      continue;
    }
    for (const s of data) {
      if (!s?.id) {
        err(file, "scenario item missing id");
        continue;
      }
      if (scenarioIds.has(s.id)) err(file, `duplicate scenario id "${s.id}"`);
      scenarioIds.add(s.id);
      for (const k of ["given", "when", "then"]) {
        if (!s[k]) err(file, `scenario "${s.id}" missing ${k}`);
      }
    }
  }

  // 2. ux-requirements
  const reqIds = new Set();
  for (const raw of extractBlocks(src, "ux-requirements")) {
    const data = parseJSONSafe(file, "ux-requirements block", raw);
    if (!data) continue;
    if (!Array.isArray(data)) {
      err(file, "ux-requirements block: must be an array");
      continue;
    }
    for (const r of data) {
      if (!r?.id) {
        err(file, "ux-requirement item missing id");
        continue;
      }
      if (reqIds.has(r.id)) err(file, `duplicate ux-requirement id "${r.id}"`);
      reqIds.add(r.id);
      if (!r.title) err(file, `ux-requirement "${r.id}" missing title`);
      if (Array.isArray(r.scenarios)) {
        for (const sid of r.scenarios) {
          if (!scenarioIds.has(sid)) {
            err(
              file,
              `ux-requirement "${r.id}" references unknown scenario "${sid}"`
            );
          }
        }
      }
    }
  }

  // 3. section
  const sectionIds = new Set();
  for (const raw of extractBlocks(src, "section")) {
    const data = parseJSONSafe(file, "section block", raw);
    if (!data) continue;
    if (!data.id) {
      err(file, "section missing id");
      continue;
    }
    if (sectionIds.has(data.id)) err(file, `duplicate section id "${data.id}"`);
    sectionIds.add(data.id);
    if (!data.name) err(file, `section "${data.id}" missing name`);

    if (Array.isArray(data.interactions)) {
      for (const it of data.interactions) {
        if (!it?.trigger)
          err(file, `section "${data.id}" interaction missing trigger`);
        if (!it?.result)
          err(file, `section "${data.id}" interaction missing result`);
      }
    }
    if (Array.isArray(data.rules)) {
      for (const r of data.rules) {
        if (r?.kind !== "must" && r?.kind !== "must-not") {
          err(
            file,
            `section "${data.id}" rule.kind must be "must" or "must-not"`
          );
        }
        if (!r?.text) err(file, `section "${data.id}" rule missing text`);
      }
    }
    if (Array.isArray(data.states)) {
      for (const st of data.states) {
        validateState(file, `section "${data.id}"`, st);
      }
    }
  }

  // 4. screen-level states
  for (const raw of extractBlocks(src, "states")) {
    const data = parseJSONSafe(file, "states block", raw);
    if (!data) continue;
    if (!Array.isArray(data)) {
      err(file, "states block: must be an array");
      continue;
    }
    for (const st of data) validateState(file, "screen-level", st);
  }
}

for (const file of policies) {
  validatePolicy(file, readFileSync(file, "utf8"));
}

if (errors > 0) {
  console.error(
    `\n${errors} error(s) across ${policies.length} policy file(s) — fix before merging.`
  );
  process.exit(1);
}
console.log(`✓ ${policies.length} policy file(s) valid (no JSON / schema / cross-ref errors)`);
