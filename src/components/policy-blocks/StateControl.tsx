import { useEffect, useState } from "react";
import { Sliders } from "lucide-react";
import type { StateDef } from "../../lib/policy-parsing";
import { cn } from "../../lib/cn";

type Props = {
  state: StateDef;
  sectionSelector?: string;
};

export function StateControl({ state, sectionSelector }: Props) {
  const [value, setValue] = useState(state.default);
  const target = state.selectorTarget ?? sectionSelector;
  const attrKey = `data-${state.id}`;
  const currentOption = state.options.find((o) => o.value === value);

  useEffect(() => {
    if (!target) return;
    try {
      document.querySelectorAll(target).forEach((el) => {
        if (value === state.default) {
          el.removeAttribute(attrKey);
        } else {
          el.setAttribute(attrKey, value);
        }
      });
    } catch {
      // invalid selector
    }
  }, [value, target, attrKey, state.default]);

  useEffect(() => {
    return () => {
      if (!target) return;
      try {
        document
          .querySelectorAll(target)
          .forEach((el) => el.removeAttribute(attrKey));
      } catch {
        // ignore
      }
    };
  }, [target, attrKey]);

  return (
    <div className="rounded-lg border border-charcoal/15 bg-white p-3 shadow-sm ring-1 ring-charcoal/[0.03]">
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Sliders
          className="h-3.5 w-3.5 shrink-0 text-charcoal/45"
          strokeWidth={1.9}
        />
        <span className="text-[12.5px] font-semibold text-charcoal">
          {state.label}
        </span>
        <span className="text-[11px] uppercase tracking-[0.1em] text-charcoal/40">
          state
        </span>
      </div>
      <div className="inline-flex flex-wrap items-center gap-0.5 rounded-md border border-charcoal/10 bg-cream p-0.5">
        {state.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setValue(opt.value)}
            className={cn(
              "rounded px-2.5 py-1 text-[12px] font-medium transition",
              value === opt.value
                ? "bg-charcoal text-cream"
                : "text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {currentOption?.description && (
        <p className="mt-2.5 border-l-2 border-charcoal/15 pl-2.5 text-[12px] leading-snug text-charcoal/70">
          {currentOption.description}
        </p>
      )}
    </div>
  );
}
