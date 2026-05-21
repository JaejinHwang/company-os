import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import {
  Play,
  Pause,
  Bot,
  BrainCircuit,
  Gem,
  Megaphone,
  Wrench,
  User,
  Repeat,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { cn } from "../lib/cn";
import {
  ROUTINE_CATEGORY_META,
  ROUTINE_RUN_STATUS_META,
  type Routine,
  type RoutineCategory,
} from "../lib/routines";
import type { Connector } from "../lib/connectors";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

const AGENT_ICONS: Record<string, IconType> = {
  CEO: Bot,
  CTO: BrainCircuit,
  UXDesigner: Gem,
  Marketer: Megaphone,
  Engineer: Wrench,
};

const FILTERS: Array<{ id: "all" | "blocked" | RoutineCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "blocked", label: "Needs setup" },
  { id: "market", label: "Market" },
  { id: "ops", label: "Ops" },
  { id: "finance", label: "Finance" },
  { id: "compliance", label: "Compliance" },
];

type Props = {
  routines: Routine[];
  connectors: Connector[];
  onLoadSamples: () => void;
  onToggle: (id: string) => void;
  onRun: (id: string) => void;
  onNavigate: (href: string) => void;
};

export function Routines({
  routines,
  connectors,
  onLoadSamples,
  onToggle,
  onRun,
  onNavigate,
}: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const connectorById = useMemo(() => {
    const m: Record<string, Connector> = {};
    for (const c of connectors) m[c.id] = c;
    return m;
  }, [connectors]);

  const blockedFor = (r: Routine): Connector[] =>
    r.requiredConnectors
      .map((id) => connectorById[id])
      .filter(
        (c): c is Connector =>
          !!c && (c.status === "available" || c.status === "error")
      );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: routines.length, blocked: 0 };
    for (const r of routines) {
      c[r.category] = (c[r.category] ?? 0) + 1;
      if (blockedFor(r).length > 0) c.blocked += 1;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routines, connectorById]);

  const visible = useMemo(() => {
    return routines.filter((r) => {
      if (filter === "all") return true;
      if (filter === "blocked") return blockedFor(r).length > 0;
      return r.category === filter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routines, filter, connectorById]);

  if (routines.length === 0) {
    return (
      <div className="mx-auto max-w-content">
        <header className="mb-8">
          <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
            Routines
          </h2>
        </header>
        <EmptyState
          icon={Repeat}
          title="자동으로 도는 작업이 아직 없어요"
          description="시장 리서치·운영 리포트·재무·컴플라이언스처럼 매번 같은 일을 cron으로 굳혀두는 곳이에요."
          onLoadSamples={onLoadSamples}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content">
      <header className="mb-8">
        <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Routines
        </h2>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.55] text-charcoal-muted">
          스케줄된 자동화. 각 루틴은 1개 이상의 커넥터에 의존하며, 의존
          커넥터가 연결되지 않으면 자동으로 잠깁니다.
        </p>
      </header>

      <section>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const count = counts[f.id] ?? 0;
            const isBlocked = f.id === "blocked";
            if (isBlocked && count === 0) return null;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-pill border px-3 text-[13px] transition",
                  active
                    ? isBlocked
                      ? "border-transparent bg-danger text-cream shadow-inset-dark"
                      : "border-transparent bg-charcoal text-charcoal-offwhite shadow-inset-dark"
                    : isBlocked
                    ? "border-danger/25 bg-danger/[0.06] text-danger hover:bg-danger/10"
                    : "border-cream-light bg-cream text-charcoal hover:bg-charcoal/[0.04]"
                )}
              >
                <span>{f.label}</span>
                <span
                  className={cn(
                    "rounded-pill px-1.5 text-[11px]",
                    active
                      ? "bg-white/20 text-charcoal-offwhite"
                      : isBlocked
                      ? "bg-danger/15 text-danger"
                      : "bg-charcoal/[0.06] text-charcoal-muted"
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
            {visible.map((r) => (
              <RoutineRow
                key={r.id}
                routine={r}
                connectorById={connectorById}
                blockedConnectors={blockedFor(r)}
                onToggle={() => onToggle(r.id)}
                onRun={() => onRun(r.id)}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
        {visible.length === 0 && (
          <div className="card mt-3 grid h-32 place-items-center">
            <p className="text-[14px] text-charcoal-muted">
              해당 카테고리의 routine이 없습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function RoutineRow({
  routine,
  connectorById,
  blockedConnectors,
  onToggle,
  onRun,
  onNavigate,
}: {
  routine: Routine;
  connectorById: Record<string, Connector>;
  blockedConnectors: Connector[];
  onToggle: () => void;
  onRun: () => void;
  onNavigate: (href: string) => void;
}) {
  const cat = ROUTINE_CATEGORY_META[routine.category];
  const CatIcon = cat.icon;
  const status = ROUTINE_RUN_STATUS_META[routine.lastStatus];
  const StatusIcon = status.icon;
  const AgentIcon = AGENT_ICONS[routine.agent] ?? User;
  const isBlocked = blockedConnectors.length > 0;
  const deps = routine.requiredConnectors
    .map((id) => connectorById[id])
    .filter((c): c is Connector => !!c);

  return (
    <li
      className={cn(
        "grid grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-3 px-5 py-3.5 transition hover:bg-charcoal/[0.025]",
        !routine.enabled && !isBlocked && "opacity-60"
      )}
    >
      <span
        className="mt-0.5 grid h-5 w-5 place-items-center"
        style={{ color: cat.color }}
        title={cat.label}
      >
        <CatIcon className="h-4.5 w-4.5" strokeWidth={1.7} />
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-pill border px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.06em]"
            style={{
              color: cat.color,
              borderColor: `${cat.color}33`,
              backgroundColor: `${cat.color}0f`,
            }}
          >
            {cat.label}
          </span>
          <DependencyStack
            connectors={deps}
            onClick={() => onNavigate("#connectors")}
          />
          <p className="truncate text-[14.5px] font-[480] text-charcoal">
            {routine.name}
          </p>
        </div>

        {isBlocked ? (
          <button
            type="button"
            onClick={() => onNavigate("#connectors")}
            className="mt-1 inline-flex items-center gap-1 rounded-md border border-danger/25 bg-danger/[0.06] px-1.5 py-0.5 text-[11.5px] text-danger transition hover:bg-danger/10"
          >
            <AlertCircle className="h-3 w-3" strokeWidth={1.8} />
            <span>Needs setup</span>
            <span className="text-danger/70">
              · {blockedConnectors.map((c) => c.name).join(", ")} 미연결
            </span>
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.8} />
          </button>
        ) : (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-charcoal-muted">
            <span>{routine.schedule}</span>
            <span className="text-charcoal-muted/40">·</span>
            <span className="inline-flex items-center gap-1">
              <span className="grid h-3.5 w-3.5 place-items-center rounded-pill border border-cream-light bg-cream">
                <AgentIcon className="h-2 w-2" strokeWidth={1.6} />
              </span>
              {routine.agent}
            </span>
            <span className="text-charcoal-muted/40">·</span>
            <span
              className="inline-flex items-center gap-1"
              style={{ color: status.color }}
            >
              {routine.lastStatus === "running" ? (
                <span className="relative grid h-2.5 w-2.5 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/50" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500" />
                </span>
              ) : (
                <StatusIcon
                  className="h-3 w-3"
                  style={{ color: status.color }}
                  strokeWidth={1.8}
                />
              )}
              {routine.lastRun}
            </span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 self-center">
        <button
          type="button"
          onClick={onRun}
          disabled={!routine.enabled || isBlocked}
          title={
            isBlocked
              ? "의존 커넥터가 연결되어 있지 않습니다"
              : routine.enabled
              ? "Run now"
              : "비활성 상태입니다"
          }
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border border-cream-light bg-cream text-charcoal transition",
            routine.enabled && !isBlocked
              ? "hover:bg-charcoal/[0.04]"
              : "cursor-not-allowed opacity-50"
          )}
        >
          <Play className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
        <RoutineToggle
          enabled={routine.enabled && !isBlocked}
          disabled={isBlocked}
          onClick={onToggle}
        />
      </div>
    </li>
  );
}

function DependencyStack({
  connectors,
  onClick,
}: {
  connectors: Connector[];
  onClick: () => void;
}) {
  if (connectors.length === 0) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      title={`의존 커넥터: ${connectors.map((c) => c.name).join(", ")}`}
      className="inline-flex items-center -space-x-1 rounded-pill transition hover:-translate-y-px"
    >
      {connectors.slice(0, 3).map((c, i) => (
        <span
          key={c.id}
          aria-hidden
          className="grid h-4 w-4 place-items-center rounded-sm text-[9px] font-[600] text-charcoal-offwhite ring-1 ring-cream"
          style={{ backgroundColor: c.brandColor, zIndex: 3 - i }}
        >
          {c.badge.charAt(0)}
        </span>
      ))}
      {connectors.length > 3 && (
        <span className="grid h-4 min-w-4 place-items-center rounded-sm bg-cream-light px-1 text-[9px] font-[480] text-charcoal-muted ring-1 ring-cream">
          +{connectors.length - 3}
        </span>
      )}
    </button>
  );
}

function RoutineToggle({
  enabled,
  disabled,
  onClick,
}: {
  enabled: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={onClick}
      title={disabled ? "Needs setup" : enabled ? "Pause" : "Enable"}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-pill transition",
        enabled
          ? "bg-charcoal shadow-inset-dark"
          : "bg-charcoal/15",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-charcoal-offwhite transition",
          enabled ? "translate-x-[20px]" : "translate-x-[2px]"
        )}
      />
      <span className="sr-only">
        {enabled ? <Pause /> : <Play />}
      </span>
    </button>
  );
}
