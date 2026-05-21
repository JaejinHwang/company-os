export type ComponentRef = {
  name: string;
  description?: string;
};

export type InteractionRef = {
  trigger: string;
  result: string;
  selector?: string;
  component?: string;
};

export type RuleRef = {
  kind: "must" | "must-not";
  text: string;
  component?: string;
};

export type StateOption = {
  value: string;
  label: string;
  description?: string;
};

/**
 * StateBinding tells the runtime what should actually happen when a state
 * option is selected — beyond CSS overlay simulation.
 *
 * - `kind: "real"` (default if `valueMap` is present) wires each option to a
 *   props patch that the screen merges into its React state. Use this when
 *   variations should actually re-render the prototype.
 * - `kind: "visual"` keeps the legacy behavior: only data-* attribute on the
 *   DOM + CSS ::after overlay. Use this for cheap simulation / when the real
 *   branching is not yet implemented in the screen code.
 *
 * `valueMap` maps each option `value` to a partial props patch. The runtime
 * merges patches for all "real" states active on the screen.
 */
export type StateBinding = {
  kind?: "real" | "visual";
  valueMap?: Record<string, Record<string, unknown>>;
  note?: string;
};

export type StateDef = {
  id: string;
  label: string;
  selectorTarget?: string;
  options: StateOption[];
  default: string;
  binding?: StateBinding;
};

export type SectionDef = {
  id: string;
  name: string;
  selector?: string;
  summary?: string;
  components?: ComponentRef[];
  interactions?: InteractionRef[];
  rules?: RuleRef[];
  states?: StateDef[];
};

export type ParsedPolicy = {
  preface: string;
  overview: string;
  sections: SectionDef[];
  crossCutting: string;
  /** Screen-level states extracted from ```states``` blocks in Overview / Cross-cutting. */
  screenStates: StateDef[];
};

const HEADING_RE = /^##\s+(.+)$/;
const SECTION_FENCE_RE = /```section\s*\n([\s\S]*?)\n```/g;
const STATES_FENCE_RE = /```states\s*\n([\s\S]*?)\n```/g;

function extractH2Sections(md: string): Map<string, string> {
  const lines = md.split("\n");
  const sections = new Map<string, string>();
  let currentHeading: string | null = "__preface__";
  let buffer: string[] = [];

  const flush = () => {
    if (currentHeading !== null) {
      sections.set(currentHeading, buffer.join("\n").trim());
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = HEADING_RE.exec(line);
    if (match) {
      flush();
      currentHeading = match[1].trim();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function extractSectionBlocks(md: string): SectionDef[] {
  const sections: SectionDef[] = [];
  let m: RegExpExecArray | null;
  SECTION_FENCE_RE.lastIndex = 0;
  while ((m = SECTION_FENCE_RE.exec(md))) {
    try {
      const data = JSON.parse(m[1]);
      if (data && typeof data === "object" && typeof data.id === "string") {
        sections.push({
          id: data.id,
          name: typeof data.name === "string" ? data.name : data.id,
          selector: data.selector,
          summary: data.summary,
          components: data.components,
          interactions: data.interactions,
          rules: data.rules,
          states: data.states,
        });
      }
    } catch {
      // skip malformed block
    }
  }
  return sections;
}

function stripSectionBlocks(md: string): string {
  return md.replace(SECTION_FENCE_RE, "").trim();
}

function extractScreenStateBlocks(md: string): StateDef[] {
  const out: StateDef[] = [];
  let m: RegExpExecArray | null;
  STATES_FENCE_RE.lastIndex = 0;
  while ((m = STATES_FENCE_RE.exec(md))) {
    try {
      const data = JSON.parse(m[1]);
      if (!Array.isArray(data)) continue;
      for (const raw of data) {
        if (
          raw &&
          typeof raw === "object" &&
          typeof raw.id === "string" &&
          Array.isArray(raw.options) &&
          typeof raw.default === "string"
        ) {
          out.push(raw as StateDef);
        }
      }
    } catch {
      // skip malformed
    }
  }
  return out;
}

export function parsePolicy(md: string): ParsedPolicy {
  const h2 = extractH2Sections(md);
  const sectionsBody = h2.get("Sections") ?? "";
  const overview = h2.get("Overview") ?? "";
  const crossCutting = h2.get("Cross-cutting") ?? "";
  return {
    preface: h2.get("__preface__") ?? "",
    overview,
    sections: extractSectionBlocks(sectionsBody),
    crossCutting,
    screenStates: [
      ...extractScreenStateBlocks(overview),
      ...extractScreenStateBlocks(crossCutting),
    ],
  };
}

/** All state definitions for a screen — screen-level + every section's states. */
export function collectStates(parsed: ParsedPolicy): StateDef[] {
  return [
    ...parsed.screenStates,
    ...parsed.sections.flatMap((s) => s.states ?? []),
  ];
}

export function sectionBodyWithoutBlocks(md: string): string {
  return stripSectionBlocks(md);
}
