import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  Coins,
  FileText,
  Gavel,
  Mail,
  MessageSquare,
  Minus,
  MoreHorizontal,
  PenLine,
  Plane,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { PersonAvatar } from "../components/PersonAvatar";
import { cn } from "../lib/cn";
import { AGENT_STATUS_CONFIG, AGENT_STATUSES, type AgentName } from "../lib/agents";
import type { BacklogItem } from "../lib/backlog";
import {
  PEOPLE,
  PERSON_DIRECT_WORK,
  PERSON_MEETINGS,
  PERSON_OKRS,
  PERSON_PTO,
  PERSON_STATUS_CONFIG,
  type Person,
  type PersonDirectWork,
  type PersonId,
  type PersonOkr,
} from "../lib/people";

const AGENT_HREF: Record<AgentName, string> = {
  CEO: "#ceo",
  CTO: "#cto",
  UXDesigner: "#ux",
  Marketer: "#marketer",
  Engineer: "#engineer",
};

const AGENT_PITCH: Record<AgentName, string> = {
  CEO: "전략 · 우선순위",
  CTO: "아키텍처 · 리뷰",
  UXDesigner: "디자인 · 스펙",
  Marketer: "포지셔닝 · 캠페인",
  Engineer: "구현 · 출시",
};

type AgentRuntime = {
  currentTask: string;
  queue: number;
  throughput7d: number;
  successRate: number;
  overrides7d: number;
  lastActive: string;
  runs30d: number;
  tokensIn30d: string;
  tokensOut30d: string;
  costMtd: number;
  costProjected: number;
  costLastMonth: number;
};

const AGENT_RUNTIME: Record<AgentName, AgentRuntime> = {
  CEO: {
    currentTask: "Q3 narrative draft 검토 중",
    queue: 3,
    throughput7d: 12,
    successRate: 96,
    overrides7d: 1,
    lastActive: "2m",
    runs30d: 48,
    tokensIn30d: "1.2M",
    tokensOut30d: "320K",
    costMtd: 96,
    costProjected: 180,
    costLastMonth: 165,
  },
  CTO: {
    currentTask: "ADR-042 review",
    queue: 5,
    throughput7d: 28,
    successRate: 92,
    overrides7d: 3,
    lastActive: "12m",
    runs30d: 112,
    tokensIn30d: "3.6M",
    tokensOut30d: "880K",
    costMtd: 168,
    costProjected: 310,
    costLastMonth: 285,
  },
  UXDesigner: {
    currentTask: "Onboarding step 2 audit",
    queue: 2,
    throughput7d: 9,
    successRate: 100,
    overrides7d: 0,
    lastActive: "27m",
    runs30d: 34,
    tokensIn30d: "0.8M",
    tokensOut30d: "210K",
    costMtd: 72,
    costProjected: 135,
    costLastMonth: 120,
  },
  Marketer: {
    currentTask: "Idle — 대기 중",
    queue: 0,
    throughput7d: 14,
    successRate: 89,
    overrides7d: 4,
    lastActive: "3h",
    runs30d: 56,
    tokensIn30d: "1.4M",
    tokensOut30d: "510K",
    costMtd: 132,
    costProjected: 245,
    costLastMonth: 198,
  },
  Engineer: {
    currentTask: "Blocked: ADR-042 대기",
    queue: 11,
    throughput7d: 38,
    successRate: 84,
    overrides7d: 7,
    lastActive: "1h",
    runs30d: 168,
    tokensIn30d: "5.8M",
    tokensOut30d: "1.4M",
    costMtd: 264,
    costProjected: 490,
    costLastMonth: 412,
  },
};

const formatUsd = (n: number) => `$${n.toLocaleString("en-US")}`;

type TabId = "overview" | "pool" | "direct" | "goals" | "human";

type Props = {
  personId: PersonId;
  backlogs: BacklogItem[];
  onNavigate: (href: string) => void;
};

