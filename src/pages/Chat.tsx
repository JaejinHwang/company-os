import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import {
  Paperclip,
  ChevronDown,
  ArrowUp,
  Sparkles,
  Radio,
  Layers,
  Target,
  Repeat,
  Plug,
  Check,
  Loader2,
  Image as ImageIcon,
  FileText,
  Link2,
  Workflow,
} from "lucide-react";
import { AtlasAvatar } from "../components/AtlasAvatar";
import { cn } from "../lib/cn";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

// ─────────────────────────────────────────────────────────────────────────────
// Models + example prompts
// ─────────────────────────────────────────────────────────────────────────────

const MODELS = [
  { id: "opus-4-7", label: "Claude Opus 4.7", hint: "Most capable · 핵심 실행" },
  { id: "sonnet-4-6", label: "Claude Sonnet 4.6", hint: "Balanced" },
  { id: "haiku-4-5", label: "Claude Haiku 4.5", hint: "Fast · 즉시 응답" },
];

const EXAMPLE_PROMPTS = [
  {
    title: "한국 결제 이슈 정리",
    sub: "고객 컴플레인 모아서 다음 분기 OKR에 반영",
  },
  {
    title: "Q2 OKR 점검",
    sub: "KR 진행률과 위험 요인을 정리",
  },
  {
    title: "투자자 업데이트 초안",
    sub: "MRR · 채용 · 핵심 사건 요약",
  },
  {
    title: "주간 경쟁사 인텔",
    sub: "Linear · Vercel · Cursor 변경 요약",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Scripted assistant turn
// ─────────────────────────────────────────────────────────────────────────────

type WidgetType = "signal" | "backlog" | "project" | "routine" | "okr" | "connector";

type Widget = {
  type: WidgetType;
  title: string;
  meta: string;
  href: string;
  verb: string; // "Signal created" / "Project drafted" 등
};

type Step =
  | {
      kind: "interpret";
      title: string;
      lines: string[];
    }
  | {
      kind: "decompose";
      tasks: string[];
    }
  | {
      kind: "widget";
      widget: Widget;
      taskIndex: number; // marks decompose task as done
    }
  | { kind: "text"; body: string };

const SCRIPTED_STEPS: Step[] = [
  {
    kind: "interpret",
    title: "요청 해석",
    lines: [
      "토픽: 한국 사용자 결제 실패",
      "원하는 결과: 검증된 시그널 → Q3 OKR Key Result",
      "필요한 컨텍스트: Zendesk · Stripe · ko-KR locale · 최근 24시간",
    ],
  },
  {
    kind: "decompose",
    tasks: [
      "Signals에 새 시그널로 등록",
      "Zendesk·Stripe에서 관련 케이스 모으기 → Backlog로 흘려보내기",
      "추적용 Project 초안 작성 (CTO 에이전트 owner)",
      "Q3 KR 초안 제안",
    ],
  },
  {
    kind: "widget",
    taskIndex: 0,
    widget: {
      type: "signal",
      verb: "Signal 등록됨",
      title: "Korean customers can't change subscription tier",
      meta: "CS · Zendesk · 12 tickets · 24h · Hot",
      href: "#signals",
    },
  },
  {
    kind: "widget",
    taskIndex: 1,
    widget: {
      type: "backlog",
      verb: "Backlog 항목 추가",
      title: "Investigate ko-KR Stripe portal 404",
      meta: "Engineer 에이전트 · Urgent · Pricing & billing rework",
      href: "#backlogs",
    },
  },
  {
    kind: "widget",
    taskIndex: 2,
    widget: {
      type: "project",
      verb: "Project 초안 작성",
      title: "Payment integrity for ko-KR",
      meta: "CTO 에이전트 owner · 4 backlog items",
      href: "#proj-pricing",
    },
  },
  {
    kind: "widget",
    taskIndex: 3,
    widget: {
      type: "okr",
      verb: "KR 초안 제안",
      title: "ko-KR payment failure rate < 0.5%",
      meta: "Q3 2026 · Reliability objective",
      href: "#okrs",
    },
  },
  {
    kind: "text",
    body:
      "정리하면, ko-KR 결제 실패는 지난 24시간 안에 12건이 모인 hot 시그널이고 Stripe portal 404가 공통 원인이에요. 추적 프로젝트와 Q3 KR 초안까지 만들어뒀으니, OKR 페이지에서 컨펌만 해주시면 다음 sprint 백로그에 자동으로 흘러갑니다.",
  },
];

const STEP_DELAY_MS = 700;

// ─────────────────────────────────────────────────────────────────────────────
// Widget meta
// ─────────────────────────────────────────────────────────────────────────────

const WIDGET_META: Record<
  WidgetType,
  { label: string; icon: IconType; color: string }
> = {
  signal: { label: "Signal", icon: Radio, color: "#2563eb" },
  backlog: { label: "Backlog", icon: Layers, color: "#5f5f5d" },
  project: { label: "Project", icon: Workflow, color: "#7c6cff" },
  routine: { label: "Routine", icon: Repeat, color: "#c89211" },
  okr: { label: "KR", icon: Target, color: "#1f8a4c" },
  connector: { label: "Connector", icon: Plug, color: "#8a4a1f" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

type Message =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; steps: Step[]; visibleSteps: number };

let _msgSeq = 0;
const nextMsgId = () => `m-${++_msgSeq}`;

type Props = {
  onNavigate: (href: string) => void;
};

export function Chat({ onNavigate }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [attachOpen, setAttachOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new step
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Advance scripted assistant turn
  useEffect(() => {
    const lastIdx = messages.length - 1;
    if (lastIdx < 0) return;
    const last = messages[lastIdx];
    if (last.role !== "assistant") return;
    if (last.visibleSteps >= last.steps.length) return;

    const t = setTimeout(() => {
      setMessages((prev) =>
        prev.map((m, idx) =>
          idx === lastIdx && m.role === "assistant"
            ? { ...m, visibleSteps: m.visibleSteps + 1 }
            : m
        )
      );
    }, last.visibleSteps === 0 ? 400 : STEP_DELAY_MS);
    return () => clearTimeout(t);
  }, [messages]);

  const send = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: "user", text: value },
      { id: nextMsgId(), role: "assistant", steps: SCRIPTED_STEPS, visibleSteps: 0 },
    ]);
  };

  const isEmpty = messages.length === 0;
  const activeModel = MODELS.find((m) => m.id === model) ?? MODELS[0];

  return (
    <div className="mx-auto flex h-full max-w-[760px] flex-col">
      {isEmpty ? (
        <WelcomeHero onSubmit={send} examples={EXAMPLE_PROMPTS} />
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto pb-8 pt-2"
        >
          <ul className="flex flex-col gap-6">
            {messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} text={m.text} />
              ) : (
                <AssistantTurn
                  key={m.id}
                  steps={m.steps}
                  visibleSteps={m.visibleSteps}
                  onNavigate={onNavigate}
                />
              )
            )}
          </ul>
        </div>
      )}

      <div className={cn("sticky bottom-0 pb-6 pt-5 bg-gradient-to-t from-cream via-cream to-transparent", isEmpty && "mt-6")}>
        <Composer
          input={input}
          onChange={setInput}
          onSubmit={() => send()}
          model={activeModel}
          onPickModel={(id) => setModel(id)}
          modelOpen={modelOpen}
          setModelOpen={setModelOpen}
          attachOpen={attachOpen}
          setAttachOpen={setAttachOpen}
          textareaRef={composerRef}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Welcome (empty state)
