import { useMemo } from "react";

type Scenario = {
  id: string;
  name?: string;
  given: string;
  when: string;
  then: string;
};

type Props = { source: string };

function parseScenarios(src: string): Scenario[] {
  try {
    const data = JSON.parse(src);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (s) =>
        s &&
        typeof s === "object" &&
        typeof s.id === "string" &&
        typeof s.given === "string" &&
        typeof s.when === "string" &&
        typeof s.then === "string"
    );
  } catch {
    return [];
  }
}

export function ScenariosBlock({ source }: Props) {
  const items = useMemo(() => parseScenarios(source), [source]);
  if (items.length === 0) {
    return (
      <pre className="my-3 overflow-x-auto rounded-md bg-charcoal/90 p-3 text-[12.5px] text-cream">
        {source}
      </pre>
    );
  }
  return (
    <div className="my-4 space-y-3">
      {items.map((s) => (
        <div
          key={s.id}
          data-scenario-id={s.id}
          className="rounded-md border border-charcoal/10 bg-charcoal/[0.02] p-3.5 transition"
        >
          <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[13.5px] font-semibold text-charcoal">
              {s.name ?? s.id}
            </span>
          </div>
          <Step label="Given" text={s.given} />
          <Step label="When" text={s.when} />
          <Step label="Then" text={s.then} />
        </div>
      ))}
    </div>
  );
}

function Step({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-3 py-1">
      <span className="w-12 shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-charcoal/50">
        {label}
      </span>
      <span className="flex-1 text-[12.5px] leading-snug text-charcoal/85">
        {text}
      </span>
    </div>
  );
}