export function PersonDetail({ personId, backlogs, onNavigate }: Props) {
  const person = PEOPLE[personId];
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const ownedBacklogs = useMemo(
    () =>
      backlogs.filter(
        (b) =>
          b.agent &&
          (b.agent === person.name ||
            b.agent === person.role ||
            b.agent === person.role.toLowerCase())
      ),
    [backlogs, person]
  );

  const directWork = PERSON_DIRECT_WORK[person.id];
  const okrs = PERSON_OKRS[person.id];
  const meetings = PERSON_MEETINGS[person.id];

  const totalCostMtd = person.agents.reduce(
    (sum, a) => sum + AGENT_RUNTIME[a].costMtd,
    0
  );
  const totalCostProjected = person.agents.reduce(
    (sum, a) => sum + AGENT_RUNTIME[a].costProjected,
    0
  );
  const totalCostLastMonth = person.agents.reduce(
    (sum, a) => sum + AGENT_RUNTIME[a].costLastMonth,
    0
  );

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "pool", label: "Pool & Costs", count: person.agents.length },
    { id: "direct", label: "Direct Work", count: directWork.length + ownedBacklogs.length },
    { id: "goals", label: "Goals", count: okrs.length },
    { id: "human", label: "Human" },
  ];

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
      <Breadcrumb person={person} />
      <Header person={person} />
      <KpiStrip
        person={person}
        directWorkCount={directWork.length + ownedBacklogs.length}
        meetingCount={meetings.length}
        krAvg={Math.round(okrs.reduce((s, o) => s + o.progress, 0) / Math.max(1, okrs.length))}
        totalCostMtd={totalCostMtd}
      />
      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === "overview" && (
          <OverviewTab person={person} onNavigate={onNavigate} directWork={directWork.slice(0, 4)} />
        )}
        {activeTab === "pool" && (
          <PoolCostsTab
            person={person}
            onNavigate={onNavigate}
            totalCostMtd={totalCostMtd}
            totalCostProjected={totalCostProjected}
            totalCostLastMonth={totalCostLastMonth}
          />
        )}
        {activeTab === "direct" && <DirectWorkTab directWork={directWork} />}
        {activeTab === "goals" && <GoalsTab okrs={okrs} />}
        {activeTab === "human" && <HumanTab person={person} meetings={meetings} />}
      </div>
    </div>
  );
}

function Breadcrumb({ person }: { person: Person }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12.5px] text-charcoal-muted">
      <a
        href="#dashboard"
        className="rounded px-1 py-0.5 hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
      >
        Workspace
      </a>
      <ChevronRight className="h-3 w-3" strokeWidth={1.6} />
      <span className="rounded px-1 py-0.5">Workforces</span>
      <ChevronRight className="h-3 w-3" strokeWidth={1.6} />
      <span className="text-charcoal">{person.name}</span>
    </nav>
  );
}

function Header({ person }: { person: Person }) {
  const statusCfg = PERSON_STATUS_CONFIG[person.status];
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-4">
        <PersonAvatar seed={person.name} size="xl" />
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-section font-[600] tracking-[-0.8px] text-charcoal">
              {person.name}
            </h1>
            <span className="inline-flex items-center rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[12px] font-[480] text-charcoal-muted">
              {person.role}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-[12px] font-[480]"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: statusCfg.color }}
              />
              {statusCfg.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-charcoal-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.6} />
              {person.localTime} · {person.timezone}
            </span>
            <span className="text-charcoal/20">·</span>
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.6} />
              {person.email}
            </span>
            <span className="text-charcoal/20">·</span>
            <span>Since {person.joined}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-md border border-cream-light bg-cream px-3 py-1.5 text-[13px] text-charcoal hover:bg-[rgba(28,28,28,0.04)]">
          <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.6} />
          Message
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-cream-light bg-cream px-3 py-1.5 text-[13px] text-charcoal hover:bg-[rgba(28,28,28,0.04)]">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.6} />
          Schedule 1:1
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-charcoal px-3 py-1.5 text-[13px] text-charcoal-offwhite hover:bg-charcoal/90">
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          Assign work
        </button>
      </div>
    </div>
  );
}

