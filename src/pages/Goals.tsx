import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CircleAlert,
  CheckCircle2,
  Bot,
  BrainCircuit,
  Gem,
  Megaphone,
  Wrench,
  User,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Layers,
  GitBranch,
  CircleDot,
} from "lucide-react";
import type { BacklogItem } from "../lib/backlog";
import { cn } from "../lib/cn";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

type ObjectiveStatus = "on_track" | "at_risk" | "off_track" | "done";

type KeyResult = {
  id: string;
  label: string;
  metric: string;
  current: number;
  start: number;
  target: number;
  unit: string;
  owner: string;
  status: ObjectiveStatus;
  updatedAt: string;
  linkedProject?: { label: string; href: string };
  linkedBacklogIds: string[];
};

type Objective = {
  id: string;
  emoji: string;
  title: string;
  pitch: string;
  owner: string;
  status: ObjectiveStatus;
  dueDate: string;
  projects: { label: string; href: string }[];
  keyResults: KeyResult[];
};

const STATUS_META: Record<
  ObjectiveStatus,
  { label: string; color: string; icon: IconType }
> = {
  on_track: { label: "On track", color: "#1f8a4c", icon: TrendingUp },
  at_risk: { label: "At risk", color: "#c89211", icon: AlertTriangle },
  off_track: { label: "Off track", color: "#b8443a", icon: CircleAlert },
  done: { label: "Achieved", color: "#1f8a4c", icon: CheckCircle2 },
};

const AGENT_ICONS: Record<string, IconType> = {
  CEO: Bot,
  CTO: BrainCircuit,
  UXDesigner: Gem,
  Marketer: Megaphone,
  Engineer: Wrench,
};

const PROJECT_ONBOARDING = {
  label: "Onboarding flow v2",
  href: "#proj-onboarding",
};
const PROJECT_PRICING = {
  label: "Pricing & billing rework",
  href: "#proj-pricing",
};
const PROJECT_HEALTH = {
  label: "Customer health score",
  href: "#proj-health",
};
const PROJECT_MARKETPLACE = {
  label: "AI agent marketplace",
  href: "#proj-marketplace",
};
const PROJECT_MOBILE = {
  label: "Mobile app launch",
  href: "#proj-mobile",
};

