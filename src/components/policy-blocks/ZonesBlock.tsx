import { useMemo } from "react";
import { Crosshair } from "lucide-react";
import { useSelectorValidation } from "../../lib/policy-validation";
import { StatusDot } from "./StatusDot";

type Zone = {
  id: string;
  name: string;
  selector?: string;
  summary?: string;
};

type Props = { source: string };

function parseZones(source: string): Zone[] {
  try {
    const data = JSON.parse(source);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (z) => z && typeof z === "object" && typeof z.id === "string"
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

export function ZonesBlock({ source }: Props) {
  const zones = useMemo(() => parseZones(source), [source]);
  const statuses = useSelectorValidation(zones);
  if (zones.length === 0) {
    return (
      <pre className="my-3 overflow-x-auto rounded-md bg-charcoal/90 p-3 text-[12.5px] text-cream">
        {source}
      </pre>
    );
  }
  return (
    <div className="my-4 space-y-1.5">
      {zones.map((z, i) => (
        <div
          key={z.id}
          onMouseEnter={() => highlight(z.selector, true)}
          onMouseLeave={() => highlight(z.selector, false)}
          className="group flex cursor-default items-start gap-2.5 rounded-md border border-charcoal/10 bg-charcoal/[0.02] px-3 py-2.5 transition hover:border-info/40 hover:bg-info/[0.04]"
        >
          <Crosshair
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal/35 group-hover:text-info"
            strokeWidth={1.7}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-charcoal">
                {z.name}
              </span>
              <StatusDot status={statuses[i]} tone="zone" />
              {z.selector && (
                <code className="rounded bg-charcoal/10 px-1 py-px text-[10.5px] text-charcoal/55">
                  {z.selector}
                </code>
              )}
            </div>
            {z.summary && (
              <p className="mt-0.5 text-[12.5px] leading-snug text-charcoal/65">
                {z.summary}
              </p>
            )}
          </div>
        </div>
      ))}
      <p className="pt-1 text-[11.5px] text-charcoal/45">
        ↑ 항목 위에 마우스를 올리면 좌측 프로토타입에서 해당 영역이 표시됩니다.
      </p>
    </div>
  );
}
