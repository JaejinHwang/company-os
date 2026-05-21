import { useEffect, useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "../../lib/cn";
import { ModePicker } from "./ModePicker";
import { FromScratchFlow } from "./FromScratchFlow";
import { ExistingCodeFlow } from "./ExistingCodeFlow";
import { OracleFlow } from "./OracleFlow";

export type OnboardingMode = "scratch" | "existing" | "oracle";

export type OnboardingResult = {
  mode: OnboardingMode;
  companyName: string;
  vision: string;
  firstTask: string;
  firstAgent: string;
};

type Props = {
  onComplete: (result: OnboardingResult) => void;
};

type Phase = "picker" | OnboardingMode | "splash";

export function Onboarding({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("picker");
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "picker") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "1") setPhase("scratch");
      else if (e.key === "2") setPhase("existing");
      else if (e.key === "3") setPhase("oracle");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const finish = (r: OnboardingResult) => {
    setResult(r);
    setPhase("splash");
    window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(() => onComplete(r), 600);
    }, 2000);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-cream text-charcoal transition-opacity duration-500",
        leaving ? "opacity-0 pointer-events-none" : mounted ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full blur-3xl transition-all duration-[1400ms] ease-gentle",
            phase === "picker" && "bg-accent/[0.06]",
            phase === "scratch" && "bg-success/[0.06]",
            phase === "existing" && "bg-info/[0.06]",
            phase === "oracle" && "bg-warning/[0.08]",
            phase === "splash" && "bg-accent/[0.10] scale-150"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full blur-3xl transition-all duration-[1400ms] ease-gentle",
            phase === "picker" && "bg-warning/[0.05]",
            phase === "scratch" && "bg-info/[0.05]",
            phase === "existing" && "bg-success/[0.05]",
            phase === "oracle" && "bg-danger/[0.06]",
            phase === "splash" && "bg-success/[0.10] scale-150"
          )}
        />
      </div>

      <div className="relative flex h-full flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-charcoal text-[13px] font-[600] text-charcoal-offwhite shadow-inset-dark">
              C
            </span>
            <span className="text-[14.5px] font-[480] text-charcoal">Cream</span>
          </div>
          <div className="flex items-center gap-2">
            {phase !== "picker" && phase !== "splash" && (
              <button
                type="button"
                onClick={() => setPhase("picker")}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] text-charcoal-muted transition hover:bg-charcoal/[0.04] hover:text-charcoal"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
                모드 다시 고르기
              </button>
            )}
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-6">
          <div
            key={phase}
            className="w-full animate-[fadeUp_500ms_ease-out_both] flex justify-center"
          >
            {phase === "picker" && <ModePicker onSelect={(m) => setPhase(m)} />}
            {phase === "scratch" && <FromScratchFlow onDone={finish} />}
            {phase === "existing" && <ExistingCodeFlow onDone={finish} />}
            {phase === "oracle" && <OracleFlow onDone={finish} />}
            {phase === "splash" && result && <Splash result={result} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function Splash({ result }: { result: OnboardingResult }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-pill bg-charcoal text-charcoal-offwhite shadow-inset-dark">
        <Sparkles className="h-7 w-7 animate-pulse" strokeWidth={1.6} />
      </div>
      <p className="mt-6 text-[12.5px] uppercase tracking-[0.08em] text-charcoal-muted">
        Day one
      </p>
      <h2 className="mt-3 text-[40px] font-[600] tracking-[-1px] leading-[1.05] text-charcoal sm:text-[48px]">
        반가워요, {result.companyName}.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.55] text-charcoal-muted">
        당신의 자리가 준비돼 있어요. 들어가서 첫 일을 시작해볼까요?
      </p>
    </div>
  );
}
