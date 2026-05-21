import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Crosshair,
  MousePointer2,
  X,
} from "lucide-react";
import { useSelectorValidation } from "../../lib/policy-validation";
import { StatusDot } from "./StatusDot";

type Component = { name: string; description?: string };
type Interaction = { trigger: string; result: string; selector?: string };
type Rule = { kind: "must" | "must-not"; text: string };
type Section = {
  id: string;
  name?: string;
  selector?: string;
  summary?: string;
  components?: Component[];
  interactions?: Interaction[];
  rules?: Rule[];
};

type Props = { source: string };

function parseSection(src: string): Section | null {
  try {
    const data = JSON.parse(src);
    if (data && typeof data === "object" && typeof data.id === "string") {
      return data as Section;
    }
    return null;
  } catch {
    return null;
  }
}

function highlight(selector: string | undefined, on: boolean) {
  if (!selector) return;
  try {
    document
      .querySelectorAll(selector)
      .forEach((el) => el.classList.toggle("policy-zone-highlight", on));
  } catch {
    // invalid selector
  }
}

export function SectionBlock({ source }: Props) {
  const section = useMemo(() => parseSection(source), [source]);
  const [expanded, setExpanded] = useState(true);

  const validationItems = useMemo(() => {
    if (!section) return [];
    return [
      { selector: section.selector },
      ...(section.interactions?.map((i) => ({ selector: i.selector })) ?? []),
    ];
  }, [section]);

  const statuses = useSelectorValidation(validationItems);
  const sectionStatus = statuses[0];
  const interactionStatuses = statuses.slice(1);

  if (!section) {
    return (
      <pre className="my-3 overflow-x-auto rounded-md bg-charcoal/90 p-3 text-[12.5px] text-cream">
        {source}
      </pre>
    );
  }

  const hasComponents =
    section.components && section.components.length > 0;
  const hasInteractions =
    section.interactions && section.interactions.length > 0;
  const hasRules = section.rules && section.rules.length > 0;

  return (
    <div
      onMouseEnter={() => highlight(section.selector, true)}
      onMouseLeave={() => highlight(section.selector, false)}
      className="my-3 overflow-hidden rounded-lg border border-charcoal/10 bg-charcoal/[0.02] transition hover:border-[#2563eb]/40 hover:bg-[#2563eb]/[0.04]"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        {expanded ? (
          <ChevronDown
            className="h-3.5 w-3.5 shrink-0 text-charcoal/50"
            strokeWidth={1.8}
          />
        ) : (
          <ChevronRight
            className="h-3.5 w-3.5 shrink-0 text-charcoal/50"
            strokeWidth={1.8}
          />
        )}
        <Crosshair
          className="h-3.5 w-3.5 shrink-0 text-charcoal/35"
          strokeWidth={1.7}
        />
        <span className="text-[13px] font-semibold text-charcoal">
          {section.name ?? section.id}
        </span>
        <StatusDot status={sectionStatus} tone="zone" />
        {section.selector && (
          <code className="ml-auto rounded bg-charcoal/10 px-1 py-px text-[10.5px] text-charcoal/55">
            {section.selector}
          </code>
        )}
      </button>

      {section.summary && (
        <p className="-mt-1 px-3 pb-2.5 pl-[2.05rem] text-[12.5px] leading-snug text-charcoal/65">
          {section.summary}
        </p>
      )}

      {expanded && (hasComponents || hasInteractions || hasRules) && (
        <div className="space-y-3 border-t border-charcoal/10 bg-white/50 px-3 py-3">
          {hasComponents && (
            <Group label="Components">
              <ul className="space-y-1">
                {section.components!.map((c, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-baseline gap-x-2 text-[12.5px] leading-snug"
                  >
                    <span className="font-medium text-charcoal">{c.name}</span>
                    {c.description && (
                      <span className="text-charcoal/65">— {c.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Group>
          )}

          {hasInteractions && (
            <Group label="Interactions">
              <div className="space-y-1.5">
                {section.interactions!.map((it, i) => (
                  <div
                    key={i}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      highlight(section.selector, false);
                      highlight(it.selector, true);
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      highlight(it.selector, false);
                      highlight(section.selector, true);
                    }}
                    className="flex items-start gap-2 rounded-md bg-white px-2.5 py-1.5 ring-1 ring-charcoal/5"
                  >
                    <MousePointer2
                      className="mt-0.5 h-3 w-3 shrink-0 text-charcoal/45"
                      strokeWidth={1.8}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span className="text-[12.5px] font-medium text-charcoal">
                          {it.trigger}
                        </span>
                        <StatusDot
                          status={interactionStatuses[i]}
                          tone="interaction"
                        />
                        {it.selector && (
                          <code className="rounded bg-charcoal/10 px-1 py-px text-[10px] text-charcoal/50">
                            {it.selector}
                          </code>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-start gap-1 text-[12px] text-charcoal/70">
                        <ArrowRight
                          className="mt-[3px] h-2.5 w-2.5 shrink-0 text-charcoal/35"
                          strokeWidth={2}
                        />
                        <span>{it.result}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Group>
          )}

          {hasRules && (
            <Group label="Rules">
              <ul className="space-y-1">
                {section.rules!.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    {r.kind === "must" ? (
                      <Check
                        className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <X
                        className="mt-0.5 h-3 w-3 shrink-0 text-red-600"
                        strokeWidth={2.5}
                      />
                    )}
                    <span className="text-[12.5px] leading-snug text-charcoal/85">
                      {r.text}
                    </span>
                  </li>
                ))}
              </ul>
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-charcoal/45">
        {label}
      </div>
      {children}
    </div>
  );
}