function KpiStrip({
  person,
  directWorkCount,
  meetingCount,
  krAvg,
  totalCostMtd,
}: {
  person: Person;
  directWorkCount: number;
  meetingCount: number;
  krAvg: number;
  totalCostMtd: number;
}) {
  const kpis = [
    { label: "Owned KR avg", value: `${krAvg}%`, hint: "Q3 progress" },
    { label: "My direct work", value: `${directWorkCount}`, hint: "Open items" },
    {
      label: "Agents in pool",
      value: `${person.agents.length}`,
      hint: person.agents.length > 0 ? "Active" : "Empty pool",
    },
    {
      label: "Agent spend · MTD",
      value: formatUsd(totalCostMtd),
      hint: `${meetingCount} meetings this wk`,
    },
  ];
  return (
    <div className="card grid grid-cols-2 gap-[1px] overflow-hidden bg-cream-light sm:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className="bg-cream p-4">
          <p className="text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
            {k.label}
          </p>
          <p className="mt-1 text-[24px] font-[600] tracking-[-0.4px] text-charcoal">
            {k.value}
          </p>
          <p className="mt-0.5 text-[12px] text-charcoal-muted">{k.hint}</p>
        </div>
      ))}
    </div>
  );
}

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: TabId; label: string; count?: number }[];
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div className="border-b border-cream-light">
      <nav
        role="tablist"
        aria-label="Person sections"
        className="-mb-px flex flex-wrap items-center gap-x-1 gap-y-1 overflow-x-auto"
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(t.id)}
              className={cn(
                "group relative inline-flex items-center gap-1.5 px-3 py-2.5 text-[13.5px] transition",
                isActive ? "text-charcoal" : "text-charcoal/60 hover:text-charcoal"
              )}
            >
              <span>{t.label}</span>
              {typeof t.count === "number" && (
                <span
                  className={cn(
                    "inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-pill px-1.5 text-[11px] font-[480] transition",
                    isActive
                      ? "bg-charcoal text-charcoal-offwhite shadow-inset-dark"
                      : "border border-cream-light bg-cream text-charcoal-muted"
                  )}
                >
                  {t.count}
                </span>
              )}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-2 -bottom-px h-[2px] rounded-pill transition-opacity",
                  isActive
                    ? "bg-charcoal opacity-100"
                    : "bg-charcoal opacity-0 group-hover:opacity-20"
                )}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function SectionHeader({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[18px] font-[600] tracking-[-0.3px] text-charcoal">{title}</h2>
        {hint && <p className="text-[13px] text-charcoal-muted">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

// ─── Overview ───────────────────────────────────────────────

function OverviewTab({
  person,
  onNavigate,
  directWork,
}: {
  person: Person;
  onNavigate: (href: string) => void;
  directWork: PersonDirectWork[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <AgentPoolHero person={person} onNavigate={onNavigate} />

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="My Direct Work — recent"
          hint="에이전트에 위임하지 않고 본인이 들고 있는 일 (최근 4건)"
        />
        {directWork.length === 0 ? (
          <div className="card grid h-24 place-items-center text-[13px] text-charcoal-muted">
            지금 직접 들고 있는 작업이 없습니다
          </div>
        ) : (
          <div className="card overflow-hidden">
            <ul className="divide-y divide-cream-light">
              {directWork.map((w) => (
                <DirectWorkRow key={w.id} work={w} />
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function AgentPoolHero({
  person,
  onNavigate,
}: {
  person: Person;
  onNavigate: (href: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Agent Pool"
        hint={`${person.name}만 일을 시킬 수 있는 에이전트`}
        right={
          <button className="inline-flex items-center gap-1.5 rounded-md border border-cream-light bg-cream px-2.5 py-1 text-[12.5px] text-charcoal hover:bg-[rgba(28,28,28,0.04)]">
            <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
            Claim agent
          </button>
        }
      />
      {person.agents.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center">
          <p className="text-[14px] text-charcoal">아직 점유한 에이전트가 없습니다</p>
          <p className="max-w-md text-[13px] text-charcoal-muted">
            Claim하면 {person.name}을 통해서만 그 에이전트에 일을 시킬 수 있게 됩니다.
            같은 에이전트를 두 사람이 동시에 점유할 수는 없어요.
          </p>
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-charcoal px-3 py-1.5 text-[13px] text-charcoal-offwhite hover:bg-charcoal/90">
            <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
            Claim first agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {person.agents.map((a) => (
            <AgentPoolCard key={a} agent={a} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </section>
  );
}

function AgentPoolCard({
  agent,
  onNavigate,
}: {
  agent: AgentName;
  onNavigate: (href: string) => void;
}) {
  const status = AGENT_STATUSES[agent];
  const statusCfg = AGENT_STATUS_CONFIG[status];
  const rt = AGENT_RUNTIME[agent];
  return (
    <button
      onClick={() => onNavigate(AGENT_HREF[agent])}
      className="card group flex flex-col gap-3 p-4 text-left transition hover:border-charcoal/15"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-cream-light text-charcoal">
            <span className="text-[12px] font-[600]">{agent.slice(0, 2).toUpperCase()}</span>
          </span>
          <div>
            <p className="text-[14px] font-[480] text-charcoal">{agent}</p>
            <p className="text-[12px] text-charcoal-muted">{AGENT_PITCH[agent]}</p>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-[11.5px]"
          style={{ backgroundColor: `${statusCfg.color}1a`, color: statusCfg.color }}
        >
          {statusCfg.pulse ? (
            <span className="relative grid h-1.5 w-1.5 place-items-center">
              <span
                className="absolute inset-0 animate-ping rounded-full opacity-60"
                style={{ backgroundColor: statusCfg.color }}
              />
              <span
                className="relative h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: statusCfg.color }}
              />
            </span>
          ) : (
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: statusCfg.color }}
            />
          )}
          {statusCfg.label}
        </span>
      </div>
      <p className="line-clamp-1 text-[13px] text-charcoal-muted">
        지금 · <span className="text-charcoal">{rt.currentTask}</span>
      </p>
      <div className="grid grid-cols-3 gap-2 border-t border-cream-light pt-3 text-[12px]">
        <Stat label="Queue" value={`${rt.queue}`} />
        <Stat label="7d throughput" value={`${rt.throughput7d}`} />
        <Stat label="MTD cost" value={formatUsd(rt.costMtd)} />
      </div>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.06em] text-charcoal-muted">
        {label}
      </p>
      <p className="text-[14px] font-[480] text-charcoal">{value}</p>
    </div>
  );
}

// ─── Pool & Costs ──────────────────────────────────────────

function PoolCostsTab({
  person,
  onNavigate,
  totalCostMtd,
  totalCostProjected,
  totalCostLastMonth,
}: {
  person: Person;
  onNavigate: (href: string) => void;
  totalCostMtd: number;
  totalCostProjected: number;
  totalCostLastMonth: number;
}) {
  const delta = totalCostProjected - totalCostLastMonth;
  const deltaPct = totalCostLastMonth
    ? Math.round((delta / totalCostLastMonth) * 100)
    : 0;
  const trend = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#b8443a" : trend === "down" ? "#1f8a4c" : "#8a8a87";

  const maxAgentCost = person.agents.length
    ? Math.max(...person.agents.map((a) => AGENT_RUNTIME[a].costProjected))
    : 0;

  if (person.agents.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-[14px] text-charcoal">점유 중인 에이전트가 없습니다</p>
        <p className="max-w-md text-[13px] text-charcoal-muted">
          에이전트를 claim하면 이 사람을 통해 일을 시킬 수 있고, 그 사용량과 비용이 여기에 합산됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cost hero */}
      <section className="card overflow-hidden">
        <div className="grid grid-cols-1 gap-[1px] bg-cream-light sm:grid-cols-4">
          <CostHeroTile
            icon={Users}
            label="Agents in pool"
            value={`${person.agents.length}`}
            hint={`${person.agents.join(" · ")}`}
            accent="#5f5f5d"
          />
          <CostHeroTile
            icon={Wallet}
            label="This month · so far"
            value={formatUsd(totalCostMtd)}
            hint="MTD 합계"
            accent="#2563eb"
          />
          <CostHeroTile
            icon={Coins}
            label="Projected month"
            value={formatUsd(totalCostProjected)}
            hint="현재 페이스 기준"
            accent="#c89211"
          />
          <CostHeroTile
            icon={TrendIcon}
            label="vs last month"
            value={`${delta >= 0 ? "+" : ""}${deltaPct}%`}
            hint={`Last: ${formatUsd(totalCostLastMonth)}`}
            accent={trendColor}
          />
        </div>
      </section>

      {/* Per-agent cost breakdown bar */}
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Cost breakdown"
          hint="에이전트별 이번 달 예상 비용 점유율"
        />
        <div className="card flex flex-col divide-y divide-cream-light">
          {person.agents.map((a) => {
            const rt = AGENT_RUNTIME[a];
            const widthPct = maxAgentCost
              ? Math.max(6, Math.round((rt.costProjected / maxAgentCost) * 100))
              : 0;
            const sharePct = totalCostProjected
              ? Math.round((rt.costProjected / totalCostProjected) * 100)
              : 0;
            return (
              <div key={a} className="flex items-center gap-4 px-4 py-3">
                <span className="w-24 shrink-0 text-[13.5px] text-charcoal">{a}</span>
                <div className="min-w-0 flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-pill bg-cream-light">
                    <div
                      className="h-full rounded-pill bg-charcoal/80"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
                <span className="w-16 shrink-0 text-right text-[12px] text-charcoal-muted">
                  {sharePct}%
                </span>
                <span className="w-20 shrink-0 text-right text-[14px] font-[480] text-charcoal">
                  {formatUsd(rt.costProjected)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-agent detailed table */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Per-agent detail" hint="요금과 사용량 합산" />
        <div className="card overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-cream-light/40 text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              <tr>
                <th className="px-4 py-2 text-left font-[480]">Agent</th>
                <th className="px-4 py-2 text-right font-[480]">Runs · 30d</th>
                <th className="px-4 py-2 text-right font-[480]">Tokens in</th>
                <th className="px-4 py-2 text-right font-[480]">Tokens out</th>
                <th className="px-4 py-2 text-right font-[480]">MTD</th>
                <th className="px-4 py-2 text-right font-[480]">Projected</th>
                <th className="px-4 py-2 text-right font-[480]">Last month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-light">
              {person.agents.map((a) => {
                const rt = AGENT_RUNTIME[a];
                const status = AGENT_STATUSES[a];
                const statusCfg = AGENT_STATUS_CONFIG[status];
                return (
                  <tr
                    key={a}
                    className="cursor-pointer transition hover:bg-[rgba(28,28,28,0.02)]"
                    onClick={() => onNavigate(AGENT_HREF[a])}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: statusCfg.color }}
                        />
                        <span className="text-charcoal">{a}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-charcoal">{rt.runs30d}</td>
                    <td className="px-4 py-2.5 text-right text-charcoal-muted">
                      {rt.tokensIn30d}
                    </td>
                    <td className="px-4 py-2.5 text-right text-charcoal-muted">
                      {rt.tokensOut30d}
                    </td>
                    <td className="px-4 py-2.5 text-right text-charcoal">
                      {formatUsd(rt.costMtd)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-[480] text-charcoal">
                      {formatUsd(rt.costProjected)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-charcoal-muted">
                      {formatUsd(rt.costLastMonth)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-cream-light/30 font-[480]">
                <td className="px-4 py-2.5 text-charcoal">Total</td>
                <td className="px-4 py-2.5 text-right text-charcoal">
                  {person.agents.reduce((s, a) => s + AGENT_RUNTIME[a].runs30d, 0)}
                </td>
                <td className="px-4 py-2.5" />
                <td className="px-4 py-2.5" />
                <td className="px-4 py-2.5 text-right text-charcoal">
                  {formatUsd(totalCostMtd)}
                </td>
                <td className="px-4 py-2.5 text-right text-charcoal">
                  {formatUsd(totalCostProjected)}
                </td>
                <td className="px-4 py-2.5 text-right text-charcoal-muted">
                  {formatUsd(totalCostLastMonth)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Per-agent status footer */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Operational view" hint="지금 풀에서 무슨 일이 일어나고 있는가" />
        <div className="card overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-cream-light/40 text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              <tr>
                <th className="px-4 py-2 text-left font-[480]">Agent</th>
                <th className="px-4 py-2 text-left font-[480]">Current task</th>
                <th className="px-4 py-2 text-right font-[480]">Queue</th>
                <th className="px-4 py-2 text-right font-[480]">7d throughput</th>
                <th className="px-4 py-2 text-right font-[480]">Success</th>
                <th className="px-4 py-2 text-right font-[480]">Overrides</th>
                <th className="px-4 py-2 text-right font-[480]">Last</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-light">
              {person.agents.map((a) => {
                const rt = AGENT_RUNTIME[a];
                return (
                  <tr
                    key={a}
                    className="cursor-pointer transition hover:bg-[rgba(28,28,28,0.02)]"
                    onClick={() => onNavigate(AGENT_HREF[a])}
                  >
                    <td className="px-4 py-2.5 text-charcoal">{a}</td>
                    <td className="max-w-[260px] truncate px-4 py-2.5 text-charcoal-muted">
                      {rt.currentTask}
                    </td>
                    <td className="px-4 py-2.5 text-right text-charcoal">{rt.queue}</td>
                    <td className="px-4 py-2.5 text-right text-charcoal">
                      {rt.throughput7d}
                    </td>
                    <td className="px-4 py-2.5 text-right text-charcoal">
                      {rt.successRate}%
                    </td>
                    <td className="px-4 py-2.5 text-right text-charcoal">
                      {rt.overrides7d}
                    </td>
                    <td className="px-4 py-2.5 text-right text-charcoal-muted">
                      {rt.lastActive} ago
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CostHeroTile({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div className="bg-cream p-4">
      <div className="flex items-center gap-2 text-[11.5px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} style={{ color: accent }} />
        {label}
      </div>
      <p className="mt-1.5 text-[24px] font-[600] tracking-[-0.4px] text-charcoal">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[12px] text-charcoal-muted">{hint}</p>
    </div>
  );
}

// ─── Direct Work ───────────────────────────────────────────

const KIND_META: Record<
  PersonDirectWork["kind"],
  { label: string; icon: typeof FileText; color: string }
> = {
  decision: { label: "Decision", icon: Gavel, color: "#c89211" },
  review: { label: "Review", icon: ShieldCheck, color: "#2563eb" },
  draft: { label: "Drafting", icon: PenLine, color: "#5f5f5d" },
  task: { label: "Task", icon: FileText, color: "#5f5f5d" },
};

const REASON_META: Record<NonNullable<PersonDirectWork["reason"]>, string> = {
  "human-only": "Human-only",
  sensitive: "Sensitive",
  quick: "Quick",
  judgment: "Judgment",
};

function DirectWorkTab({ directWork }: { directWork: PersonDirectWork[] }) {
  const [tab, setTab] = useState<"all" | PersonDirectWork["kind"]>("all");
  const subtabs: { id: typeof tab; label: string }[] = [
    { id: "all", label: `All · ${directWork.length}` },
    { id: "decision", label: "Decisions" },
    { id: "review", label: "Reviews" },
    { id: "draft", label: "Drafting" },
    { id: "task", label: "Tasks" },
  ];
  const filtered = tab === "all" ? directWork : directWork.filter((i) => i.kind === tab);

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="My Direct Work"
        hint="에이전트에 위임하지 않고 본인이 들고 있는 일"
      />
      <div className="flex flex-wrap gap-1">
        {subtabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[12.5px] transition",
              tab === t.id
                ? "bg-charcoal text-charcoal-offwhite"
                : "text-charcoal-muted hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="grid h-32 place-items-center text-[13px] text-charcoal-muted">
            이 카테고리에는 작업이 없습니다
          </div>
        ) : (
          <ul className="divide-y divide-cream-light">
            {filtered.map((w) => (
              <DirectWorkRow key={w.id} work={w} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DirectWorkRow({ work }: { work: PersonDirectWork }) {
  const meta = KIND_META[work.kind];
  const Icon = meta.icon;
  return (
    <li className="group flex items-center gap-3 px-4 py-2.5 transition hover:bg-[rgba(28,28,28,0.02)]">
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md"
        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
      >
        <Icon className="h-4 w-4" strokeWidth={1.6} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] text-charcoal">{work.title}</p>
        <p className="truncate text-[12px] text-charcoal-muted">
          {meta.label} · from {work.source}
        </p>
      </div>
      {work.reason && (
        <span className="hidden shrink-0 rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11.5px] text-charcoal-muted sm:inline">
          {REASON_META[work.reason]}
        </span>
      )}
      {work.due && (
        <span className="shrink-0 text-[12px] text-charcoal-muted">Due {work.due}</span>
      )}
      <button
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-charcoal-muted opacity-0 transition hover:bg-[rgba(28,28,28,0.06)] hover:text-charcoal group-hover:opacity-100"
        aria-label="More"
      >
        <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />
      </button>
    </li>
  );
}

// ─── Goals ─────────────────────────────────────────────────

function GoalsTab({ okrs }: { okrs: PersonOkr[] }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="Goals & Progress"
        hint="에이전트와 동일한 평가 단위 · 본인이 오너인 KR"
      />
      <div className="card flex flex-col divide-y divide-cream-light">
        {okrs.map((o) => (
          <OkrRow key={o.id} okr={o} />
        ))}
      </div>
    </div>
  );
}

function OkrRow({ okr }: { okr: PersonOkr }) {
  const TrendIcon =
    okr.trend === "up" ? TrendingUp : okr.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    okr.trend === "up" ? "#1f8a4c" : okr.trend === "down" ? "#b8443a" : "#8a8a87";
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] text-charcoal">{okr.title}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-cream-light">
          <div
            className="h-full rounded-pill bg-charcoal/80"
            style={{ width: `${okr.progress}%` }}
          />
        </div>
      </div>
      <span
        className="inline-flex items-center gap-1 text-[12px]"
        style={{ color: trendColor }}
      >
        <TrendIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
      </span>
      <span className="w-12 text-right text-[14px] font-[480] text-charcoal">
        {okr.progress}%
      </span>
    </div>
  );
}

// ─── Human ─────────────────────────────────────────────────

function HumanTab({
  person,
  meetings,
}: {
  person: Person;
  meetings: ReturnType<typeof PERSON_MEETINGS[PersonId]> extends infer T
    ? T
    : never;
}) {
  const pto = PERSON_PTO[person.id];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="card p-4">
        <div className="flex items-center gap-2 text-[13px] font-[480] text-charcoal">
          <Plane className="h-4 w-4 text-charcoal-muted" strokeWidth={1.6} />
          Attendance & PTO
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <p className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              Next leave
            </p>
            <p className="mt-0.5 text-charcoal">{pto.nextLeave ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              Cover
            </p>
            <p className="mt-0.5 text-charcoal">{pto.cover ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              Used this year
            </p>
            <p className="mt-0.5 text-charcoal">{pto.daysUsedThisYear} days</p>
          </div>
          <div>
            <p className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              Remaining
            </p>
            <p className="mt-0.5 text-charcoal">{pto.daysRemaining} days</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 text-[13px] font-[480] text-charcoal">
          <CalendarDays className="h-4 w-4 text-charcoal-muted" strokeWidth={1.6} />
          This week meetings
        </div>
        <ul className="mt-3 flex flex-col gap-2.5">
          {meetings.map((m: { id: string; title: string; with: string; when: string; outcome?: string }) => (
            <li key={m.id} className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] text-charcoal">{m.title}</p>
                <p className="truncate text-[12px] text-charcoal-muted">
                  With {m.with}
                  {m.outcome ? ` · ${m.outcome}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-[12px] text-charcoal-muted">{m.when}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 text-[13px] font-[480] text-charcoal">
          <Users className="h-4 w-4 text-charcoal-muted" strokeWidth={1.6} />
          1:1s & Reviews
        </div>
        <ul className="mt-3 flex flex-col gap-2 text-[13px] text-charcoal-muted">
          <li>
            <span className="text-charcoal">Next 1:1</span> · with Jazz · Thu 10:00
          </li>
          <li>
            <span className="text-charcoal">Q2 review</span> · scheduled for Jun 28
          </li>
          <li>
            <span className="text-charcoal">Latest feedback</span> · 2025-04-22 from Jazz
          </li>
        </ul>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 text-[13px] font-[480] text-charcoal">
          <FileText className="h-4 w-4 text-charcoal-muted" strokeWidth={1.6} />
          Growth plan
        </div>
        <p className="mt-3 text-[13px] text-charcoal">
          {person.role}로서의 다음 분기 성장 목표와 학습 영역.
        </p>
        <p className="mt-2 text-[12.5px] text-charcoal-muted">
          현재 진행 중인 학습: 인공지능 기반 의사결정 워크플로우, 글쓰기 명료성.
        </p>
      </div>
    </div>
  );
}