const OBJECTIVES: Objective[] = [
  {
    id: "obj-activation",
    emoji: "🌱",
    title: "신규 가입자가 첫 가치까지 빠르게 도달하게 한다",
    pitch:
      "step 3에서 -38% 회복 + 활성화율 28% → 45%. 모든 가입자가 5일 안에 첫 워크플로우를 실행하도록 funnel을 다시 짠다.",
    owner: "UXDesigner",
    status: "at_risk",
    dueDate: "Q2 2026 (~ 06-30)",
    projects: [PROJECT_ONBOARDING],
    keyResults: [
      {
        id: "kr-1-1",
        label: "Activation rate",
        metric: "신규 가입자 중 7일 내 첫 워크플로우 실행 비율",
        current: 32,
        start: 28,
        target: 45,
        unit: "%",
        owner: "UXDesigner",
        status: "at_risk",
        updatedAt: "어제",
        linkedProject: PROJECT_ONBOARDING,
        linkedBacklogIds: ["b-5"],
      },
      {
        id: "kr-1-2",
        label: "Time to first value",
        metric: "가입 → 첫 가치 경험까지 중앙값",
        current: 11,
        start: 14,
        target: 5,
        unit: "d",
        owner: "UXDesigner",
        status: "on_track",
        updatedAt: "3일 전",
        linkedProject: PROJECT_ONBOARDING,
        linkedBacklogIds: [],
      },
      {
        id: "kr-1-3",
        label: "Step 3 완료율",
        metric: "Workspace invite 단계 완료율",
        current: 54,
        start: 50,
        target: 88,
        unit: "%",
        owner: "Engineer",
        status: "off_track",
        updatedAt: "오늘",
        linkedProject: PROJECT_ONBOARDING,
        linkedBacklogIds: ["b-5"],
      },
    ],
  },
  {
    id: "obj-revenue",
    emoji: "📈",
    title: "ARR 본격 가속 — $100K MRR을 분기 안에 돌파한다",
    pitch:
      "$48.2K → $100K MRR. Pricing 개편 + 엔터프라이즈 파일럿 + 결제 누수 회수로 성장 축을 세 갈래로 분산한다.",
    owner: "CEO",
    status: "on_track",
    dueDate: "Q2 2026 (~ 06-30)",
    projects: [PROJECT_PRICING, PROJECT_HEALTH],
    keyResults: [
      {
        id: "kr-2-1",
        label: "MRR",
        metric: "월간 반복 매출",
        current: 64,
        start: 48,
        target: 100,
        unit: "K$",
        owner: "CEO",
        status: "on_track",
        updatedAt: "오늘",
        linkedProject: PROJECT_PRICING,
        linkedBacklogIds: [],
      },
      {
        id: "kr-2-2",
        label: "Enterprise pilots",
        metric: "$24K+ 연간 계약 파일럿 수",
        current: 1,
        start: 0,
        target: 3,
        unit: "건",
        owner: "CEO",
        status: "on_track",
        updatedAt: "이번 주",
        linkedProject: PROJECT_HEALTH,
        linkedBacklogIds: ["b-6"],
      },
      {
        id: "kr-2-3",
        label: "Churn",
        metric: "월간 logo churn (낮을수록 좋음)",
        current: 1.8,
        start: 2.4,
        target: 1.5,
        unit: "%",
        owner: "CTO",
        status: "at_risk",
        updatedAt: "이번 주",
        linkedProject: PROJECT_PRICING,
        linkedBacklogIds: ["b-1"],
      },
    ],
  },
  {
    id: "obj-marketplace",
    emoji: "🛒",
    title: "Agent Marketplace의 기반을 세운다",
    pitch:
      "외부 에이전트 10종 + discovery · 과금 · 권한 모델까지. Linear 0.32의 marketplace 출시를 의식한 차별화 포인트가 살아 있어야 한다.",
    owner: "CTO",
    status: "at_risk",
    dueDate: "Q2 2026 (~ 06-30)",
    projects: [PROJECT_MARKETPLACE],
    keyResults: [
      {
        id: "kr-3-1",
        label: "External agents 등록",
        metric: "마켓플레이스에 검증·게시된 외부 에이전트 수",
        current: 3,
        start: 0,
        target: 10,
        unit: "개",
        owner: "CTO",
        status: "at_risk",
        updatedAt: "어제",
        linkedProject: PROJECT_MARKETPLACE,
        linkedBacklogIds: ["b-4"],
      },
      {
        id: "kr-3-2",
        label: "/workflows p95",
        metric: "트리거 API 95퍼센타일 응답 시간 (낮을수록 좋음)",
        current: 1.8,
        start: 0.32,
        target: 0.4,
        unit: "s",
        owner: "Engineer",
        status: "off_track",
        updatedAt: "오늘",
        linkedProject: PROJECT_MARKETPLACE,
        linkedBacklogIds: ["b-3"],
      },
      {
        id: "kr-3-3",
        label: "Agent uptime",
        metric: "Agents Cloud 월간 가용성",
        current: 99.1,
        start: 98.5,
        target: 99.9,
        unit: "%",
        owner: "Engineer",
        status: "on_track",
        updatedAt: "오늘",
        linkedProject: PROJECT_MARKETPLACE,
        linkedBacklogIds: [],
      },
    ],
  },
  {
    id: "obj-mobile",
    emoji: "📱",
    title: "Mobile 1.0을 출시해 채널을 다양화한다",
    pitch:
      "iOS · Android 1.0 출시 + 모바일 신규 가입 30%. 디자인 · 빌드 파이프라인 · TestFlight 흐름을 한 번에 정리한다.",
    owner: "Engineer",
    status: "on_track",
    dueDate: "Q2 2026 (~ 06-30)",
    projects: [PROJECT_MOBILE],
    keyResults: [
      {
        id: "kr-4-1",
        label: "iOS 1.0 출시",
        metric: "App Store 정식 출시 (Ship 여부)",
        current: 0,
        start: 0,
        target: 1,
        unit: "ship",
        owner: "Engineer",
        status: "on_track",
        updatedAt: "이번 주",
        linkedProject: PROJECT_MOBILE,
        linkedBacklogIds: [],
      },
      {
        id: "kr-4-2",
        label: "Android 1.0 출시",
        metric: "Play Store 정식 출시 (Ship 여부)",
        current: 0,
        start: 0,
        target: 1,
        unit: "ship",
        owner: "Engineer",
        status: "at_risk",
        updatedAt: "이번 주",
        linkedProject: PROJECT_MOBILE,
        linkedBacklogIds: ["b-2"],
      },
      {
        id: "kr-4-3",
        label: "모바일 신규 가입 비중",
        metric: "Mobile에서 발생한 신규 가입자 비율",
        current: 8,
        start: 0,
        target: 30,
        unit: "%",
        owner: "Marketer",
        status: "on_track",
        updatedAt: "어제",
        linkedProject: PROJECT_MOBILE,
        linkedBacklogIds: [],
      },
    ],
  },
];

