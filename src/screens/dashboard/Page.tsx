import { useMemo, type ComponentType, type CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Briefcase,
  Bug,
  CheckCircle2,
  Circle,
  CircleDot,
  Crosshair,
  Flame,
  Gem,
  Globe2,
  Headphones,
  Lightbulb,
  Megaphone,
  Play,
  Radio,
  Repeat,
  Sparkles,
  User,
  Wrench,
  AlertCircle,
  Layers,
} from "lucide-react";
import type { NewIssueSeed } from "../../components/NewIssueModal";
import type {
  BacklogItem,
  BacklogPriority,
  BacklogStatus,
} from "../../lib/backlog";
import { cn } from "../../lib/cn";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

type SignalSource =
  | "cs"
  | "bug"
  | "internal"
  | "competitor"
  | "market"
  | "sales";

const SOURCE_META: Record<
  SignalSource,
  { label: string; short: string; color: string; icon: IconType }
> = {
  cs: { label: "Customer Support", short: "CS", color: "#2563eb", icon: Headphones },
  bug: { label: "Bug Report", short: "Bug", color: "#b8443a", icon: Bug },
  internal: { label: "Internal", short: "Internal", color: "#5f5f5d", icon: Lightbulb },
  competitor: { label: "Competitor", short: "Competitor", color: "#c89211", icon: Crosshair },
  market: { label: "Market", short: "Market", color: "#7c6cff", icon: Globe2 },
  sales: { label: "Sales", short: "Sales", color: "#1f8a4c", icon: Briefcase },
};

