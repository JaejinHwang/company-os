import { useEffect, useState } from "react";
import {
  GitBranch,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { cn } from "../../lib/cn";
import type { OnboardingResult } from "./Onboarding";
import { ConfirmStep, type ConfirmValues } from "./ConfirmStep";

type Props = {
  onDone: (result: OnboardingResult) => void;
};

type Phase = "input" | "analyzing" | "confirm";

const STAGES = [
  { label: "Cloning repository…", duration: 700 },
  { label: "Scanning package.json & manifests…", duration: 800 },
  { label: "Detecting framework…", duration: 600 },
  { label: "Reading README & docs/…", duration: 900 },
  { label: "Inferring vision from commits…", duration: 1000 },
  { label: "Mapping agents to existing roles…", duration: 700 },
];

const SAMPLES = [
  "github.com/vercel/next.js",
  "github.com/lovable-dev/lovable",
  "~/Projects/my-startup",
];

const DETECTED: ConfirmValues = {
  companyName: "Lumen Labs",
  vision: "구현된 코드 위에 에이전트들이 자라는 워크스페이스",
  firstTask: "Pricing 페이지 카피 다시 쓰기 — 기존 로그인 페이지 톤 기반",
  firstAgent: "Engineer",
};

const TECH_HINTS = [
  { label: "Framework", value: "Next.js 15 (App Router)" },
  { label: "Lang", value: "TypeScript" },
  { label: "Lockfile", value: "pnpm-lock.yaml" },
  { label: "Stars", value: "12.3k" },
];

export function ExistingCodeFlow({ onDone }: Props) {
  const [phase, setPhase] = useState<Phase>("input");
  const [path, setPath] = useState("");
  const [stageIdx, setStageIdx] = useState(-1);
  const [values, setValues] = useState<ConfirmValues>(DETECTED);

  useEffect(() => {
    if (phase !== "analyzing") return;
    let cancelled = false;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      if (cancelled) return;
      if (i >= STAGES.length) {
        timer = setTimeout(() => {
          if (!cancelled) {
            setValues(DETECTED);
            setPhase("confirm");
          }
        }, 400);
        return;
      }
      setStageIdx(i);
      timer = setTimeout(() => {
        i += 1;
        run();
      }, STAGES[i].duration);
    };
    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phase]);

  const startAnalyze = () => {
    if (!path.trim()) return;
    setStageIdx(-1);
    setPhase("analyzing");
  };

  const isUrl = /^(https?:|github\.com)/i.test(path.trim());

  if (phase === "input") {
    return (
      <div className="w-full max-w-narrow">
        <header className="text-center">
          <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
            From existing code
          </p>
          <h2 className="mt-3 text-[34px] font-[600] tracking-[-0.9px] leading-[1.1] text-charcoal sm:text-[40px]">
            이미 짓고 있던 회사를, 그대로.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-[1.55] text-charcoal-muted">
            GitHub 레포나 로컬 디렉토리만 알려주세요. 나머지는 코드 안에 이미
            적혀 있어요.
          </p>
        </header>

        <div className="mt-8">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted transition-all">
              {isUrl ? (
                <GitBranch className="h-4 w-4" strokeWidth={1.6} />
              ) : (
                <FolderOpen className="h-4 w-4" strokeWidth={1.6} />
              )}
            </span>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startAnalyze()}
              placeholder="github.com/owner/repo  ·  ~/Projects/my-app"
              autoFocus
              className="w-full rounded-md border border-cream-light bg-cream py-3.5 pl-10 pr-4 text-[16px] text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.08em] text-charcoal-muted">
              예시
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {SAMPLES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => setPath(s)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2.5 text-[12px] text-charcoal transition animate-[fadeUp_400ms_ease-out_both] hover:bg-charcoal/[0.04]"
                >
                  {s.startsWith("github") ? (
                    <GitBranch className="h-3 w-3" strokeWidth={1.6} />
                  ) : (
                    <FolderOpen className="h-3 w-3" strokeWidth={1.6} />
                  )}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={startAnalyze}
            disabled={!path.trim()}
            className={cn(
              "btn-primary h-9 px-4 text-[13.5px]",
              !path.trim() && "opacity-40"
            )}
          >
            분석 시작
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    );
  }

  if (phase === "analyzing") {
    const progress = ((stageIdx + 1) / STAGES.length) * 100;
    return (
      <div className="w-full max-w-narrow">
        <header className="text-center">
          <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
            Analyzing
          </p>
          <h2 className="mt-3 truncate text-[26px] font-[600] tracking-[-0.5px] text-charcoal sm:text-[28px]">
            {path}
          </h2>
          <p className="mt-2 text-[13px] text-charcoal-muted">
            당신이 써둔 결을 천천히 따라가는 중이에요…
          </p>
        </header>

        <div className="mt-8 h-1.5 overflow-hidden rounded-pill bg-charcoal/[0.06]">
          <div
            className="h-full rounded-pill bg-charcoal transition-all duration-500 ease-gentle"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ul className="mt-6 flex flex-col gap-1.5">
          {STAGES.map((s, i) => {
            const done = i < stageIdx;
            const active = i === stageIdx;
            const pending = i > stageIdx;
            return (
              <li
                key={s.label}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] transition-all duration-300",
                  pending && "opacity-40",
                  active && "bg-charcoal/[0.04]"
                )}
              >
                {done ? (
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-success"
                    strokeWidth={1.8}
                  />
                ) : active ? (
                  <span className="relative grid h-4 w-4 shrink-0 place-items-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/40" />
                    <span className="relative h-2 w-2 rounded-full bg-blue-500" />
                  </span>
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border border-charcoal/20" />
                )}
                <span className={cn("text-charcoal", active && "font-[480]")}>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <ConfirmStep
      headerLabel="From existing code · 읽기 완료"
      headerTitle="코드에서 이런 회사가 보였어요."
      headerSub="이 모습 그대로 시작해도 좋고, 한 줄씩 다시 적어도 좋아요."
      values={values}
      onChange={setValues}
      backLabel="다른 코드로 분석"
      backIcon={<RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} />}
      onBack={() => {
        setPhase("input");
        setStageIdx(-1);
      }}
      onConfirm={() => onDone({ mode: "existing", ...values })}
      techHints={TECH_HINTS}
    />
  );
}
