import { useMemo } from "react";
import type { StateDef } from "../../lib/policy-parsing";
import { StateControl } from "./StateControl";

type Props = { source: string };

function parseStates(src: string): StateDef[] {
  try {
    const data = JSON.parse(src);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (s) =>
        s &&
        typeof s === "object" &&
        typeof s.id === "string" &&
        typeof s.label === "string" &&
        Array.isArray(s.options) &&
        typeof s.default === "string"
    );
  } catch {
    return [];
  }
}

export function ScreenStatesBlock({ source }: Props) {
  const states = useMemo(() => parseStates(source), [source]);
  if (states.length === 0) {
    return (
      <pre className="my-3 overflow-x-auto rounded-md bg-charcoal/90 p-3 text-[12.5px] text-cream">
        {source}
      </pre>
    );
  }
  return (
    <div className="my-4 space-y-2">
      {states.map((s) => (
        <StateControl key={s.id} state={s} />
      ))}
    </div>
  );
}
