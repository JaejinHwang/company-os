import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import {
  Circle,
  CircleDashed,
  CircleDot,
  CheckCircle2,
  Play,
  ArrowRight,
  Bot,
  BrainCircuit,
  Gem,
  Megaphone,
  Wrench,
  User,
  ChevronRight,
} from "lucide-react";
import type {
  BacklogItem,
  BacklogPriority,
  BacklogStatus,
} from "../lib/backlog";
import { cn } from "../lib/cn";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

const STATUS_META: Record<
  BacklogStatus,
  { label: string; icon: IconType; color: string }
> = {
  todo: { label: "Todo", icon: Circle, color: "rgba(28,28,28,0.4)" },
  pending: { label: "Pending", icon: CircleDashed, color: "#c89211" },
  in_progress: { label: "Executing", icon: CircleDot, color: "#2563eb" },
  done: { label: "Done", icon: CheckCircle2, color: "#1f8a4c" },
};

const PRIORITY_META: Record<
  BacklogPriority,
  { label: string; color: string }
> = {
  urgent: { label: "Urgent", color: "#b8443a" },
  high: { label: "High", color: "#c89211" },
  medium: { label: "Medium", color: "#5f5f5d" },
  low: { label: "Low", color: "#8a8a87" },
  none: { label: "—", color: "#8a8a87" },
};

const AGENT_ICONS: Record<string, IconType> = {
  CEO: Bot,
  CTO: BrainCircuit,
  UXDesigner: Gem,
  Marketer: Megaphone,
  Engineer: Wrench,
};

const FILTERS: Array<{ id: "all" | BacklogStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "todo", label: "Todo" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "Executing" },
  { id: "done", label: "Done" },
];

type Props = {
  items: BacklogItem[];
  onExecute: (id: string) => void;
  onNavigate: (href: string) => void;
};

export function Backlogs({ items, onExecute, onNavigate }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const it of items) c[it.status] = (c[it.status] ?? 0) + 1;
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const list = filter === "all" ? items : items.filter((i) => i.status === filter);
    // Sort: executing first, then by priority weight, then newest first
    const priorityWeight: Record<BacklogPriority, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
      none: 4,
    };
    const statusWeight: Record<BacklogStatus, number> = {
      in_progress: 0,
      todo: 1,
      pending: 2,
      done: 3,
    };
    return [...list].sort((a, b) => {
      const s = statusWeight[a.status] - statusWeight[b.status];
      if (s !== 0) return s;
      const p = priorityWeight[a.priority] - priorityWeight[b.priority];
      if (p !== 0) return p;
      return b.createdAt - a.createdAt;
    });
  }, [items, filter]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-8">
        <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Backlogs
        </h2>
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
          <div className="grid grid-cols-[24px_minmax(0,1fr)_120px_140px_120px_140px] items-center gap-3 border-b border-cream-light px-5 py-2.5 text-[11px] uppercase tracking-[0.06em] text-charcoal-muted">
            <span />
            <span>Title</span>
            <span>Priority</span>
            <span>Project</span>
            <span>Agent</span>
            <span className="text-right">Action</span>
          </div>
          <ul className="divide-y divide-cream-light">
            {visible.map((item) => (
              <BacklogRow
                key={item.id}
                item={item}
                onExecute={onExecute}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
        {visible.length === 0 && (
          <div className="card mt-3 grid h-32 place-items-center">
            <p className="text-[14px] text-charcoal-muted">
              해당 상태의 백로그가 없습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function BacklogRow({
  item,
  onExecute,
  onNavigate,
}: {
  item: BacklogItem;
  onExecute: (id: string) => void;
  onNavigate: (href: string) => void;
}) {
  const status = STATUS_META[item.status];
  const StatusIcon = status.icon;
  const priority = PRIORITY_META[item.priority];
  const AgentIcon = (item.agent && AGENT_ICONS[item.agent]) || User;

  const isExecuting = item.status === "in_progress";
  const isDone = item.status === "done";

  return (
    <li className="grid grid-cols-[24px_minmax(0,1fr)_120px_140px_120px_140px] items-center gap-3 px-5 py-3.5 transition hover:bg-[rgba(28,28,28,0.025)]">
      <span className="grid h-5 w-5 place-items-center">
        <StatusIcon
          className="h-[16px] w-[16px]"
          style={{ color: status.color }}
          strokeWidth={1.8}
        />
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.sourceLabel && (
            <span className="rounded-pill border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.06em] text-charcoal-muted">
              {item.sourceLabel}
            </span>
          )}
          <p className="truncate text-[14.5px] font-[480] text-charcoal">
            {item.title}
          </p>
        </div>
        {item.description && (
          <p className="mt-0.5 truncate text-[12.5px] text-charcoal-muted">
            {item.description}
          </p>
        )}
      </div>

      <span
        className="inline-flex items-center gap-1.5 text-[12.5px]"
        style={{ color: priority.color }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: priority.color }}
        />
        {priority.label}
      </span>

      <button
        type="button"
        onClick={() => item.projectHref && onNavigate(item.projectHref)}
        disabled={!item.projectHref}
        className={cn(
          "truncate text-left text-[12.5px] text-charcoal",
          item.projectHref && "underline-offset-2 hover:underline"
        )}
        title={item.project}
      >
        {item.project ?? "—"}
      </button>

      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-charcoal">
        <span className="grid h-5 w-5 place-items-center rounded-pill border border-cream-light bg-cream">
          <AgentIcon className="h-3 w-3" strokeWidth={1.6} />
        </span>
        {item.agent ?? "Unassigned"}
      </span>

      <div className="flex justify-end">
        {isDone ? (
          <span className="text-[12.5px] text-charcoal-muted">Completed</span>
        ) : isExecuting ? (
          <button
            type="button"
            onClick={() => item.projectHref && onNavigate(item.projectHref)}
            className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-blue-500/30 bg-blue-500/10 px-3 text-[12.5px] text-[#2563eb] transition hover:bg-blue-500/15"
          >
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/50" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500" />
            </span>
            View
            <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onExecute(item.id)}
            className="btn-primary h-8 px-3 text-[12.5px]"
            title="할당된 에이전트가 작업을 시작합니다"
          >
            <Play className="h-3 w-3" strokeWidth={1.8} />
            Execute
          </button>
        )}
      </div>
    </li>
  );
}

export function BacklogToast({
  count,
  onNavigate,
  onDismiss,
}: {
  count: number;
  onNavigate: () => void;
  onDismiss: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="pointer-events-auto fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-pill border border-cream-light bg-charcoal px-4 py-2 text-charcoal-offwhite shadow-focus">
      <div className="flex items-center gap-3 text-[13px]">
        <span className="grid h-5 w-5 place-items-center rounded-pill bg-white/10">
          <CheckCircle2 className="h-3 w-3" strokeWidth={1.8} />
        </span>
        <span>{count} 항목이 Backlog에 추가됨</span>
        <button
          type="button"
          onClick={onNavigate}
          className="inline-flex items-center gap-1 rounded-pill bg-white/10 px-2 py-0.5 text-[12px] transition hover:bg-white/15"
        >
          View
          <ChevronRight className="h-3 w-3" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[12px] text-white/60 transition hover:text-white"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