const PRIORITY_META: Record<BacklogPriority, { label: string; color: string }> = {
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

type HotSignal = {
  id: string;
  source: SignalSource;
  title: string;
  channel: string;
  timeAgo: string;
  hot?: boolean;
  detail: string;
};

const HOT_SIGNALS: HotSignal[] = [
  {
    id: "s-1",
    source: "cs",
    title: "Korean customers can't change subscription tier from Settings",
    channel: "Zendesk · 12 tickets",
    timeAgo: "방금 전",
    hot: true,
    detail:
      "결제 페이지 'Manage plan' 클릭 시 빈 화면. ko-KR 로케일, Stripe portal 호출 시 404.",
  },
  {
    id: "s-8",
    source: "internal",
    title: "/workflows p95 latency 1.8s로 급등 (Mon 09:14 이후)",
    channel: "Grafana · since Mon 09:14",
    timeAgo: "오늘 09:14",
    hot: true,
    detail:
      "deploy 0.241 이후 트리거 API p95 320ms → 1.8s. background job 큐 길이 동반 증가.",
  },
  {
    id: "s-4",
    source: "competitor",
    title: "Linear shipped 'Agents Marketplace' — overlaps our Q3 plan",
    channel: "Linear changelog · 2d ago",
    timeAgo: "어제",
    hot: true,
    detail:
      "Linear 0.32 릴리스에서 외부 에이전트 등록·과금 흐름 선공개. marketplace 프로젝트와 기능 범위 중복.",
  },
  {
    id: "s-2",
    source: "bug",
    title: "Mobile sign-up flow breaks on iOS 17.2 (Safari)",
    channel: "Sentry · production",
    timeAgo: "32분 전",
    detail:
      "OTP 입력 후 Continue 버튼 비활성. Sentry breadcrumb 상 input ref unmount 추정.",
  },
];

type ProjectCard = {
  href: string;
  title: string;
  status: "in_progress" | "pending" | "todo" | "done";
  done: number;
  active: number;
  total: number;
  leadAgent: string;
  currentPhase: string;
};

const PROJECTS: ProjectCard[] = [
  {
    href: "#proj-onboarding",
    title: "Onboarding flow v2",
    status: "in_progress",
    done: 6,
    active: 1,
    total: 16,
    leadAgent: "UXDesigner",
    currentPhase: "Components: Organisms",
  },
  {
    href: "#proj-pricing",
    title: "Pricing & billing rework",
    status: "pending",
    done: 3,
    active: 0,
    total: 12,
    leadAgent: "CTO",
    currentPhase: "Stripe Tax migration spec",
  },
  {
    href: "#proj-mobile",
    title: "Mobile app launch",
    status: "todo",
    done: 1,
    active: 0,
    total: 14,
    leadAgent: "Engineer",
    currentPhase: "Build pipeline setup",
  },
  {
    href: "#proj-health",
    title: "Customer health score",
    status: "done",
    done: 14,
    active: 0,
    total: 14,
    leadAgent: "CEO",
    currentPhase: "Released to all workspaces",
  },
  {
    href: "#proj-marketplace",
    title: "AI agent marketplace",
    status: "in_progress",
    done: 4,
    active: 2,
    total: 18,
    leadAgent: "CTO",
    currentPhase: "Discovery page · checkout flow",
  },
];

const PROJECT_STATUS_META: Record<
  ProjectCard["status"],
  { label: string; color: string }
> = {
  in_progress: { label: "In progress", color: "#2563eb" },
  pending: { label: "Pending", color: "#c89211" },
  todo: { label: "Todo", color: "rgba(28,28,28,0.4)" },
  done: { label: "Done", color: "#1f8a4c" },
};

type AgentState = {
  name: string;
  status: "executing" | "idle" | "blocked";
  doing: string;
  projectHref?: string;
};

const AGENT_STATES: AgentState[] = [
  {
    name: "CTO",
    status: "executing",
    doing: "/workflows p95 latency 회귀 조사",
    projectHref: "#proj-marketplace",
  },
  {
    name: "UXDesigner",
    status: "executing",
    doing: "Onboarding · Components: Organisms",
    projectHref: "#proj-onboarding",
  },
  {
    name: "CEO",
    status: "executing",
    doing: "Linear marketplace 갭 분석",
    projectHref: "#proj-marketplace",
  },
  {
    name: "Marketer",
    status: "idle",
    doing: "다음 routine 대기 — ICP keyword radar 48m 뒤",
  },
  {
    name: "Engineer",
    status: "blocked",
    doing: "AWS cost anomaly alert routine 실패",
  },
];

type RoutineRun = {
  name: string;
  agent: string;
  status: "success" | "failed" | "running";
  category: "market" | "ops" | "finance" | "compliance";
  whenAgo: string;
};

const ROUTINE_RUNS: RoutineRun[] = [
  {
    name: "ICP keyword radar",
    agent: "Marketer",
    status: "success",
    category: "market",
    whenAgo: "12분 전",
  },
  {
    name: "AWS cost anomaly alert",
    agent: "Engineer",
    status: "failed",
    category: "ops",
    whenAgo: "4시간 전",
  },
  {
    name: "Sentry error volume digest",
    agent: "Engineer",
    status: "success",
    category: "ops",
    whenAgo: "3시간 전",
  },
  {
    name: "Stripe failed payment recovery",
    agent: "CTO",
    status: "success",
    category: "finance",
    whenAgo: "5시간 전",
  },
];

const CATEGORY_COLOR: Record<RoutineRun["category"], string> = {
  market: "#7c6cff",
  ops: "#5f5f5d",
  finance: "#1f8a4c",
  compliance: "#c89211",
};

type Props = {
  backlogs: BacklogItem[];
  sampleData: boolean;
  firstAgent: string;
  onNavigate: (href: string) => void;
  onPlan: (seed: NewIssueSeed) => void;
  onExecute: (id: string) => void;
  onNewIssue: () => void;
  onLoadSamples: () => void;
};

export function Dashboard({
  backlogs,
  sampleData,
  firstAgent,
  onNavigate,
  onPlan,
  onExecute,
  onNewIssue,
  onLoadSamples,
}: Props) {
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
    []
  );

  const hotSignals = sampleData ? HOT_SIGNALS : [];
  const projects = sampleData ? PROJECTS : [];
  const agentStates = sampleData
    ? AGENT_STATES
    : firstAgent
    ? [
        {
          name: firstAgent,
          status: "idle" as const,
          doing: "첫 태스크를 들고 대기 중이에요.",
        },
      ]
    : [];
  const routineRuns = sampleData ? ROUTINE_RUNS : [];

  const hotCount = hotSignals.filter((s) => s.hot).length;
  const urgentBacklogs = backlogs.filter(
    (b) => b.priority === "urgent" && b.status !== "done"
  ).length;
  const executingBacklogs = backlogs.filter(
    (b) => b.status === "in_progress"
  ).length;
  const failedRoutines = routineRuns.filter((r) => r.status === "failed").length;
  const executingAgents = agentStates.filter(
    (a) => a.status === "executing"
  ).length;

  if (!sampleData) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <FreshDashboard
          today={today}
          backlogs={backlogs}
          firstAgent={firstAgent}
          onNavigate={onNavigate}
          onExecute={onExecute}
          onNewIssue={onNewIssue}
          onLoadSamples={onLoadSamples}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <Hero
        today={today}
        hotCount={hotCount}
        urgentBacklogs={urgentBacklogs}
        failedRoutines={failedRoutines}
        onNewIssue={onNewIssue}
      />

      <section data-zone="pulse" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <PulseCard
          icon={Radio}
          label="Hot signals"
          value={hotCount.toString()}
          hint={`${hotSignals.length} 신규 시그널 중`}
          accent="#b8443a"
          onClick={() => onNavigate("#signals")}
        />
        <PulseCard
          icon={Layers}
          label="Backlogs · Urgent"
          value={urgentBacklogs.toString()}
          hint={`${executingBacklogs} 실행 중`}
          accent="#c89211"
          onClick={() => onNavigate("#backlogs")}
        />
        <PulseCard
          icon={Repeat}
          label="Routines · 실패"
          value={failedRoutines.toString()}
          hint="지난 24h 실행 결과"
          accent={failedRoutines > 0 ? "#b8443a" : "#1f8a4c"}
          onClick={() => onNavigate("#routines")}
        />
        <PulseCard
          icon={Bot}
          label="Agents · 작업 중"
          value={`${executingAgents}/5`}
          hint="실시간 에이전트 상태"
          accent="#2563eb"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <HotSignalsCard
          signals={hotSignals}
          onPlan={onPlan}
          onAll={() => onNavigate("#signals")}
        />
        <AgentsCard agents={agentStates} onNavigate={onNavigate} />
      </section>

      <section className="mt-6">
        <ProjectsStrip projects={projects} onNavigate={onNavigate} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BacklogTriageCard
          backlogs={backlogs}
          onAll={() => onNavigate("#backlogs")}
          onNavigate={onNavigate}
          onExecute={onExecute}
        />
        <RoutinesDigestCard
          runs={routineRuns}
          onAll={() => onNavigate("#routines")}
        />
      </section>
    </div>
  );
}

