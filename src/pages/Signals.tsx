import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
  Headphones,
  Bug,
  Lightbulb,
  Crosshair,
  Globe2,
  Briefcase,
  Plus,
  Flame,
  Radio,
  X,
  Check,
} from "lucide-react";
import { KR_BY_ID, OBJECTIVE_BY_ID, KRS, OBJECTIVES_LITE } from "../lib/krs";
import type { NewIssueSeed } from "../components/NewIssueModal";
import { EmptyState } from "../components/EmptyState";
import { cn } from "../lib/cn";
import type { Signal, SignalSource } from "../lib/signals";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}>;

const SOURCE_META: Record<
  SignalSource,
  { label: string; short: string; color: string; icon: IconType }
> = {
  cs: { label: "Customer Support", short: "CS", color: "#2563eb", icon: Headphones },
  bug: { label: "Bug Report", short: "Bug", color: "#b8443a", icon: Bug },
  internal: {
    label: "Internal Finding",
    short: "Internal",
    color: "#5f5f5d",
    icon: Lightbulb,
  },
  competitor: {
    label: "Competitor",
    short: "Competitor",
    color: "#c89211",
    icon: Crosshair,
  },
  market: {
    label: "Market Research",
    short: "Market",
    color: "#7c6cff",
    icon: Globe2,
  },
  sales: { label: "Sales", short: "Sales", color: "#1f8a4c", icon: Briefcase },
};
const FILTERS: Array<{ id: "all" | SignalSource; label: string }> = [
  { id: "all", label: "All" },
  { id: "cs", label: "CS" },
  { id: "bug", label: "Bug" },
  { id: "internal", label: "Internal" },
  { id: "competitor", label: "Competitor" },
  { id: "market", label: "Market" },
  { id: "sales", label: "Sales" },
];

type Props = {
  sampleData: boolean;
  signals: Signal[];
  onPlan: (seed: NewIssueSeed) => void;
  onLoadSamples: () => void;
  onAddSignal: (s: Signal) => void;
};

export function Signals({ sampleData, signals, onPlan, onLoadSamples, onAddSignal }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [composeOpen, setComposeOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: signals.length };
    for (const s of signals) c[s.source] = (c[s.source] ?? 0) + 1;
    return c;
  }, [signals]);

  const visible = useMemo(
    () =>
      filter === "all" ? signals : signals.filter((s) => s.source === filter),
    [filter, signals]
  );

  if (!sampleData && signals.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8 flex items-center justify-between gap-3">
          <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
            Signals
          </h2>
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="btn-primary h-9 px-3 text-[13.5px]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
            New Signal
          </button>
        </header>
        <EmptyState
          icon={Radio}
          title="아직 도착한 시그널이 없어요"
          description="외부 채널에서 들어온 신호가 여기 모입니다. 직접 추가하거나 샘플을 불러올 수 있어요."
          onLoadSamples={onLoadSamples}
        />
        <NewSignalModal
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          onCreate={onAddSignal}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-8 flex items-center justify-between gap-3">
        <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Signals
        </h2>
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          className="btn-primary h-9 px-3 text-[13.5px]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          New Signal
        </button>
      </header>

      <section>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const count = counts[f.id] ?? 0;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-pill border px-3 text-[13px] transition",
                  active
                    ? "border-transparent bg-charcoal text-charcoal-offwhite shadow-inset-dark"
                    : "border-cream-light bg-cream text-charcoal hover:bg-[rgba(28,28,28,0.04)]"
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    "rounded-pill px-1.5 text-[11px]",
                    active
                      ? "bg-white/15 text-charcoal-offwhite"
                      : "bg-[rgba(28,28,28,0.06)] text-charcoal-muted"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <div className="card overflow-hidden">
          <ul className="divide-y divide-cream-light">
            {visible.map((s) => (
              <SignalRow key={s.id} signal={s} onPlan={onPlan} />
            ))}
          </ul>
        </div>
        {visible.length === 0 && (
          <div className="card mt-3 grid h-32 place-items-center">
            <p className="text-[14px] text-charcoal-muted">
              해당 소스의 새 시그널이 없습니다.
            </p>
          </div>
        )}
      </section>

      <NewSignalModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreate={onAddSignal}
      />
    </div>
  );
}

function SignalRow({
  signal,
  onPlan,
}: {
  signal: Signal;
  onPlan: (seed: NewIssueSeed) => void;
}) {
  const src = SOURCE_META[signal.source];
  const Icon = src.icon;

  return (
    <li className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-3 px-5 py-3.5 transition hover:bg-[rgba(28,28,28,0.025)]">
      <span
        className="mt-0.5 grid h-5 w-5 place-items-center"
        style={{ color: src.color }}
        title={src.label}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-pill border px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.06em]"
            style={{
              color: src.color,
              borderColor: `${src.color}33`,
              backgroundColor: `${src.color}0f`,
            }}
          >
            {src.short}
          </span>
          <KrChip krId={signal.suggestedKrId} />
          <p className="truncate text-[14.5px] font-[480] text-charcoal">
            {signal.title}
          </p>
          {signal.hot && (
            <Flame
              className="h-3.5 w-3.5 shrink-0 text-[#b8443a]"
              strokeWidth={2}
            />
          )}
        </div>
        <p className="mt-1 truncate text-[12.5px] text-charcoal-muted">
          {signal.channel} · {signal.timeAgo}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onPlan({
            title: signal.title,
            description: `> Signal · ${src.label} · ${signal.channel}\n\n${signal.detail}`,
            sourceLabel: `${src.short} signal`,
            krId: signal.suggestedKrId,
          })
        }
        className="btn-primary h-8 shrink-0 self-center px-3 text-[12.5px]"
        title="Plan하면 Backlog로 승격됩니다"
      >
        <Plus className="h-3 w-3" strokeWidth={1.8} />
        Plan
      </button>
    </li>
  );
}

