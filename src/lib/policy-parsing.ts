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

export type StateDef = {
  id: string;
  label: string;
  selectorTarget?: string;
  options: StateOption[];
  default: string;
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
};

const HEADING_RE = /^##\s+(.+)$/;
const SECTION_FENCE_RE = /```section\s*\n([\s\S]*?)\n```/g;

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

export function parsePolicy(md: string): ParsedPolicy {
  const h2 = extractH2Sections(md);
  const sectionsBody = h2.get("Sections") ?? "";
  return {
    preface: h2.get("__preface__") ?? "",
    overview: h2.get("Overview") ?? "",
    sections: extractSectionBlocks(sectionsBody),
    crossCutting: h2.get("Cross-cutting") ?? "",
  };
}

export function sectionBodyWithoutBlocks(md: string): string {
  return stripSectionBlocks(md);
}