function Hero({
  today,
  hotCount,
  urgentBacklogs,
  failedRoutines,
  onNewIssue,
}: {
  today: string;
  hotCount: number;
  urgentBacklogs: number;
  failedRoutines: number;
  onNewIssue: () => void;
}) {
  const pulse = [
    {
      count: hotCount,
      label: hotCount > 0 ? "hot signal 대기" : "hot signal 없음",
      tone: hotCount > 0 ? "text-[#b8443a]" : "text-charcoal-muted",
    },
    {
      count: urgentBacklogs,
      label: urgentBacklogs > 0 ? "urgent 백로그" : "urgent 백로그 없음",
      tone: urgentBacklogs > 0 ? "text-[#c89211]" : "text-charcoal-muted",
    },
    {
      count: failedRoutines,
      label: failedRoutines > 0 ? "routine 실패" : "routine 모두 정상",
      tone: failedRoutines > 0 ? "text-[#b8443a]" : "text-[#1f8a4c]",
    },
  ];

  return (
    <section data-zone="hero" className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
          {today}
        </p>
        <h2 className="mt-2 text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Dashboard
        </h2>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] leading-[1.5] text-charcoal-muted">
          {pulse.map((p, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className={cn("text-[15.5px] font-[600]", p.tone)}>
                {p.count}
              </span>
              <span>{p.label}</span>
              {i < pulse.length - 1 && (
                <span className="text-charcoal-muted/50">·</span>
              )}
            </span>
          ))}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          data-action="new-issue"
          onClick={onNewIssue}
          className="btn-primary h-9 px-3 text-[13.5px]"
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
          New Issue
        </button>
      </div>
    </section>
  );
}

function PulseCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  onClick,
}: {
  icon: IconType;
  label: string;
  value: string;
  hint: string;
  accent: string;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "card flex flex-col gap-3 p-4 text-left transition",
        onClick && "hover:bg-[rgba(28,28,28,0.025)]"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className="grid h-8 w-8 place-items-center rounded-md border border-cream-light bg-cream"
          style={{ color: accent }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </span>
        {onClick && (
          <ArrowUpRight
            className="h-3.5 w-3.5 text-charcoal-muted"
            strokeWidth={1.6}
          />
        )}
      </div>
      <div>
        <p className="text-[12.5px] text-charcoal-muted">{label}</p>
        <p
          className="mt-1 text-[28px] font-[600] tracking-[-0.5px] leading-[1]"
          style={{ color: accent }}
        >
          {value}
        </p>
        <p className="mt-1 text-[12px] text-charcoal-muted">{hint}</p>
      </div>
    </Wrapper>
  );
}

function HotSignalsCard({
  signals,
  onPlan,
  onAll,
}: {
  signals: HotSignal[];
  onPlan: (seed: NewIssueSeed) => void;
  onAll: () => void;
}) {
  return (
    <div data-zone="hot-signals" className="card overflow-hidden lg:col-span-2">
      <CardHeader
        title="Signals"
        hint="플래닝하면 Backlogs에 항목이 생깁니다"
        onAll={onAll}
        allLabel="All signals"
      />
      <ul className="divide-y divide-cream-light">
        {signals.map((s) => {
          const src = SOURCE_META[s.source];
          const Icon = src.icon;
          return (
            <li
              key={s.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-5 py-3.5 transition hover:bg-[rgba(28,28,28,0.025)]"
            >
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-cream-light bg-cream"
                style={{ color: src.color }}
                title={src.label}
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="rounded-pill px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.06em]"
                    style={{
                      color: src.color,
                      backgroundColor: `${src.color}14`,
                      border: `1px solid ${src.color}33`,
                    }}
                  >
                    {src.short}
                  </span>
                  {s.hot && (
                    <span className="inline-flex items-center gap-1 rounded-pill border border-[rgba(184,68,58,0.25)] bg-[rgba(184,68,58,0.08)] px-1.5 py-0.5 text-[10.5px] font-[480] text-[#b8443a]">
                      <Flame className="h-2.5 w-2.5" strokeWidth={1.8} />
                      Hot
                    </span>
                  )}
                  <span className="text-[12px] text-charcoal-muted">
                    {s.channel} · {s.timeAgo}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-[14px] font-[480] text-charcoal">
                  {s.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[12.5px] text-charcoal-muted">
                  {s.detail}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onPlan({
                    title: s.title,
                    description: `> Signal · ${src.label} · ${s.channel}\n\n${s.detail}`,
                    sourceLabel: `${src.short} signal`,
                  })
                }
                className="btn-primary h-8 shrink-0 self-center px-3 text-[12.5px]"
              >
                Plan
                <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AgentsCard({
  agents,
  onNavigate,
}: {
  agents: AgentState[];
  onNavigate: (href: string) => void;
}) {
  return (
    <div data-zone="agents" className="card overflow-hidden">
      <CardHeader title="Agents" hint="실시간 작업 상태" />
      <ul className="divide-y divide-cream-light">
        {agents.map((a) => {
          const Icon = AGENT_ICONS[a.name] ?? User;
          return (
            <li
              key={a.name}
              className="flex items-start gap-3 px-5 py-3 transition hover:bg-[rgba(28,28,28,0.025)]"
            >
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-pill border border-cream-light bg-cream">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13.5px] font-[480] text-charcoal">
                    {a.name}
                  </p>
                  <AgentStatusChip status={a.status} />
                </div>
                {a.projectHref ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(a.projectHref!)}
                    className="mt-0.5 line-clamp-1 text-left text-[12px] text-charcoal-muted underline-offset-2 hover:underline"
                  >
                    {a.doing}
                  </button>
                ) : (
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-charcoal-muted">
                    {a.doing}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AgentStatusChip({ status }: { status: AgentState["status"] }) {
  if (status === "executing") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[10.5px] font-[480] text-[#2563eb]">
        <span className="relative grid h-2 w-2 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/50" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500" />
        </span>
        Executing
      </span>
    );
  }
  if (status === "blocked") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-[rgba(184,68,58,0.25)] bg-[rgba(184,68,58,0.08)] px-1.5 py-0.5 text-[10.5px] font-[480] text-[#b8443a]">
        <AlertCircle className="h-2.5 w-2.5" strokeWidth={1.8} />
        Blocked
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] font-[480] text-charcoal-muted">
      <Circle className="h-2.5 w-2.5" strokeWidth={1.8} />
      Idle
    </span>
  );
}

function ProjectsStrip({
  projects,
  onNavigate,
}: {
  projects: ProjectCard[];
  onNavigate: (href: string) => void;
}) {
  return (
    <div data-zone="projects" className="card overflow-hidden">
      <CardHeader
        title="Projects"
        hint="각 카드를 누르면 단계별 산출물로 이동합니다"
      />
      <div className="grid grid-cols-1 gap-[1px] bg-cream-light sm:grid-cols-2 lg:grid-cols-5">
        {projects.map((p) => (
          <ProjectMiniCard key={p.href} project={p} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function ProjectMiniCard({
  project,
  onNavigate,
}: {
  project: ProjectCard;
  onNavigate: (href: string) => void;
}) {
  const status = PROJECT_STATUS_META[project.status];
  const donePct = (project.done / project.total) * 100;
  const activePct = (project.active / project.total) * 100;
  const Agent = AGENT_ICONS[project.leadAgent] ?? User;

  return (
    <button
      type="button"
      onClick={() => onNavigate(project.href)}
      className="group flex flex-col gap-3 bg-cream p-4 text-left transition hover:bg-[rgba(28,28,28,0.025)]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11px] text-charcoal">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          {status.label}
        </span>
        <ArrowUpRight
          className="h-3.5 w-3.5 text-charcoal-muted opacity-0 transition group-hover:opacity-100"
          strokeWidth={1.6}
        />
      </div>
      <div className="min-h-[40px]">
        <p className="line-clamp-2 text-[14px] font-[480] leading-[1.35] text-charcoal">
          {project.title}
        </p>
      </div>
      <div>
        <div className="relative h-1.5 overflow-hidden rounded-pill bg-[rgba(28,28,28,0.06)]">
          <div
            className="absolute inset-y-0 left-0 bg-charcoal/85"
            style={{ width: `${donePct}%` }}
          />
          <div
            className="absolute inset-y-0 bg-charcoal/35"
            style={{
              left: `${donePct}%`,
              width: `${activePct}%`,
            }}
          />
        </div>
        <p className="mt-1.5 text-[11.5px] tabular-nums text-charcoal-muted">
          {project.done + project.active}/{project.total} phases
        </p>
      </div>
      <div className="flex items-center gap-1.5 border-t border-cream-light pt-2.5 text-[12px] text-charcoal-muted">
        <span className="grid h-4 w-4 place-items-center rounded-pill border border-cream-light bg-cream text-charcoal">
          <Agent className="h-2.5 w-2.5" strokeWidth={1.6} />
        </span>
        <span className="truncate" title={project.currentPhase}>
          {project.currentPhase}
        </span>
      </div>
    </button>
  );
}

function BacklogTriageCard({
  backlogs,
  onAll,
  onNavigate,
  onExecute,
}: {
  backlogs: BacklogItem[];
  onAll: () => void;
  onNavigate: (href: string) => void;
  onExecute: (id: string) => void;
}) {
  const visible = useMemo(() => {
    const statusWeight: Record<BacklogStatus, number> = {
      in_progress: 0,
      todo: 1,
      pending: 2,
      done: 3,
    };
    const priorityWeight: Record<BacklogPriority, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
      none: 4,
    };
    return [...backlogs]
      .filter((b) => b.status !== "done")
      .sort((a, b) => {
        const s = statusWeight[a.status] - statusWeight[b.status];
        if (s !== 0) return s;
        const p = priorityWeight[a.priority] - priorityWeight[b.priority];
        if (p !== 0) return p;
        return b.createdAt - a.createdAt;
      })
      .slice(0, 4);
  }, [backlogs]);

  return (
    <div data-zone="backlogs" className="card overflow-hidden lg:col-span-2">
      <CardHeader
        title="Backlogs"
        hint="Executing · Urgent · High 순"
        onAll={onAll}
        allLabel="All backlogs"
      />
      {visible.length === 0 ? (
        <div className="grid h-32 place-items-center text-[13px] text-charcoal-muted">
          처리할 백로그가 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-cream-light">
          {visible.map((b) => (
            <BacklogRow
              key={b.id}
              item={b}
              onNavigate={onNavigate}
              onExecute={onExecute}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function BacklogRow({
  item,
  onNavigate,
  onExecute,
}: {
  item: BacklogItem;
  onNavigate: (href: string) => void;
  onExecute: (id: string) => void;
}) {
  const priority = PRIORITY_META[item.priority];
  const AgentIcon = (item.agent && AGENT_ICONS[item.agent]) || User;
  const isExecuting = item.status === "in_progress";

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 transition hover:bg-[rgba(28,28,28,0.025)]">
      <span className="grid h-5 w-5 place-items-center">
        {isExecuting ? (
          <CircleDot className="h-4 w-4 text-[#2563eb]" strokeWidth={1.8} />
        ) : (
          <Circle className="h-4 w-4 text-charcoal-muted" strokeWidth={1.8} />
        )}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 text-[11.5px]"
            style={{ color: priority.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: priority.color }}
            />
            {priority.label}
          </span>
          {item.project && item.projectHref && (
            <>
              <span className="text-charcoal-muted/50">·</span>
              <button
                type="button"
                onClick={() => onNavigate(item.projectHref!)}
                className="text-[11.5px] text-charcoal-muted underline-offset-2 hover:underline"
                title={item.project}
              >
                {item.project}
              </button>
            </>
          )}
          {item.agent && (
            <>
              <span className="text-charcoal-muted/50">·</span>
              <span className="inline-flex items-center gap-1 text-[11.5px] text-charcoal-muted">
                <span className="grid h-3.5 w-3.5 place-items-center rounded-pill border border-cream-light bg-cream text-charcoal">
                  <AgentIcon className="h-2 w-2" strokeWidth={1.6} />
                </span>
                {item.agent}
              </span>
            </>
          )}
        </div>
        <p className="mt-0.5 truncate text-[13.5px] font-[480] text-charcoal">
          {item.title}
        </p>
      </div>
      <div className="flex shrink-0 justify-end">
        {isExecuting ? (
          <button
            type="button"
            onClick={() => item.projectHref && onNavigate(item.projectHref)}
            className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-blue-500/30 bg-blue-500/10 px-3 text-[12px] text-[#2563eb] transition hover:bg-blue-500/15"
          >
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/50" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500" />
            </span>
            View
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onExecute(item.id)}
            className="btn-primary h-8 px-3 text-[12px]"
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

function RoutinesDigestCard({
  runs,
  onAll,
}: {
  runs: RoutineRun[];
  onAll: () => void;
}) {
  return (
    <div data-zone="routines" className="card overflow-hidden">
      <CardHeader
        title="Routines · 24h"
        hint="자동 실행 결과"
        onAll={onAll}
        allLabel="All routines"
      />
      <ul className="divide-y divide-cream-light">
        {runs.map((r) => {
          const color = CATEGORY_COLOR[r.category];
          const AgentIcon = AGENT_ICONS[r.agent] ?? User;
          return (
            <li
              key={r.name}
              className="flex items-start gap-3 px-5 py-3 transition hover:bg-[rgba(28,28,28,0.025)]"
            >
              <span
                className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13.5px] font-[480] text-charcoal">
                    {r.name}
                  </p>
                  <RoutineStatusChip status={r.status} />
                </div>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-[11.5px] text-charcoal-muted">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-pill border border-cream-light bg-cream text-charcoal">
                    <AgentIcon className="h-2 w-2" strokeWidth={1.6} />
                  </span>
                  {r.agent}
                  <span className="text-charcoal-muted/50">·</span>
                  <span>{r.whenAgo}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RoutineStatusChip({ status }: { status: RoutineRun["status"] }) {
  if (status === "success") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#1f8a4c]">
        <CheckCircle2 className="h-3 w-3" strokeWidth={1.8} />
        Success
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#b8443a]">
        <AlertCircle className="h-3 w-3" strokeWidth={1.8} />
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#2563eb]">
      <span className="relative grid h-2 w-2 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/50" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500" />
      </span>
      Running
    </span>
  );
}

function CardHeader({
  title,
  hint,
  onAll,
  allLabel,
}: {
  title: string;
  hint?: string;
  onAll?: () => void;
  allLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-cream-light px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-[14px] font-[480] text-charcoal">{title}</p>
        {hint && (
          <p className="mt-0.5 truncate text-[12px] text-charcoal-muted">
            {hint}
          </p>
        )}
      </div>
      {onAll && (
        <button
          type="button"
          onClick={onAll}
          className="inline-flex shrink-0 items-center gap-1 text-[12.5px] text-charcoal-muted underline-offset-4 hover:underline"
        >
          {allLabel ?? "View all"}
          <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

function FreshDashboard({
  today,
  backlogs,
  firstAgent,
  onNavigate,
  onExecute,
  onNewIssue,
  onLoadSamples,
}: {
  today: string;
  backlogs: BacklogItem[];
  firstAgent: string;
  onNavigate: (href: string) => void;
  onExecute: (id: string) => void;
  onNewIssue: () => void;
  onLoadSamples: () => void;
}) {
  const firstTask = backlogs.find((b) => b.status !== "done");
  const AgentIcon =
    (firstAgent && AGENT_ICONS[firstAgent]) || User;

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
            {today}
          </p>
          <h2 className="mt-2 text-sub font-[600] tracking-[-0.9px] text-charcoal">
            첫 출근, 환영합니다.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.55] text-charcoal-muted">
            워크스페이스는 방금 막 시작됐어요. 오늘은 작게 시작해도 충분합니다 —
            첫 태스크부터 굴려보거나, 새 일감을 추가해보세요.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewIssue}
          className="btn-primary h-9 px-3 text-[13.5px]"
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
          New Issue
        </button>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card overflow-hidden p-6 lg:col-span-2">
          <p className="text-[12px] uppercase tracking-[0.08em] text-charcoal-muted">
            오늘의 첫 태스크
          </p>
          {firstTask ? (
            <>
              <h3 className="mt-3 text-[22px] font-[600] tracking-[-0.5px] leading-[1.25] text-charcoal">
                {firstTask.title}
              </h3>
              {firstTask.description && (
                <p className="mt-2 line-clamp-2 text-[13.5px] leading-[1.55] text-charcoal-muted">
                  {firstTask.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-charcoal-muted">
                {firstTask.agent && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="grid h-4 w-4 place-items-center rounded-pill border border-cream-light bg-cream text-charcoal">
                      <AgentIcon className="h-2.5 w-2.5" strokeWidth={1.6} />
                    </span>
                    {firstTask.agent}
                  </span>
                )}
                <span className="text-charcoal-muted/50">·</span>
                <span>High priority</span>
                <span className="text-charcoal-muted/50">·</span>
                <span>Onboarding 시작 항목</span>
              </div>
              <div className="mt-6 flex items-center gap-2">
                {firstTask.status === "in_progress" ? (
                  <button
                    type="button"
                    onClick={() => onNavigate("#backlogs")}
                    className="inline-flex h-9 items-center gap-1.5 rounded-pill border border-blue-500/30 bg-blue-500/10 px-3 text-[13px] text-[#2563eb]"
                  >
                    <span className="relative grid h-2 w-2 place-items-center">
                      <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/50" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500" />
                    </span>
                    실행 중 · Backlogs에서 보기
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onExecute(firstTask.id)}
                    className="btn-primary h-9 px-3 text-[13.5px]"
                  >
                    <Play className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Execute
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate("#backlogs")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-cream-light bg-cream px-3 text-[13.5px] text-charcoal transition hover:bg-[rgba(28,28,28,0.04)]"
                >
                  Backlog 전체 보기
                  <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
                </button>
              </div>
            </>
          ) : (
            <div className="mt-4">
              <h3 className="text-[20px] font-[600] tracking-[-0.4px] text-charcoal">
                아직 일감이 없어요
              </h3>
              <p className="mt-2 text-[13.5px] text-charcoal-muted">
                작은 한 줄짜리 메모도 좋아요. 첫 항목을 만들어보세요.
              </p>
              <button
                type="button"
                onClick={onNewIssue}
                className="btn-primary mt-4 h-9 px-3 text-[13.5px]"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                New Issue
              </button>
            </div>
          )}
        </div>

        <div className="card overflow-hidden p-6">
          <p className="text-[12px] uppercase tracking-[0.08em] text-charcoal-muted">
            워크스페이스 둘러보기
          </p>
          <ul className="mt-4 flex flex-col gap-2.5">
            <ExploreLink
              label="Goals"
              hint="비전 · 미션을 적어두세요"
              onClick={() => onNavigate("#goals")}
            />
            <ExploreLink
              label="OKRs"
              hint="분기 목표를 정의하세요"
              onClick={() => onNavigate("#okrs")}
            />
            <ExploreLink
              label="Signals"
              hint="외부 신호를 연결해보세요"
              onClick={() => onNavigate("#signals")}
            />
            <ExploreLink
              label="Routines"
              hint="반복 작업을 cron으로"
              onClick={() => onNavigate("#routines")}
            />
          </ul>
          <button
            type="button"
            onClick={onLoadSamples}
            className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] text-charcoal-muted underline-offset-4 transition hover:text-charcoal hover:underline"
          >
            <Sparkles className="h-3 w-3" strokeWidth={1.8} />
            샘플 워크스페이스로 둘러보기
          </button>
        </div>
      </section>
    </>
  );
}

function ExploreLink({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center justify-between rounded-md border border-cream-light bg-cream px-3 py-2 text-left transition hover:bg-[rgba(28,28,28,0.04)]"
      >
        <div className="min-w-0">
          <p className="text-[13.5px] font-[480] text-charcoal">{label}</p>
          <p className="truncate text-[11.5px] text-charcoal-muted">{hint}</p>
        </div>
        <ArrowRight
          className="h-3.5 w-3.5 text-charcoal-muted transition-transform group-hover:translate-x-1"
          strokeWidth={1.8}
        />
      </button>
    </li>
  );
}
