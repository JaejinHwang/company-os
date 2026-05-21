import { useMemo } from "react";
import { ArrowRight, MousePointer2 } from "lucide-react";
import { useSelectorValidation } from "../../lib/policy-validation";
import { StatusDot } from "./StatusDot";

type Interaction = {
  trigger: string;
  result: string;
  selector?: string;
};

type Props = { source: string };

function parseInteractions(source: string): Interaction[] {
  try {
    const data = JSON.parse(source);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (i) =>
        i &&
        typeof i === "object" &&
        typeof i.trigger === "string" &&
        typeof i.result === "string"
    );
  } catch {
    return [];
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

export function InteractionsBlock({ source }: Props) {
  const items = useMemo(() => parseInteractions(source), [source]);
  const statuses = useSelectorValidation(items);
  if (items.length === 0) {
    return (
      <pre className="my-3 overflow-x-auto rounded-md bg-charcoal/90 p-3 text-[12.5px] text-cream">
        {source}
      </pre>
    );
  }
  return (
    <div className="my-4 space-y-1.5">
      {items.map((it, i) => (
        <div
          key={i}
          onMouseEnter={() => highlight(it.selector, true)}
          onMouseLeave={() => highlight(it.selector, false)}
          className="group flex cursor-default items-start gap-2 rounded-md border border-charcoal/10 bg-charcoal/[0.02] p-3 transition hover:border-info/40 hover:bg-info/[0.04]"
        >
          <MousePointer2
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal/35 group-hover:text-info"
            strokeWidth={1.8}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[13px] font-semibold text-charcoal">
                {it.trigger}
              </span>
              <StatusDot status={statuses[i]} tone="interaction" />
              {it.selector && (
                <code className="rounded bg-charcoal/10 px-1 py-px text-[10.5px] text-charcoal/55">
                  {it.selector}
                </code>
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
      ))}
      <p className="pt-1 text-[11.5px] text-charcoal/45">
        ↑ 항목 위에 마우스를 올리면 좌측 프로토타입에서 해당 trigger 요소가 표시됩니다.
      </p>
    </div>
  );
}
