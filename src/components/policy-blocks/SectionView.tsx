import { useMemo } from "react";
import {
  ArrowRight,
  Check,
  Crosshair,
  MousePointer2,
  X,
} from "lucide-react";
import { useSelectorValidation } from "../../lib/policy-validation";
import type { SectionDef } from "../../lib/policy-parsing";
import { StateControl } from "./StateControl";
import { StatusDot } from "./StatusDot";

type Props = {
  section: SectionDef;
  screenHash: string;
};

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

export function SectionView({ section, screenHash }: Props) {
  const validationItems = useMemo(
    () => [
      { selector: section.selector },
      ...(section.interactions?.map((i) => ({ selector: i.selector })) ?? []),
    ],
    [section]
  );
  const statuses = useSelectorValidation(validationItems);
  const sectionStatus = statuses[0];
  const interactionStatuses = statuses.slice(1);

  const hasComponents =
    section.components && section.components.length > 0;
  const hasInteractions =
    section.interactions && section.interactions.length > 0;
  const hasRules = section.rules && section.rules.length > 0;
  const hasStates = section.states && section.states.length > 0;

  return (
    <article
      onMouseEnter={() => highlight(section.selector, true)}
      onMouseLeave={() => highlight(section.selector, false)}
      className="space-y-6"
    >
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Crosshair
            className="h-4 w-4 shrink-0 text-charcoal/40"
            strokeWidth={1.7}
          />
          <h3 className="text-[18px] font-semibold tracking-[-0.2px] text-charcoal">
            {section.name}
          </h3>
          <StatusDot status={sectionStatus} tone="zone" />
        </div>
        {section.summary && (
          <p className="text-[13.5px] leading-relaxed text-charcoal/70">
            {section.summary}
          </p>
        )}
      </header>

      {hasStates && (
        <div className="space-y-2">
          {section.states!.map((s) => (
            <StateControl
              key={s.id}
              state={s}
              screenHash={screenHash}
              sectionSelector={section.selector}
            />
          ))}
        </div>
      )}

      {hasComponents && (
        <Group label="Components" hint="이 섹션을 구성하는 UI 요소">
          <ul className="space-y-2">
            {section.components!.map((c, i) => (
              <li
                key={i}
                className="rounded-md border border-charcoal/10 bg-charcoal/[0.02] px-3 py-2"
              >
                <div className="text-[13px] font-semibold text-charcoal">
                  {c.name}
                </div>
                {c.description && (
                  <p className="mt-0.5 text-[12.5px] leading-snug text-charcoal/70">
                    {c.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Group>
      )}

      {hasInteractions && (
        <Group label="Interactions" hint="호버 시 좌측 프로토타입에서 trigger 요소 표시">
          <ul className="space-y-2">
            {section.interactions!.map((it, i) => (
              <li
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
                className="rounded-md border border-charcoal/10 bg-charcoal/[0.02] px-3 py-2.5 transition hover:border-info/40 hover:bg-info/[0.04]"
              >
                <div className="flex items-start gap-2">
                  <MousePointer2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal/45"
                    strokeWidth={1.8}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[13px] font-semibold text-charcoal">
                        {it.trigger}
                      </span>
                      <StatusDot
                        status={interactionStatuses[i]}
                        tone="interaction"
                      />
                      {it.component && (
                        <span className="rounded-full bg-charcoal/10 px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-charcoal/55">
                          {it.component}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-start gap-1.5 text-[12.5px] leading-snug text-charcoal/75">
                      <ArrowRight
                        className="mt-0.5 h-3 w-3 shrink-0 text-charcoal/35"
                        strokeWidth={2}
                      />
                      <span>{it.result}</span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Group>
      )}

      {hasRules && (
        <Group label="Rules" hint="이 섹션에 적용되는 정책 · 금지">
          <ul className="space-y-2">
            {section.rules!.map((r, i) => (
              <li
                key={i}
                className={
                  "flex items-start gap-2 rounded-md border px-3 py-2 " +
                  (r.kind === "must"
                    ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                    : "border-red-500/20 bg-red-500/[0.04]")
                }
              >
                {r.kind === "must" ? (
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                    strokeWidth={2.5}
                  />
                ) : (
                  <X
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600"
                    strokeWidth={2.5}
                  />
                )}
                <div className="min-w-0 flex-1">
                  {r.component && (
                    <span className="mr-1 inline-block rounded-full bg-charcoal/10 px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-charcoal/55">
                      {r.component}
                    </span>
                  )}
                  <span className="text-[13px] leading-snug text-charcoal/85">
                    {r.text}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Group>
      )}
    </article>
  );
}

function Group({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-2 flex items-baseline gap-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-charcoal/65">
          {label}
        </h4>
        {hint && (
          <span className="text-[11px] text-charcoal/45">— {hint}</span>
        )}
      </header>
      {children}
    </section>
  );
}