function KrChip({ krId }: { krId?: string }) {
  if (!krId) return null;
  const kr = KR_BY_ID[krId];
  if (!kr) return null;
  const obj = OBJECTIVE_BY_ID[kr.objectiveId];
  return (
    <span
      title={`${obj?.full ?? ""} · ${kr.label}`}
      className="inline-flex items-center gap-1 rounded-pill border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] font-[480] text-charcoal"
    >
      <span>⊙</span>
      <span className="text-charcoal-muted">{obj?.short ?? ""}</span>
      <span>·</span>
      <span>{kr.label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// New Signal modal
// ─────────────────────────────────────────────────────────────────────────────

const SOURCE_OPTIONS: Array<{ id: SignalSource; label: string }> = [
  { id: "cs", label: "CS" },
  { id: "bug", label: "Bug" },
  { id: "internal", label: "Internal" },
  { id: "competitor", label: "Competitor" },
  { id: "market", label: "Market" },
  { id: "sales", label: "Sales" },
];

let _signalSeq = 1000;
const nextSignalId = () => `s-u-${++_signalSeq}`;

function NewSignalModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (s: Signal) => void;
}) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [source, setSource] = useState<SignalSource>("cs");
  const [channel, setChannel] = useState("");
  const [krId, setKrId] = useState<string>("");
  const [hot, setHot] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => titleRef.current?.focus(), 40);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => {
    setTitle("");
    setDetail("");
    setSource("cs");
    setChannel("");
    setKrId("");
    setHot(false);
  };

  const submit = () => {
    if (!title.trim()) return;
    const meta = SOURCE_META[source];
    onCreate({
      id: nextSignalId(),
      source,
      title: title.trim(),
      detail: detail.trim() || `Manually added · ${meta.label}`,
      channel: channel.trim() || `${meta.short} · manual`,
      timeAgo: "방금 전",
      status: "new",
      hot,
      suggestedKrId: krId || undefined,
    });
    reset();
    onClose();
  };

  const srcMeta = SOURCE_META[source];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-[10vh]">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/25 backdrop-blur-[2px] animate-[fadeIn_180ms_ease-out]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-signal-title"
        className="relative w-full max-w-xl overflow-hidden rounded-container border border-cream-light bg-cream shadow-focus animate-[fadeUp_220ms_ease-out]"
      >
        <div className="flex items-center gap-2 border-b border-cream-light px-5 py-2.5">
          <span className="rounded-md border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.08em] text-charcoal">
            Signals
          </span>
          <span
            id="new-signal-title"
            className="text-[13.5px] text-charcoal-muted"
          >
            New signal
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-5 pb-3 pt-4">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="시그널 제목 — 예: 한국 결제 실패가 24h 12건"
            className="w-full bg-transparent text-[18px] font-[480] text-charcoal placeholder:text-charcoal-muted focus:outline-none"
          />
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="배경, 데이터, 출처 등을 짧게 적어두세요. (선택)"
            rows={3}
            className="mt-2 w-full resize-none bg-transparent text-[14px] leading-[1.55] text-charcoal placeholder:text-charcoal-muted focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-cream-light bg-[rgba(28,28,28,0.02)] px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              Source
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {SOURCE_OPTIONS.map((opt) => {
                const m = SOURCE_META[opt.id];
                const active = opt.id === source;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSource(opt.id)}
                    className={cn(
                      "inline-flex h-7 items-center gap-1 rounded-pill border px-2 text-[11.5px] transition",
                      active
                        ? "border-transparent text-cream"
                        : "border-cream-light bg-cream text-charcoal-muted hover:bg-[rgba(28,28,28,0.04)]"
                    )}
                    style={
                      active ? { backgroundColor: m.color } : undefined
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              채널
            </span>
            <input
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder={`예: ${srcMeta.short} · 12 tickets`}
              className="mt-1 w-full rounded-md border border-cream-light bg-cream px-2.5 py-1.5 text-[13px] text-charcoal placeholder:text-charcoal-muted focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </label>
          <label className="block">
            <span className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              연결 KR (선택)
            </span>
            <select
              value={krId}
              onChange={(e) => setKrId(e.target.value)}
              className="mt-1 w-full rounded-md border border-cream-light bg-cream px-2.5 py-1.5 text-[13px] text-charcoal focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="">—</option>
              {OBJECTIVES_LITE.map((obj) => (
                <optgroup key={obj.id} label={obj.short}>
                  {KRS.filter((k) => k.objectiveId === obj.id).map((kr) => (
                    <option key={kr.id} value={kr.id}>
                      {kr.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-cream-light px-5 py-3">
          <label className="inline-flex items-center gap-2 text-[13px] text-charcoal">
            <input
              type="checkbox"
              checked={hot}
              onChange={(e) => setHot(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-cream-light text-charcoal focus:ring-blue-500/40"
            />
            Mark as hot (Escalate 🔥)
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="inline-flex h-8 items-center rounded-md px-3 text-[13px] text-charcoal-muted transition hover:text-charcoal"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!title.trim()}
              className={cn(
                "btn-primary h-8 px-3 text-[13px]",
                !title.trim() && "cursor-not-allowed opacity-50"
              )}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={1.8} />
              Create signal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
