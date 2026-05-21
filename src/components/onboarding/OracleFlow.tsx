import { useEffect, useRef, useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import { cn } from "../../lib/cn";
import type { OnboardingResult } from "./Onboarding";
import { ConfirmStep, type ConfirmValues } from "./ConfirmStep";

type Props = {
  onDone: (result: OnboardingResult) => void;
};

const POOL_NAMES = [
  "Helio Labs",
  "Aurora",
  "Cinder",
  "Atlas Works",
  "Foundry",
  "Pluto",
  "Vellum",
  "Boreal",
  "Lumen",
  "Glacier",
];

const POOL_VISIONS = [
  "에이전트가 회사를 만드는 회사를 만든다",
  "혼자서도 운영되는 가장 작은 SaaS",
  "들어오는 시그널이 곧 내일의 매출이 되는 워크스페이스",
  "디자인·코드·운영을 한 호흡으로 묶는 운영체제",
  "팀의 OS를 다시 발명한다",
  "AI 에이전트가 매주 새 제품을 만드는 스튜디오",
];

const POOL_TASKS = [
  "Landing v1 디자인 + 카피 작성",
  "Stripe 결제 + 인보이스 자동화",
  "Discord 커뮤니티 베타 오픈",
  "온보딩 step 3 재설계",
  "데모 데이 데크 v1 작성",
  "초기 사용자 10명 인터뷰",
  "Hacker News Show HN 게시",
];

const POOL_AGENTS = ["CEO", "CTO", "UXDesigner", "Marketer", "Engineer"];

function rollOnce(): ConfirmValues {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  return {
    companyName: pick(POOL_NAMES),
    vision: pick(POOL_VISIONS),
    firstTask: pick(POOL_TASKS),
    firstAgent: pick(POOL_AGENTS),
  };
}

type Phase = "idle" | "rolling" | "reveal" | "confirm";

export function OracleFlow({ onDone }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ConfirmValues | null>(null);
  const [shuffleTick, setShuffleTick] = useState<ConfirmValues | null>(null);
  const [revealStep, setRevealStep] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "rolling") return;
    const start = Date.now();
    const ROLL_MS = 1400;
    const update = () => {
      setShuffleTick(rollOnce());
      tickRef.current = window.setTimeout(() => {
        if (Date.now() - start < ROLL_MS) update();
      }, 90);
    };
    update();
    const settle = window.setTimeout(() => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
      const final = rollOnce();
      setResult(final);
      setShuffleTick(final);
      setPhase("reveal");
    }, ROLL_MS);
    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
      window.clearTimeout(settle);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const intervals = [350, 800, 1300, 1800];
    const timers = intervals.map((d, i) =>
      window.setTimeout(() => setRevealStep(i + 1), d)
    );
    const toConfirm = window.setTimeout(() => setPhase("confirm"), 2600);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(toConfirm);
    };
  }, [phase]);

  const roll = () => {
    setRevealStep(0);
    setResult(null);
    setShuffleTick(null);
    setPhase("rolling");
  };

  if (phase === "idle") {
    return (
      <div className="w-full max-w-narrow text-center">
        <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
          Oracle
        </p>
        <h2 className="mt-3 text-[44px] font-[600] tracking-[-1.1px] leading-[1.05] text-charcoal sm:text-[56px]">
          운에 맡겨봐.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.55] text-charcoal-muted">
          네 가지를 한 번에 굴립니다. 마음에 안 들면 다시, 그래도 아니면 직접
          고쳐도 돼요.
        </p>
        <button
          type="button"
          onClick={roll}
          className="btn-primary mt-10 h-12 px-5 text-[15.5px]"
        >
          <Dices className="h-4 w-4" strokeWidth={1.8} />
          주사위를 굴린다
        </button>
        <p className="mt-4 text-[12px] text-charcoal-muted">
          평균 결과 노출까지 ~3초
        </p>
      </div>
    );
  }

  if (phase === "confirm" && result) {
    return (
      <ConfirmStep
        headerLabel="Oracle"
        headerTitle="이 운명, 받아들일까요?"
        headerSub="다시 굴려도, 직접 고쳐도 돼요. 정답은 마음이 끌리는 쪽이에요."
        values={result}
        onChange={setResult}
        backLabel="다시 굴리기"
        backIcon={<RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} />}
        onBack={roll}
        onConfirm={() => onDone({ mode: "oracle", ...result })}
      />
    );
  }

  const current = result ?? shuffleTick;
  const rolling = phase === "rolling";

  return (
    <div className="w-full max-w-narrow">
      <div className="grid place-items-center">
        <div
          className={cn(
            "relative grid h-20 w-20 place-items-center rounded-pill bg-charcoal text-charcoal-offwhite shadow-inset-dark transition-all duration-700",
            phase === "reveal" && revealStep === 4 && "scale-110"
          )}
        >
          <Dices
            className={cn(
              "h-8 w-8 transition-transform",
              rolling && "animate-spin"
            )}
            strokeWidth={1.6}
          />
        </div>
        <p className="mt-5 text-[14px] text-charcoal-muted">
          {rolling ? "굴려보는 중…" : "이렇게 정해졌어요."}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <RevealRow
          label="회사 이름"
          shown={!rolling && revealStep >= 1}
          value={current?.companyName}
          shuffling={rolling}
        />
        <RevealRow
          label="비전"
          shown={!rolling && revealStep >= 2}
          value={current?.vision}
          shuffling={rolling}
        />
        <RevealRow
          label="첫 태스크"
          shown={!rolling && revealStep >= 3}
          value={current?.firstTask}
          shuffling={rolling}
        />
        <RevealRow
          label="첫 에이전트"
          shown={!rolling && revealStep >= 4}
          value={current?.firstAgent}
          shuffling={rolling}
        />
      </div>

      <p className="mt-8 text-center text-[12.5px] text-charcoal-muted">
        잠시 후 한 번 더 확인할 시간을 드릴게요…
      </p>
    </div>
  );
}

function RevealRow({
  label,
  value,
  shown,
  shuffling,
}: {
  label: string;
  value?: string;
  shown: boolean;
  shuffling: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[120px_1fr] items-baseline gap-4 rounded-md border border-cream-light bg-cream px-4 py-3 transition-all duration-500 ease-gentle",
        shown || shuffling
          ? "opacity-100 translate-y-0"
          : "opacity-40 translate-y-1"
      )}
    >
      <p className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
        {label}
      </p>
      <p
        className={cn(
          "text-[15px] leading-[1.4] text-charcoal transition-all duration-300",
          shuffling && "opacity-60 blur-[2px]",
          shown && "blur-0 opacity-100",
          !shown && !shuffling && "opacity-30"
        )}
      >
        {value ?? "···"}
      </p>
    </div>
  );
}