const FILTERS: Array<{ id: "all" | ObjectiveStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "on_track", label: "On track" },
  { id: "at_risk", label: "At risk" },
  { id: "off_track", label: "Off track" },
];

type Props = {
  backlogs: BacklogItem[];
  onNavigate: (href: string) => void;
};

export function Goals({ backlogs, onNavigate }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const backlogById = useMemo(() => {
    const map = new Map<string, BacklogItem>();
    for (const b of backlogs) map.set(b.id, b);
    return map;
  }, [backlogs]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: OBJECTIVES.length };
    for (const o of OBJECTIVES) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, []);

  const visible = useMemo(
    () =>
      filter === "all"
        ? OBJECTIVES
        : OBJECTIVES.filter((o) => o.status === filter),
    [filter]
  );

  const overall = useMemo(() => computeOverall(OBJECTIVES), []);

  const totalLinkedBacklogs = useMemo(() => {
    const ids = new Set<string>();
    for (const o of OBJECTIVES) {
      for (const kr of o.keyResults) {
        for (const id of kr.linkedBacklogIds) ids.add(id);
      }
    }
    return ids.size;
  }, []);

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-8">
        <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
          Q2 2026
        </p>
        <h2 className="mt-2 text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Goals
        </h2>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={Target}
          label="Objectives"
          value={OBJECTIVES.length.toString()}
          hint={`${counts.on_track ?? 0} on track`}
          accent="#1c1c1c"
        />
        <StatCard
          icon={TrendingUp}
          label="평균 진행률"
          value={`${overall.avgProgress}%`}
          hint="분기의 60% 지점"
          accent="#2563eb"
        />
        <StatCard
          icon={GitBranch}
          label="연결된 백로그"
          value={totalLinkedBacklogs.toString()}
          hint="KR로 ladder up"
          accent="#5f5f5d"
        />
        <StatCard
          icon={CalendarDays}
          label="Quarter ends"
          value="48d"
          hint="2026-06-30"
          accent={(counts.off_track ?? 0) > 0 ? "#b8443a" : "#5f5f5d"}
        />
      </section>

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

      <section className="mt-5 flex flex-col gap-4">
        {visible.map((o) => (
          <ObjectiveCard
            key={o.id}
            objective={o}
            backlogById={backlogById}
            onNavigate={onNavigate}
          />
        ))}
        {visible.length === 0 && (
          <div className="card grid h-32 place-items-center">
            <p className="text-[14px] text-charcoal-muted">
              해당 상태의 목표가 없습니다.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ObjectiveCard({
  objective,
  backlogById,
  onNavigate,
}: {
  objective: Objective;
  backlogById: Map<string, BacklogItem>;
  onNavigate: (href: string) => void;
}) {
  const status = STATUS_META[objective.status];
  const StatusIcon = status.icon;
  const OwnerIcon = AGENT_ICONS[objective.owner] ?? User;
  const progress = computeObjectiveProgress(objective);

  return (
    <article className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-charcoal-muted">
            <span
              className="inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-[11.5px] font-[480]"
              style={{
                color: status.color,
                backgroundColor: `${status.color}14`,
                borderColor: `${status.color}33`,
              }}
            >
              <StatusIcon className="h-3 w-3" strokeWidth={1.8} />
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="grid h-4 w-4 place-items-center rounded-pill border border-cream-light bg-cream text-charcoal">
                <OwnerIcon className="h-2.5 w-2.5" strokeWidth={1.6} />
              </span>
              {objective.owner}
            </span>
            <span className="text-charcoal-muted/50">·</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" strokeWidth={1.6} />
              {objective.dueDate}
            </span>
          </div>
          <h3 className="mt-2 flex items-start gap-2 text-[22px] font-[600] tracking-[-0.5px] leading-[1.2] text-charcoal">
            <span className="text-[20px] leading-none">{objective.emoji}</span>
            <span>{objective.title}</span>
          </h3>
          <p className="mt-2 max-w-3xl text-[14px] leading-[1.55] text-charcoal-muted">
            {objective.pitch}
          </p>
          {objective.projects.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px] text-charcoal-muted">
              <Layers className="h-3 w-3" strokeWidth={1.6} />
              <span>Projects</span>
              {objective.projects.map((p) => (
                <button
                  key={p.href}
                  type="button"
                  onClick={() => onNavigate(p.href)}
                  className="inline-flex items-center gap-1 rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11.5px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
                >
                  {p.label}
                  <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={1.8} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col items-end gap-2 sm:w-[200px]">
          <p className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
            Overall
          </p>
          <p
            className="text-[36px] font-[600] tracking-[-0.8px] leading-[1]"
            style={{ color: status.color }}
          >
            {progress}%
          </p>
          <div className="relative h-1.5 w-full overflow-hidden rounded-pill bg-[rgba(28,28,28,0.06)]">
            <div
              className="absolute inset-y-0 left-0 rounded-pill"
              style={{
                width: `${progress}%`,
                backgroundColor: status.color,
              }}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-cream-light bg-cream">
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_120px] items-center gap-3 border-b border-cream-light px-6 py-2.5 text-[11px] uppercase tracking-[0.06em] text-charcoal-muted">
          <span>Key Result</span>
          <span>Progress</span>
          <span>Linked work</span>
          <span className="text-right">Status</span>
        </div>
        <ul className="divide-y divide-cream-light">
          {objective.keyResults.map((kr) => (
            <KeyResultRow
              key={kr.id}
              kr={kr}
              backlogById={backlogById}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </div>
    </article>
  );
}

function KeyResultRow({
  kr,
  backlogById,
  onNavigate,
}: {
  kr: KeyResult;
  backlogById: Map<string, BacklogItem>;
  onNavigate: (href: string) => void;
}) {
  const status = STATUS_META[kr.status];
  const StatusIcon = status.icon;
  const OwnerIcon = AGENT_ICONS[kr.owner] ?? User;
  const pct = computeKRProgress(kr);

  const linkedBacklogs = useMemo(
    () =>
      kr.linkedBacklogIds
        .map((id) => backlogById.get(id))
        .filter((b): b is BacklogItem => !!b),
    [kr.linkedBacklogIds, backlogById]
  );
  const executingCount = linkedBacklogs.filter(
    (b) => b.status === "in_progress"
  ).length;

  return (
    <li className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_120px] items-start gap-3 px-6 py-3.5 transition hover:bg-[rgba(28,28,28,0.025)]">
      <div className="min-w-0">
        <p className="truncate text-[14px] font-[480] text-charcoal">
          {kr.label}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[12px] text-charcoal-muted">
          {kr.metric}
        </p>
        <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] text-charcoal-muted">
          <span className="grid h-3.5 w-3.5 place-items-center rounded-pill border border-cream-light bg-cream text-charcoal">
            <OwnerIcon className="h-2 w-2" strokeWidth={1.6} />
          </span>
          {kr.owner}
          <span className="text-charcoal-muted/50">·</span>
          <span>{kr.updatedAt}</span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[12.5px] tabular-nums">
          <span className="text-charcoal-muted">
            {formatValue(kr.start, kr.unit)}
          </span>
          <ArrowRight
            className="h-3 w-3 text-charcoal-muted"
            strokeWidth={1.6}
          />
          <span
            className="font-[480]"
            style={{ color: status.color }}
          >
            {formatValue(kr.current, kr.unit)}
          </span>
          <span className="text-charcoal-muted">/</span>
          <span className="text-charcoal-muted">
            {formatValue(kr.target, kr.unit)}
          </span>
        </div>
        <div className="mt-2 relative h-1 overflow-hidden rounded-pill bg-[rgba(28,28,28,0.06)]">
          <div
            className="absolute inset-y-0 left-0 rounded-pill"
            style={{
              width: `${pct}%`,
              backgroundColor: status.color,
            }}
          />
        </div>
        <p className="mt-1 text-[11px] tabular-nums text-charcoal-muted">
          {pct}%
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        {kr.linkedProject && (
          <button
            type="button"
            onClick={() => onNavigate(kr.linkedProject!.href)}
            title={kr.linkedProject.label}
            className="inline-flex max-w-full items-center gap-1 truncate rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-left text-[11.5px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
          >
            <Layers className="h-2.5 w-2.5 shrink-0" strokeWidth={1.6} />
            <span className="truncate">{kr.linkedProject.label}</span>
            <ArrowUpRight
              className="h-2.5 w-2.5 shrink-0 text-charcoal-muted"
              strokeWidth={1.8}
            />
          </button>
        )}
        {linkedBacklogs.length > 0 ? (
          <button
            type="button"
            onClick={() => onNavigate("#backlogs")}
            className="inline-flex max-w-full items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11.5px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
            title={linkedBacklogs.map((b) => b.title).join("\n")}
          >
            <GitBranch className="h-2.5 w-2.5 shrink-0" strokeWidth={1.6} />
            {linkedBacklogs.length} 백로그
            {executingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-blue-500/10 px-1.5 py-0 text-[10px] text-[#2563eb]">
                <CircleDot className="h-2 w-2" strokeWidth={1.8} />
                {executingCount} 실행 중
              </span>
            )}
          </button>
        ) : (
          <span className="inline-flex max-w-full items-center gap-1 text-[11.5px] text-charcoal-muted">
            <GitBranch className="h-2.5 w-2.5 shrink-0" strokeWidth={1.6} />
            연결된 백로그 없음
          </span>
        )}
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <span
          className="inline-flex items-center gap-1 text-[12px] font-[480]"
          style={{ color: status.color }}
        >
          <StatusIcon className="h-3 w-3" strokeWidth={1.8} />
          {status.label}
        </span>
      </div>
    </li>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: IconType;
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-[12.5px] text-charcoal-muted">
        <span
          className="grid h-7 w-7 place-items-center rounded-md border border-cream-light bg-cream"
          style={{ color: accent }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
        </span>
        {label}
      </div>
      <p
        className="mt-3 text-[24px] font-[600] tracking-[-0.5px] leading-[1]"
        style={{ color: accent }}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 truncate text-[12px] text-charcoal-muted">{hint}</p>
      )}
    </div>
  );
}

function computeKRProgress(kr: KeyResult): number {
  if (kr.target === kr.start) return kr.current >= kr.target ? 100 : 0;
  const ratio = (kr.current - kr.start) / (kr.target - kr.start);
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function computeObjectiveProgress(o: Objective): number {
  if (o.keyResults.length === 0) return 0;
  const sum = o.keyResults.reduce((acc, kr) => acc + computeKRProgress(kr), 0);
  return Math.round(sum / o.keyResults.length);
}

function computeOverall(objectives: Objective[]) {
  if (objectives.length === 0) return { avgProgress: 0 };
  const sum = objectives.reduce(
    (acc, o) => acc + computeObjectiveProgress(o),
    0
  );
  return { avgProgress: Math.round(sum / objectives.length) };
}

function formatValue(value: number, unit: string): string {
  if (unit === "ship") {
    return value >= 1 ? "Shipped" : "Not yet";
  }
  if (Number.isInteger(value)) return `${value}${unit}`;
  return `${value.toFixed(1)}${unit}`;
}
