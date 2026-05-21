import { useMemo } from "react";
import { Sparkles } from "lucide-react";

type Requirement = {
  id: string;
  title: string;
  description?: string;
  scenarios?: string[];
};

type Props = { source: string };

function parseRequirements(src: string): Requirement[] {
  try {
    const data = JSON.parse(src);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (r) =>
        r &&
        typeof r === "object" &&
        typeof r.id === "string" &&
        typeof r.title === "string"
    );
  } catch {
    return [];
  }
}

export function UxRequirementsBlock({ source }: Props) {
  const items = useMemo(() => parseRequirements(source), [source]);
  if (items.length === 0) {
    return (
      <pre className="my-3 overflow-x-auto rounded-md bg-charcoal/90 p-3 text-[12.5px] text-cream">
        {source}
      </pre>
    );
  }
  return (
    <div className="my-4 space-y-2.5">
      {items.map((r) => (
        <div
          key={r.id}
          className="rounded-md border border-charcoal/10 bg-charcoal/[0.02] p-3"
        >
          <div className="flex items-start gap-2">
            <Sparkles
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563eb]/70"
              strokeWidth={1.8}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[13px] font-semibold text-charcoal">
                  {r.title}
                </span>
              </div>
              {r.description && (
                <p className="mt-1 text-[12.5px] leading-snug text-charcoal/75">
                  {r.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