// ─────────────────────────────────────────────────────────────────────────────

function WelcomeHero({
  onSubmit,
  examples,
}: {
  onSubmit: (text: string) => void;
  examples: typeof EXAMPLE_PROMPTS;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center pb-2 pt-8">
      <span className="grid h-12 w-12 place-items-center rounded-pill border border-cream-light bg-cream text-charcoal">
        <AtlasAvatar size="lg" />
      </span>
      <h2 className="mt-5 text-[28px] font-[600] tracking-[-0.6px] text-charcoal">
        오늘 무엇을 만들까요?
      </h2>
      <p className="mt-2 max-w-md text-center text-[14px] text-charcoal-muted">
        복합적이거나 추상적인 요청을 입력하세요. Atlas가 해석하고, 작업을
        분해하고, 각 작업을 워크스페이스 액션으로 실행합니다.
      </p>

      <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {examples.map((p) => (
          <button
            key={p.title}
            type="button"
            onClick={() => onSubmit(`${p.title}: ${p.sub}`)}
            className="card group flex flex-col items-start gap-1 p-3.5 text-left transition hover:bg-[rgba(28,28,28,0.025)]"
          >
            <span className="text-[13.5px] font-[480] text-charcoal">
              {p.title}
            </span>
            <span className="text-[12.5px] text-charcoal-muted">{p.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composer
// ─────────────────────────────────────────────────────────────────────────────

const ATTACH_OPTIONS = [
  { id: "file", label: "파일 업로드", icon: FileText },
  { id: "image", label: "스크린샷·이미지", icon: ImageIcon },
  { id: "link", label: "링크 첨부", icon: Link2 },
];

function Composer({
  input,
  onChange,
  onSubmit,
  model,
  onPickModel,
  modelOpen,
  setModelOpen,
  attachOpen,
  setAttachOpen,
  textareaRef,
}: {
  input: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  model: (typeof MODELS)[number];
  onPickModel: (id: string) => void;
  modelOpen: boolean;
  setModelOpen: (v: boolean) => void;
  attachOpen: boolean;
  setAttachOpen: (v: boolean) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  // Close popovers on outside click
  useEffect(() => {
    if (!modelOpen && !attachOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-popover-root]")) {
        setModelOpen(false);
        setAttachOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [modelOpen, attachOpen, setModelOpen, setAttachOpen]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="rounded-container border border-cream-light bg-cream shadow-focus">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="복합적인 요청을 입력하세요. Shift+Enter로 줄바꿈."
        rows={3}
        className="block w-full resize-none bg-transparent px-5 pb-2 pt-5 text-[14.5px] leading-[1.55] text-charcoal placeholder:text-charcoal-muted focus:outline-none"
      />
      <div className="flex items-center gap-1.5 px-3 pb-3 pt-2">
        {/* Attach */}
        <div className="relative" data-popover-root>
          <button
            type="button"
            onClick={() => {
              setAttachOpen(!attachOpen);
              setModelOpen(false);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-pill text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.05)] hover:text-charcoal"
            title="첨부"
          >
            <Paperclip className="h-4 w-4" strokeWidth={1.7} />
          </button>
          {attachOpen && (
            <div className="absolute bottom-9 left-0 z-30 w-44 rounded-md border border-cream-light bg-cream py-1 shadow-focus">
              {ATTACH_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAttachOpen(false)}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
                  >
                    <Icon className="h-3.5 w-3.5 text-charcoal-muted" strokeWidth={1.7} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Model picker */}
        <div className="relative" data-popover-root>
          <button
            type="button"
            onClick={() => {
              setModelOpen(!modelOpen);
              setAttachOpen(false);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2.5 text-[12.5px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
          >
            <Sparkles className="h-3 w-3 text-charcoal-muted" strokeWidth={2} />
            {model.label}
            <ChevronDown className="h-3 w-3 text-charcoal-muted" strokeWidth={1.7} />
          </button>
          {modelOpen && (
            <div className="absolute bottom-9 left-0 z-30 w-56 rounded-md border border-cream-light bg-cream py-1 shadow-focus">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onPickModel(m.id);
                    setModelOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left transition hover:bg-[rgba(28,28,28,0.04)]",
                    m.id === model.id && "bg-[rgba(28,28,28,0.04)]"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-charcoal">
                      {m.label}
                    </span>
                    <span className="block truncate text-[11.5px] text-charcoal-muted">
                      {m.hint}
                    </span>
                  </span>
                  {m.id === model.id && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-charcoal" strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!input.trim()}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-pill bg-charcoal text-charcoal-offwhite shadow-inset-dark transition active:opacity-80",
              !input.trim() && "cursor-not-allowed opacity-40"
            )}
            title="Send"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// User bubble
// ─────────────────────────────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  return (
    <li className="flex justify-end">
      <div className="max-w-[80%] rounded-container border border-cream-light bg-[rgba(28,28,28,0.04)] px-3.5 py-2.5 text-[14.5px] leading-[1.55] text-charcoal">
        {text}
      </div>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Assistant turn — interprets, decomposes, emits widgets, then summarizes
// ─────────────────────────────────────────────────────────────────────────────

function AssistantTurn({
  steps,
  visibleSteps,
  onNavigate,
}: {
  steps: Step[];
  visibleSteps: number;
  onNavigate: (href: string) => void;
}) {
  // count of completed widget tasks (used to mark decompose tasks as done)
  const completedTaskIndices = new Set<number>();
  for (let i = 0; i < visibleSteps; i++) {
    const s = steps[i];
    if (s.kind === "widget") completedTaskIndices.add(s.taskIndex);
  }
  const isStreaming = visibleSteps < steps.length;

  return (
    <li className="flex flex-col gap-3">
      <header className="flex items-center gap-2 text-[12.5px] text-charcoal-muted">
        <AtlasAvatar size="xs" />
        <span className="text-charcoal">Atlas</span>
        {isStreaming && (
          <span className="inline-flex items-center gap-1 text-charcoal-muted">
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.8} />
            작업 중
          </span>
        )}
      </header>

      {steps.slice(0, visibleSteps).map((step, idx) => {
        if (step.kind === "interpret") {
          return (
            <SystemBlock key={idx}>
              <p className="text-[12.5px] font-[480] uppercase tracking-[0.06em] text-charcoal-muted">
                {step.title}
              </p>
              <ul className="mt-1.5 flex flex-col gap-0.5 font-mono text-[12.5px] leading-[1.5] text-charcoal">
                {step.lines.map((l, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-charcoal-muted">›</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </SystemBlock>
          );
        }
        if (step.kind === "decompose") {
          return (
            <SystemBlock key={idx}>
              <p className="text-[12.5px] font-[480] uppercase tracking-[0.06em] text-charcoal-muted">
                {step.tasks.length}개 작업으로 분해
              </p>
              <ul className="mt-1.5 flex flex-col gap-1 text-[12.5px] leading-[1.5]">
                {step.tasks.map((t, i) => {
                  const done = completedTaskIndices.has(i);
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex items-start gap-2 font-mono",
                        done ? "text-charcoal" : "text-charcoal-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-[3px] inline-grid h-3 w-3 shrink-0 place-items-center rounded-full border",
                          done
                            ? "border-[#1f8a4c] bg-[#1f8a4c]/15 text-[#1f8a4c]"
                            : "border-cream-light bg-cream text-transparent"
                        )}
                      >
                        {done ? (
                          <Check className="h-2 w-2" strokeWidth={3} />
                        ) : null}
                      </span>
                      <span>{t}</span>
                    </li>
                  );
                })}
              </ul>
            </SystemBlock>
          );
        }
        if (step.kind === "widget") {
          return (
            <ActionWidget
              key={idx}
              widget={step.widget}
              onClick={() => onNavigate(step.widget.href)}
            />
          );
        }
        // text
        return (
          <p
            key={idx}
            className="text-[14.5px] leading-[1.6] text-charcoal"
          >
            {step.body}
          </p>
        );
      })}
    </li>
  );
}

function SystemBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-cream-light bg-[rgba(28,28,28,0.02)] px-3.5 py-2.5">
      {children}
    </div>
  );
}

function ActionWidget({
  widget,
  onClick,
}: {
  widget: Widget;
  onClick: () => void;
}) {
  const meta = WIDGET_META[widget.type];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full max-w-[480px] items-center gap-3 rounded-card border border-cream-light bg-cream p-3 text-left transition hover:bg-[rgba(28,28,28,0.025)]"
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-md"
        style={{
          color: meta.color,
          backgroundColor: `${meta.color}14`,
          border: `1px solid ${meta.color}33`,
        }}
      >
        <Icon className="h-4 w-4" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-pill border px-1.5 py-[1px] text-[10px] font-[480] uppercase tracking-[0.06em]"
            style={{
              color: meta.color,
              borderColor: `${meta.color}33`,
              backgroundColor: `${meta.color}0f`,
            }}
          >
            {meta.label}
          </span>
          <span className="text-[11.5px] text-charcoal-muted">
            {widget.verb}
          </span>
        </div>
        <p className="mt-1 truncate text-[14px] font-[480] text-charcoal">
          {widget.title}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-charcoal-muted">
          {widget.meta}
        </p>
      </div>
      <span className="shrink-0 text-[12px] text-charcoal-muted transition group-hover:text-charcoal">
        Open →
      </span>
    </button>
  );
}
