import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Ban,
  Beaker,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDashed,
  CircleDot,
  FlaskConical,
  ListChecks,
  Rocket,
  Search,
  Sparkles,
  Target,
  Undo2,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "../lib/cn";
import type { NewIssueSeed } from "../components/NewIssueModal";
import {
  EXPERIMENTS,
  NEXT_ACTION_CONFIG,
  VERDICT_CONFIG,
  type Experiment,
  type ExperimentNextAction,
  type ExperimentStatus,
  type ExperimentVerdict,
  type NextActionKind,
} from "../lib/experiments";

type IconKind = ComponentType<{ className?: string; strokeWidth?: number }>;

const NEXT_ACTION_ICON: Record<NextActionKind, IconKind> = {
  ship: Rocket,
  "new-experiment": FlaskConical,
  investigate: Search,
  rollback: Undo2,
  kill: Ban,
};

const ACTION_STATUS_TONE: Record<
  NonNullable<ExperimentNextAction["status"]>,
  { label: string; tone: string }
> = {
  queued: { label: "Queued", tone: "text-charcoal bg-cream border-cream-light" },
  in_progress: {
    label: "In progress",
    tone:
      "text-info bg-info/[0.08] border-info/25",
  },
  done: {
    label: "Done",
    tone:
      "text-success bg-success/[0.08] border-success/25",
  },
};

// Deterministic pseudo-progress for in_progress actions (mockup only).
function mockProgress(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i += 1) {
    h = (h * 31 + title.charCodeAt(i)) | 0;
  }
  // 25 ~ 85
  return 25 + (Math.abs(h) % 61);
}

const STATUS_CONFIG: Record<
  ExperimentStatus,
  { color: string; label: string; Icon: typeof Circle }
> = {
  done: { color: "#1f8a4c", label: "Closed", Icon: CheckCircle2 },
  in_progress: { color: "#2563eb", label: "In progress", Icon: CircleDot },
  pending: { color: "#c89211", label: "Pending", Icon: CircleDashed },
  todo: { color: "rgba(28,28,28,0.45)", label: "Todo", Icon: Circle },
};

type Filter = "all" | "in_flight" | "closed";
type VerdictFilter = "all" | ExperimentVerdict;

type Props = {
  onNavigate: (href: string) => void;
  onPlan?: (seed: NewIssueSeed) => void;
};

export function Experiments({ onNavigate, onPlan }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [verdict, setVerdict] = useState<VerdictFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(
    () => EXPERIMENTS.find((e) => e.status === "done")?.href ?? null
  );

  const summary = useMemo(() => {
    const total = EXPERIMENTS.length;
    const closed = EXPERIMENTS.filter((e) => e.status === "done").length;
    const inFlight = EXPERIMENTS.filter(
      (e) => e.status === "in_progress" || e.status === "pending"
    ).length;
    const validated = EXPERIMENTS.filter(
      (e) => e.status === "done" && e.verdict === "validated"
    ).length;
    const learnings = EXPERIMENTS.reduce(
      (acc, e) => acc + e.learnings.length,
      0
    );
    const newExperiments = EXPERIMENTS.reduce(
      (acc, e) =>
        acc +
        e.nextActions.filter((a) => a.kind === "new-experiment").length,
      0
    );
    return { total, closed, inFlight, validated, learnings, newExperiments };
  }, []);

  const filtered = useMemo(() => {
    return EXPERIMENTS.filter((e) => {
      if (filter === "closed" && e.status !== "done") return false;
      if (
        filter === "in_flight" &&
        e.status !== "in_progress" &&
        e.status !== "pending"
      )
        return false;
      if (verdict !== "all" && e.verdict !== verdict) return false;
      return true;
    });
  }, [filter, verdict]);

  return (
    <div className="mx-auto max-w-wide">
      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
              Experiments
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-charcoal-muted">
              이 제품에서 돌아간 모든 실험(projects)의 가설 → 결과 → 학습 →
              다음 액션을 한 면에. 각 항목은 해당 Project Detail의 Learn Loop
              산출물에서 자동 집계됩니다.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 @2xl:grid-cols-4">
          <SummaryCard
            icon={<FlaskConical className="h-3.5 w-3.5" strokeWidth={1.6} />}
            label="Total experiments"
            value={String(summary.total)}
            hint={`${summary.inFlight} active · ${summary.closed} closed`}
          />
          <SummaryCard
            icon={<CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.6} />}
            label="Validated"
            value={`${summary.validated}/${summary.closed}`}
            hint="of closed experiments"
          />
          <SummaryCard
            icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />}
            label="Distilled learnings"
            value={String(summary.learnings)}
            hint="captured across all experiments"
          />
          <SummaryCard
            icon={<Target className="h-3.5 w-3.5" strokeWidth={1.6} />}
            label="Derived experiments"
            value={String(summary.newExperiments)}
            hint="queued from prior learnings"
          />
        </div>
      </header>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-light px-5 py-4">
          <div className="flex items-center gap-2 text-[13px] text-charcoal">
            <Beaker className="h-4 w-4" strokeWidth={1.6} />
            <span className="font-[480]">Experiment log</span>
            <span className="text-charcoal-muted">· {filtered.length} shown</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterGroup
              value={filter}
              onChange={setFilter}
              options={[
                { id: "all", label: "All" },
                { id: "in_flight", label: "In flight" },
                { id: "closed", label: "Closed" },
              ]}
            />
            <FilterGroup
              value={verdict}
              onChange={setVerdict}
              options={[
                { id: "all", label: "Any verdict" },
                { id: "validated", label: "Validated" },
                { id: "mixed", label: "Mixed" },
                { id: "invalidated", label: "Invalidated" },
                { id: "tbd", label: "TBD" },
              ]}
            />
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-cream-light">
          {filtered.map((e) => (
            <ExperimentRow
              key={e.href}
              experiment={e}
              expanded={expanded === e.href}
              onToggle={() =>
                setExpanded((prev) => (prev === e.href ? null : e.href))
              }
              onOpen={() => onNavigate(e.href)}
              onPlan={onPlan}
            />
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-12 text-center text-[13.5px] text-charcoal-muted">
              조건에 맞는 실험이 없어요.
            </li>
          )}
        </ul>
      </section>

      <p className="mt-4 text-[12.5px] text-charcoal-muted">
        Experiments는 Source of Truth가 아닌 <em>derived view</em>입니다.
        실제 데이터는 각 Project의 Learn Loop 페이즈에서 관리됩니다.
      </p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-[12.5px] text-charcoal-muted">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-[20px] font-[600] tracking-[-0.4px] text-charcoal">
        {value}
      </p>
      <p className="mt-0.5 text-[12.5px] text-charcoal-muted">{hint}</p>
    </div>
  );
}

function FilterGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-pill bg-charcoal/[0.06] p-1">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-pill px-3.5 text-[13px] transition",
              active
                ? "bg-cream text-charcoal shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(28,28,28,0.04)]"
                : "text-charcoal-muted hover:text-charcoal"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ExperimentRow({
  experiment: e,
  expanded,
  onToggle,
  onOpen,
  onPlan,
}: {
  experiment: Experiment;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onPlan?: (seed: NewIssueSeed) => void;
}) {
  const status = STATUS_CONFIG[e.status];
  const v = VERDICT_CONFIG[e.verdict];
  const StatusIcon = status.Icon;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-charcoal/[0.03]"
      >
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-charcoal-muted" strokeWidth={1.8} />
          ) : (
            <ChevronRight className="h-4 w-4 text-charcoal-muted" strokeWidth={1.8} />
          )}
        </span>
        <StatusIcon
          className="mt-0.5 h-4 w-4 shrink-0"
          style={{ color: status.color }}
          strokeWidth={1.8}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14.5px] font-[500] text-charcoal">{e.title}</p>
            {e.product && (
              <span className="rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11.5px] text-charcoal-muted">
                {e.product}
              </span>
            )}
            <VerdictPill color={v.color} label={v.label} />
          </div>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.5] text-charcoal-muted">
            <span className="text-charcoal">Hypothesis · </span>
            {e.hypothesis}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-charcoal-muted">
            <span>
              <span className="text-charcoal">{e.metric}</span>
              {" · "}target {e.target}
            </span>
            {e.resultDelta && (
              <span>
                Result {e.result} <span className="text-charcoal">{e.resultDelta}</span>
              </span>
            )}
            <span>{e.learnings.length} learnings</span>
            <span>{e.nextActions.length} next actions</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-cream-light bg-charcoal/[0.02] px-5 py-5">
          <div className="grid grid-cols-1 gap-5 @5xl:grid-cols-2">
            <div>
              <SectionLabel
                icon={<Target className="h-3.5 w-3.5" strokeWidth={1.6} />}
                label="Outcome"
              />
              <dl className="mt-2 grid grid-cols-[110px_1fr] gap-y-1.5 text-[13px]">
                <dt className="text-charcoal-muted">Baseline</dt>
                <dd className="text-charcoal">{e.baseline ?? "—"}</dd>
                <dt className="text-charcoal-muted">Target</dt>
                <dd className="text-charcoal">{e.target}</dd>
                <dt className="text-charcoal-muted">Result</dt>
                <dd className="text-charcoal">
                  {e.result ?? "측정 중"}
                  {e.resultDelta ? ` · ${e.resultDelta}` : ""}
                </dd>
                <dt className="text-charcoal-muted">Verdict</dt>
                <dd>
                  <VerdictPill color={v.color} label={v.label} />
                </dd>
              </dl>
            </div>
            <div>
              <SectionLabel
                icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />}
                label="Learnings"
              />
              {e.learnings.length > 0 ? (
                <ul className="mt-2 flex flex-col gap-1.5 text-[13px] text-charcoal">
                  {e.learnings.map((l, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-charcoal-muted tabular-nums">
                        {i + 1}.
                      </span>
                      <span className="leading-[1.5]">{l}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[13px] text-charcoal-muted">
                  아직 정제된 학습이 없습니다.
                </p>
              )}
            </div>
            <div className="@5xl:col-span-2">
              <SectionLabel
                icon={<ListChecks className="h-3.5 w-3.5" strokeWidth={1.6} />}
                label="Next actions"
              />
              {e.nextActions.length > 0 ? (
                <div className="card mt-2.5 overflow-hidden">
                  <ul className="divide-y divide-cream-light">
                    {e.nextActions.map((a, i) => (
                      <NextActionItem
                        key={i}
                        action={a}
                        experiment={e}
                        onPlan={onPlan}
                        onOpenRun={onOpen}
                      />
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-charcoal-muted">
                  아직 후속 액션이 없습니다.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end">
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                onOpen();
              }}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] text-charcoal underline-offset-4 hover:underline"
            >
              Open project detail
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function VerdictPill({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11.5px]"
      style={{ color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function NextActionItem({
  action,
  experiment,
  onPlan,
  onOpenRun,
}: {
  action: ExperimentNextAction;
  experiment: Experiment;
  onPlan?: (seed: NewIssueSeed) => void;
  onOpenRun: () => void;
}) {
  const cfg = NEXT_ACTION_CONFIG[action.kind];
  const KindIcon = NEXT_ACTION_ICON[action.kind];
  const status = action.status ?? "queued";
  const statusMeta = ACTION_STATUS_TONE[status];
  const progress = status === "in_progress" ? mockProgress(action.title) : 0;

  return (
    <li className="group">
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4 px-5 py-4 transition hover:bg-charcoal/[0.025]">
        <span
          aria-label={cfg.label}
          title={cfg.label}
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border border-cream-light bg-cream"
          style={{ color: cfg.color }}
        >
          <KindIcon className="h-4.5 w-4.5" strokeWidth={1.6} />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-pill px-2 py-0.5 text-[11px] font-[480] uppercase tracking-[0.06em]"
              style={{
                color: cfg.color,
                backgroundColor: `${cfg.color}14`,
                border: `1px solid ${cfg.color}33`,
              }}
            >
              {cfg.label}
            </span>
            <span
              className={cn(
                "rounded-pill border px-2 py-0.5 text-[11px] font-[480]",
                statusMeta.tone
              )}
            >
              {statusMeta.label}
            </span>
            <span className="text-[12px] text-charcoal-muted">
              {action.owner ?? "Unassigned"} · derived from {experiment.title}
            </span>
          </div>

          <p className="mt-2 text-[15px] font-[480] leading-[1.4] text-charcoal">
            {action.title}
          </p>

          {status === "in_progress" ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="relative h-1 max-w-[280px] flex-1 overflow-hidden rounded-pill bg-charcoal/[0.08]">
                <div
                  className="absolute inset-y-0 left-0 rounded-pill bg-info"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[12px] tabular-nums text-charcoal-muted">
                {progress}% · Agent run in flight
              </span>
            </div>
          ) : (
            <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.55] text-charcoal-muted">
              {status === "done"
                ? "완료된 액션 — 결과 리포트가 부모 실험의 Learn Loop 산출물로 자동 연결되어 있어요."
                : `이전 학습에서 도출된 ${cfg.label} 액션. Plan을 눌러 백로그/실험으로 승격시키세요.`}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 self-center">
          {status === "queued" && (
            <button
              type="button"
              disabled={!onPlan}
              onClick={() =>
                onPlan?.({
                  title: action.title,
                  sourceLabel: `Experiment · ${experiment.title}`,
                  description: `> Experiment · ${experiment.title} · ${cfg.label}\n\n${action.title}`,
                })
              }
              className={cn(
                "btn-primary h-8 px-3 text-[13px]",
                !onPlan && "cursor-not-allowed opacity-50"
              )}
            >
              Plan
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          )}
          {status === "in_progress" && (
            <button
              type="button"
              onClick={onOpenRun}
              className="btn-primary h-8 px-3 text-[13px]"
            >
              View run
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          )}
          {status === "done" && (
            <button
              type="button"
              onClick={onOpenRun}
              className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-3 text-[13px] text-charcoal transition hover:bg-charcoal/[0.04]"
            >
              View result
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>
          )}
          <button
            type="button"
            className="text-[12px] text-charcoal-muted underline-offset-4 transition hover:underline"
          >
            Snooze
          </button>
        </div>
      </div>
    </li>
  );
}

function SectionLabel({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11.5px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
      {icon}
      {label}
    </div>
  );
}
