import { useMemo, useState, type ComponentType } from "react";
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
} from "lucide-react";
import { KR_BY_ID, OBJECTIVE_BY_ID } from "../lib/krs";
import type { NewIssueSeed } from "../components/NewIssueModal";
import { NewSignalModal } from "../components/NewSignalModal";
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

