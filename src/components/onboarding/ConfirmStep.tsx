import { useEffect, useState, type ReactNode } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { AgentPicker, QuickPicks, type AgentName } from "./shared";

export type ConfirmValues = {
  companyName: string;
  vision: string;
  firstTask: string;
  firstAgent: string;
};

type Props = {
  headerLabel: string;
  headerTitle: string;
  headerSub?: string;
  values: ConfirmValues;
  onChange: (next: ConfirmValues) => void;
  onBack: () => void;
  backLabel: string;
  backIcon?: ReactNode;
  onConfirm: () => void;
  suggestions?: {
    name?: string[];
    vision?: string[];
    task?: string[];
  };
  techHints?: { label: string; value: string }[];
};

export function ConfirmStep({
  headerLabel,
  headerTitle,
  headerSub,
  values,
  onChange,
  onBack,
  backLabel,
  backIcon,
  onConfirm,
  suggestions,
  techHints,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const set = <K extends keyof ConfirmValues>(k: K, v: ConfirmValues[K]) =>
    onChange({ ...values, [k]: v });

  const canConfirm =
    values.companyName.trim().length > 0 &&
    values.vision.trim().length > 0 &&
    values.firstTask.trim().length > 0 &&
    values.firstAgent.trim().length > 0;

  return (
    <div className="w-full max-w-[680px]">
      <header
        className={cn(
          "text-center transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
          {headerLabel}
        </p>
        <h2 className="mt-3 text-[34px] font-[600] tracking-[-0.9px] leading-[1.1] text-charcoal sm:text-[40px]">
          {headerTitle}
        </h2>
        {headerSub && (
          <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-[1.55] text-charcoal-muted">
            {headerSub}
          </p>
        )}
      </header>

      <div className="mt-8 flex flex-col gap-5">
        <Field label="회사 이름" delay={100}>
          <input
            type="text"
            value={values.companyName}
            onChange={(e) => set("companyName", e.target.value)}
            placeholder="회사 이름"
            className="w-full rounded-md border border-cream-light bg-cream px-4 py-3 text-[17px] text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {suggestions?.name && (
            <QuickPicks
              options={suggestions.name}
              active={values.companyName}
              onPick={(v) => set("companyName", v)}
              animate={false}
            />
          )}
        </Field>

        <Field label="비전" delay={180}>
          <textarea
            rows={2}
            value={values.vision}
            onChange={(e) => set("vision", e.target.value)}
            placeholder="회사의 비전을 한 문장으로"
            className="w-full resize-none rounded-md border border-cream-light bg-cream px-4 py-3 text-[15px] leading-[1.5] text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {suggestions?.vision && (
            <QuickPicks
              options={suggestions.vision}
              active={values.vision}
              onPick={(v) => set("vision", v)}
              animate={false}
            />
          )}
        </Field>

        <Field label="첫 태스크" delay={260}>
          <input
            type="text"
            value={values.firstTask}
            onChange={(e) => set("firstTask", e.target.value)}
            placeholder="첫 번째 태스크"
            className="w-full rounded-md border border-cream-light bg-cream px-4 py-3 text-[15px] text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {suggestions?.task && (
            <QuickPicks
              options={suggestions.task}
              active={values.firstTask}
              onPick={(v) => set("firstTask", v)}
              animate={false}
            />
          )}
        </Field>

        <Field label="첫 에이전트" delay={340}>
          <AgentPicker
            value={values.firstAgent}
            onChange={(v: AgentName) => set("firstAgent", v)}
            animate={false}
          />
        </Field>
      </div>

      {techHints && techHints.length > 0 && (
        <div
          className="mt-5 flex flex-wrap items-center gap-1.5 animate-[fadeUp_500ms_ease-out_both]"
          style={{ animationDelay: "420ms" }}
        >
          <p className="text-[11px] uppercase tracking-[0.08em] text-charcoal-muted">
            코드에서 감지
          </p>
          {techHints.map((h) => (
            <span
              key={h.label}
              className="inline-flex h-6 items-center gap-1 rounded-pill border border-cream-light bg-cream px-2 text-[11.5px] text-charcoal"
            >
              <span className="text-charcoal-muted">{h.label}</span>
              <span>{h.value}</span>
            </span>
          ))}
        </div>
      )}

      <div
        className="mt-10 flex items-center justify-between animate-[fadeUp_500ms_ease-out_both]"
        style={{ animationDelay: "480ms" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-cream-light bg-cream px-3 text-[13.5px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
        >
          {backIcon}
          {backLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          className={cn(
            "btn-primary h-9 px-4 text-[13.5px] transition",
            !canConfirm && "opacity-40"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
          이대로 시작
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  delay,
}: {
  label: string;
  children: ReactNode;
  delay: number;
}) {
  return (
    <div
      className="animate-[fadeUp_500ms_ease-out_both]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="mb-2 text-[11.5px] uppercase tracking-[0.08em] text-charcoal-muted">
        {label}
      </p>
      {children}
    </div>
  );
}
