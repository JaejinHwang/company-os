import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";
import type { OnboardingResult } from "./Onboarding";
import { ConfirmStep, type ConfirmValues } from "./ConfirmStep";
import { AgentPicker, QuickPicks, SUGGESTIONS, type AgentName } from "./shared";

type Props = {
  onDone: (result: OnboardingResult) => void;
};

type Field = "name" | "vision" | "task" | "agent";

type Step = {
  field: Field;
  label: string;
  title: string;
  hint: string;
  placeholder: string;
  type: "text" | "textarea" | "agent";
  suggestions: string[];
};

const STEPS: Step[] = [
  {
    field: "name",
    label: "Step 1 of 4",
    title: "회사의 이름은?",
    hint: "나중에 언제든 바꿀 수 있어요.",
    placeholder: "예: Sprint, Lumen, Helio…",
    type: "text",
    suggestions: SUGGESTIONS.name,
  },
  {
    field: "vision",
    label: "Step 2 of 4",
    title: "어떤 회사가 되고 싶나요?",
    hint: "한 문장의 비전. 첫 인터뷰에서 답할 정도면 충분합니다.",
    placeholder: "한 문장으로 적어보세요…",
    type: "textarea",
    suggestions: SUGGESTIONS.vision,
  },
  {
    field: "task",
    label: "Step 3 of 4",
    title: "내일 아침, 가장 먼저 시작할 일은?",
    hint: "구체적이지 않아도 괜찮아요. 방향만 잡으면 충분합니다.",
    placeholder: "예: 랜딩페이지 v1 디자인",
    type: "text",
    suggestions: SUGGESTIONS.task,
  },
  {
    field: "agent",
    label: "Step 4 of 4",
    title: "첫 동료는 누가 좋을까요?",
    hint: "당신이 들어오기 전에 이미 일을 시작해두고 있을 거예요.",
    placeholder: "",
    type: "agent",
    suggestions: [],
  },
];

type Phase = "steps" | "confirm";

export function FromScratchFlow({ onDone }: Props) {
  const [phase, setPhase] = useState<Phase>("steps");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    vision: "",
    task: "",
    agent: "",
  });
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Step transition: trigger unmount → 80ms timeout → mount so the new
    // step animates in. The initial setMounted(false) is intentional and
    // bounded — it only fires when `step` or `phase` actually changes.
    if (phase !== "steps") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(false);
    const t = setTimeout(() => {
      setMounted(true);
      if (STEPS[step].type === "text") inputRef.current?.focus();
      if (STEPS[step].type === "textarea") textareaRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [step, phase]);

  if (phase === "confirm") {
    const confirmValues: ConfirmValues = {
      companyName: values.name,
      vision: values.vision,
      firstTask: values.task,
      firstAgent: values.agent,
    };
    return (
      <ConfirmStep
        headerLabel="From scratch"
        headerTitle="출근 전, 한 번만 봐주세요."
        headerSub="여기서 고치는 건 부담 없어요. 마음에 걸리는 부분은 지금 바꿔두면 좋아요."
        values={confirmValues}
        onChange={(v) =>
          setValues({
            name: v.companyName,
            vision: v.vision,
            task: v.firstTask,
            agent: v.firstAgent,
          })
        }
        backLabel="단계로 돌아가기"
        backIcon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />}
        onBack={() => {
          setDirection("back");
          setPhase("steps");
          setStep(STEPS.length - 1);
        }}
        onConfirm={() =>
          onDone({
            mode: "scratch",
            companyName: values.name.trim(),
            vision: values.vision.trim(),
            firstTask: values.task.trim(),
            firstAgent: values.agent.trim(),
          })
        }
        suggestions={{
          name: SUGGESTIONS.name,
          vision: SUGGESTIONS.vision,
          task: SUGGESTIONS.task,
        }}
      />
    );
  }

  const current = STEPS[step];
  const currentValue = values[current.field];
  const canNext = currentValue.trim().length > 0;

  const next = () => {
    if (!canNext) return;
    if (step === STEPS.length - 1) {
      setPhase("confirm");
      return;
    }
    setDirection("forward");
    setStep((s) => s + 1);
  };

  const back = () => {
    if (step === 0) return;
    setDirection("back");
    setStep((s) => s - 1);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      if (current.type === "textarea" && !e.metaKey && !e.ctrlKey) return;
      e.preventDefault();
      next();
    }
  };

  return (
    <div className="w-full max-w-narrow">
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-pill transition-all duration-500 ease-gentle",
              i < step
                ? "w-6 bg-charcoal"
                : i === step
                ? "w-10 bg-charcoal"
                : "w-6 bg-charcoal/15"
            )}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] uppercase tracking-[0.08em] text-charcoal-muted">
        {current.label}
      </p>

      <div
        key={step}
        className={cn(
          "mt-6 transition-all duration-500 ease-gentle",
          mounted
            ? "opacity-100 translate-y-0"
            : direction === "forward"
            ? "opacity-0 translate-y-3"
            : "opacity-0 -translate-y-3"
        )}
      >
        <h2 className="text-center text-[34px] font-[600] tracking-[-0.9px] leading-[1.1] text-charcoal sm:text-[40px]">
          {current.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-[14.5px] leading-[1.55] text-charcoal-muted">
          {current.hint}
        </p>

        <div className="mt-8">
          {current.type === "text" && (
            <input
              ref={inputRef}
              type="text"
              value={values[current.field]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [current.field]: e.target.value }))
              }
              onKeyDown={handleKeyDown}
              placeholder={current.placeholder}
              className="w-full rounded-md border border-cream-light bg-cream px-4 py-3.5 text-center text-[20px] text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          )}
          {current.type === "textarea" && (
            <textarea
              ref={textareaRef}
              rows={3}
              value={values[current.field]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [current.field]: e.target.value }))
              }
              onKeyDown={handleKeyDown}
              placeholder={current.placeholder}
              className="w-full resize-none rounded-md border border-cream-light bg-cream px-4 py-3.5 text-[18px] leading-[1.5] text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          )}
          {current.type === "agent" && (
            <AgentPicker
              value={values.agent}
              onChange={(a: AgentName) =>
                setValues((v) => ({ ...v, agent: a }))
              }
            />
          )}
        </div>

        {current.type !== "agent" && current.suggestions.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-charcoal-muted">
              빠른 선택
            </p>
            <QuickPicks
              options={current.suggestions}
              active={currentValue}
              onPick={(s) => {
                setValues((v) => ({ ...v, [current.field]: s }));
                (current.type === "textarea"
                  ? textareaRef.current
                  : inputRef.current
                )?.focus();
              }}
            />
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13.5px] text-charcoal transition",
            step === 0
              ? "opacity-30"
              : "hover:bg-charcoal/[0.04]"
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
          뒤로
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          className={cn(
            "btn-primary h-9 px-4 text-[13.5px] transition",
            !canNext && "opacity-40"
          )}
        >
          {step === STEPS.length - 1 ? (
            <>
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
              내용 확인하기
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </>
          ) : (
            <>
              다음
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
