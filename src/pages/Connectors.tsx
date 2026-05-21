import { useEffect, useMemo, useState, type ComponentType, type CSSProperties } from "react";
import {
  Plug,
  X,
  Radio,
  Repeat,
  Wrench,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { cn } from "../lib/cn";
import {
  type Capability,
  type CapabilityKind,
  type Connector,
  type ConnectorStatus,
} from "../lib/connectors";
import type { Routine } from "../lib/routines";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

const STATUS_DOT: Record<ConnectorStatus, { label: string; dot: string }> = {
  connected: { label: "Connected", dot: "#1f8a4c" },
  available: { label: "Not connected", dot: "rgba(28,28,28,0.25)" },
  error: { label: "Error", dot: "#b8443a" },
  syncing: { label: "Syncing", dot: "#2563eb" },
};

const KIND_META: Record<
  CapabilityKind | "routine",
  { label: string; icon: IconType; color: string }
> = {
  signal: { label: "Signals", icon: Radio, color: "#2563eb" },
  routine: { label: "Routines", icon: Repeat, color: "#7c6cff" },
  task: { label: "Task actions", icon: Wrench, color: "#c89211" },
};

type FilterKey = "all" | "connected" | "available" | "errors";
const FILTERS: Array<{ id: FilterKey; label: string }> = [
  { id: "all", label: "All" },
  { id: "connected", label: "Connected" },
  { id: "available", label: "Not connected" },
  { id: "errors", label: "Errors" },
];

type Props = {
  sampleData: boolean;
  connectors: Connector[];
  routines: Routine[];
  onLoadSamples: () => void;
  onNavigate: (href: string) => void;
  onToggleCapability: (connectorId: string, capId: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onReconnect: (id: string) => void;
};

export function Connectors({
  sampleData,
  connectors,
  routines,
  onLoadSamples,
  onNavigate,
  onToggleCapability,
  onConnect,
  onDisconnect,
  onReconnect,
}: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => connectors.find((c) => c.id === selectedId) ?? null,
    [connectors, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const counts = useMemo(() => {
    let connected = 0;
    let available = 0;
    let errors = 0;
    for (const c of connectors) {
      if (c.status === "connected" || c.status === "syncing") connected += 1;
      else if (c.status === "available") available += 1;
      else if (c.status === "error") errors += 1;
    }
    return { all: connectors.length, connected, available, errors };
  }, [connectors]);

  const visible = useMemo(() => {
    return connectors.filter((c) => {
      if (filter === "all") return true;
      if (filter === "connected")
        return c.status === "connected" || c.status === "syncing";
      if (filter === "available") return c.status === "available";
      if (filter === "errors") return c.status === "error";
      return true;
    });
  }, [connectors, filter]);

  // routine count per connector — used by card and drawer
  const routineCountByConnector = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of routines) {
      for (const cid of r.requiredConnectors) {
        m[cid] = (m[cid] ?? 0) + 1;
      }
    }
    return m;
  }, [routines]);

  if (!sampleData && connectors.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8">
          <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
            Connectors
          </h2>
        </header>
        <EmptyState
          icon={Plug}
          title="아직 연결된 커넥터가 없어요"
          description="외부 시스템을 연결하면 시그널·루틴·태스크 동작이 자동으로 켜집니다."
          onLoadSamples={onLoadSamples}
        />
      </div>
    );
  }

  const linkedRoutines = selected
    ? routines.filter((r) => r.requiredConnectors.includes(selected.id))
    : [];

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-8">
        <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Connectors
        </h2>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-[1.55] text-charcoal-muted">
          외부 시스템을 연결해 시그널·루틴·태스크 동작을 켭니다. 루틴은
          <span className="text-charcoal">Routines</span>에서 관리되며, 이 페이지는
          어떤 루틴이 어느 커넥터를 사용하는지 보여줍니다.
        </p>
      </header>

      <section>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const count = counts[f.id];
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
        <div className="grid grid-cols-1 gap-2 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {visible.map((c) => (
            <ConnectorCard
              key={c.id}
              connector={c}
              routineCount={routineCountByConnector[c.id] ?? 0}
              onClick={() => setSelectedId(c.id)}
            />
          ))}
        </div>
        {visible.length === 0 && (
          <div className="card mt-3 grid h-32 place-items-center">
            <p className="text-[14px] text-charcoal-muted">
              해당 상태의 커넥터가 없습니다.
            </p>
          </div>
        )}
      </section>

      {selected && (
        <ConnectorDrawer
          connector={selected}
          linkedRoutines={linkedRoutines}
          onClose={() => setSelectedId(null)}
          onToggleCapability={(capId) => onToggleCapability(selected.id, capId)}
          onConnect={() => onConnect(selected.id)}
          onDisconnect={() => onDisconnect(selected.id)}
          onReconnect={() => onReconnect(selected.id)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────────────────────

function ConnectorCard({
  connector,
  routineCount,
  onClick,
}: {
  connector: Connector;
  routineCount: number;
  onClick: () => void;
}) {
  const status = STATUS_DOT[connector.status];
  const activeCount =
    connector.status === "connected" || connector.status === "syncing"
      ? connector.capabilities.filter((c) => c.enabled).length + routineCount
      : 0;
  const isAvailable = connector.status === "available";

  return (
    <button
      type="button"
      onClick={onClick}
      className="card group flex items-center gap-3 p-3.5 text-left transition hover:bg-[rgba(28,28,28,0.025)]"
    >
      <BrandBadge color={connector.brandColor} label={connector.badge} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-[480] text-charcoal">
          {connector.name}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-charcoal-muted">
          {connector.status === "syncing" ? (
            <Loader2
              className="h-2.5 w-2.5 animate-spin"
              strokeWidth={2}
              style={{ color: status.dot }}
            />
          ) : (
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: status.dot }}
            />
          )}
          <span className="truncate">
            {status.label}
            {isAvailable
              ? routineCount > 0
                ? ` · ${routineCount}개 루틴이 대기 중`
                : ""
              : connector.status === "connected"
              ? ` · ${activeCount} 활성`
              : ""}
          </span>
        </div>
      </div>
    </button>
  );
}

function BrandBadge({
  color,
  label,
  size = 40,
}: {
  color: string;
  label: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-md text-[13px] font-[600] text-charcoal-offwhite shadow-inset-dark"
      style={{ backgroundColor: color, height: size, width: size }}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawer
// ─────────────────────────────────────────────────────────────────────────────

function ConnectorDrawer({
  connector,
  linkedRoutines,
  onClose,
  onToggleCapability,
  onConnect,
  onDisconnect,
  onReconnect,
  onNavigate,
}: {
  connector: Connector;
  linkedRoutines: Routine[];
  onClose: () => void;
  onToggleCapability: (capId: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  onNavigate: (href: string) => void;
}) {
  const status = STATUS_DOT[connector.status];
  const isConnected = connector.status === "connected";
  const isError = connector.status === "error";
  const isAvailable = connector.status === "available";
  const signals = connector.capabilities.filter((c) => c.kind === "signal");
  const tasks = connector.capabilities.filter((c) => c.kind === "task");

  return (
    <div className="fixed inset-0 z-40">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/25 backdrop-blur-[1px] animate-[fadeIn_180ms_ease-out]"
      />
      <aside
        role="dialog"
        aria-label={`${connector.name} 커넥터`}
        className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-cream shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.18)] animate-[fadeUp_220ms_ease-out]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-cream-light px-5 py-4">
          <div className="flex items-center gap-3">
            <BrandBadge color={connector.brandColor} label={connector.badge} />
            <div className="min-w-0">
              <p className="truncate text-[16px] font-[480] text-charcoal">
                {connector.name}
              </p>
              <div className="mt-0.5 inline-flex items-center gap-1.5 text-[12.5px] text-charcoal-muted">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: status.dot }}
                />
                {status.label}
                {connector.lastSync && (
                  <>
                    <span className="text-charcoal-muted/40">·</span>
                    <span>{connector.lastSync}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </header>

        {isError && connector.errorReason && (
          <div className="border-b border-cream-light bg-[rgba(184,68,58,0.04)] px-5 py-2.5 text-[12.5px] text-[#b8443a]">
            {connector.errorReason}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isAvailable && (
            <p className="text-[13px] leading-[1.55] text-charcoal-muted">
              연결하면 아래 시그널·태스크 동작이 켜지고 대기 중인 루틴이
              실행 가능해집니다.
            </p>
          )}

          {signals.length > 0 && (
            <CapabilitySection
              kind="signal"
              caps={signals}
              canToggle={isConnected}
              onToggle={onToggleCapability}
            />
          )}

          {linkedRoutines.length > 0 && (
            <RoutineRefSection
              routines={linkedRoutines}
              onNavigate={onNavigate}
            />
          )}

          {tasks.length > 0 && (
            <CapabilitySection
              kind="task"
              caps={tasks}
              canToggle={isConnected}
              onToggle={onToggleCapability}
            />
          )}
        </div>

        <footer className="flex items-center justify-end gap-1.5 border-t border-cream-light px-5 py-3.5">
          {isAvailable && (
            <button
              type="button"
              onClick={onConnect}
              className="btn-primary h-8 px-3 text-[13px]"
            >
              <Plug className="h-3.5 w-3.5" strokeWidth={1.8} />
              연결
            </button>
          )}
          {isError && (
            <button
              type="button"
              onClick={onReconnect}
              className="btn-primary h-8 px-3 text-[13px]"
            >
              재연결
            </button>
          )}
          {isConnected && (
            <>
              <button
                type="button"
                onClick={onDisconnect}
                className="inline-flex h-8 items-center rounded-md px-3 text-[13px] text-charcoal-muted transition hover:text-[#b8443a]"
              >
                연결 해제
              </button>
              <button
                type="button"
                onClick={onReconnect}
                className="inline-flex h-8 items-center rounded-md border border-cream-light bg-cream px-3 text-[13px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
              >
                다시 동기화
              </button>
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}

function CapabilitySection({
  kind,
  caps,
  canToggle,
  onToggle,
}: {
  kind: CapabilityKind;
  caps: Capability[];
  canToggle: boolean;
  onToggle: (capId: string) => void;
}) {
  const meta = KIND_META[kind];
  const MetaIcon = meta.icon;
  return (
    <section className="mt-5 first:mt-2">
      <header className="mb-1.5 flex items-center gap-1.5">
        <MetaIcon
          className="h-3 w-3"
          strokeWidth={2}
          style={{ color: meta.color }}
        />
        <p className="text-[11px] uppercase tracking-[0.06em] text-charcoal-muted">
          {meta.label}
        </p>
      </header>
      <ul className="-mx-2">
        {caps.map((cap) => (
          <CapabilityRow
            key={cap.id}
            cap={cap}
            canToggle={canToggle}
            onToggle={() => onToggle(cap.id)}
          />
        ))}
      </ul>
    </section>
  );
}

function RoutineRefSection({
  routines,
  onNavigate,
}: {
  routines: Routine[];
  onNavigate: (href: string) => void;
}) {
  const meta = KIND_META.routine;
  const MetaIcon = meta.icon;
  return (
    <section className="mt-5">
      <header className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MetaIcon
            className="h-3 w-3"
            strokeWidth={2}
            style={{ color: meta.color }}
          />
          <p className="text-[11px] uppercase tracking-[0.06em] text-charcoal-muted">
            {meta.label}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("#routines")}
          className="inline-flex items-center gap-1 text-[11.5px] text-charcoal-muted underline-offset-4 transition hover:text-charcoal hover:underline"
        >
          Routines에서 관리
          <ArrowUpRight className="h-3 w-3" strokeWidth={1.8} />
        </button>
      </header>
      <ul className="-mx-2">
        {routines.map((r) => (
          <li
            key={r.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-[rgba(28,28,28,0.03)]",
              !r.enabled && "opacity-60"
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] text-charcoal">{r.name}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-charcoal-muted">
                {r.schedule}
                {!r.enabled && " · 비활성"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CapabilityRow({
  cap,
  canToggle,
  onToggle,
}: {
  cap: Capability;
  canToggle: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-[rgba(28,28,28,0.03)]",
        !canToggle && "opacity-60 hover:bg-transparent"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] text-charcoal">{cap.label}</p>
        {cap.schedule && (
          <p className="mt-0.5 truncate text-[11.5px] text-charcoal-muted">
            {cap.schedule}
          </p>
        )}
      </div>
      <Toggle
        enabled={cap.enabled && canToggle}
        disabled={!canToggle}
        onClick={onToggle}
      />
    </li>
  );
}

function Toggle({
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
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-pill transition",
        enabled ? "bg-charcoal shadow-inset-dark" : "bg-[rgba(28,28,28,0.15)]",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-charcoal-offwhite transition",
          enabled ? "translate-x-[20px]" : "translate-x-[2px]"
        )}
      />
    </button>
  );
}
