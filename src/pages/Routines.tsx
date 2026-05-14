import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Circle,
  Clock,
  Play,
  Pause,
  Bot,
  BrainCircuit,
  Gem,
  Megaphone,
  Wrench,
  User,
  Globe2,
  Wallet,
  Repeat,
  Settings as SettingsIcon,
  ShieldCheck,
  MoreHorizontal,
} from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { cn } from "../lib/cn";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

type RoutineCategory = "market" | "ops" | "finance" | "compliance";
type RoutineStatus = "success" | "failed" | "running" | "scheduled";

type Routine = {
  id: string;
  name: string;
  description: string;
  category: RoutineCategory;
  schedule: string;
  cron: string;
  agent: string;
  enabled: boolean;
  lastRun: string;
  lastStatus: RoutineStatus;
  nextRun: string;
};

const CATEGORY_META: Record<
  RoutineCategory,
  { label: string; color: string; icon: IconType }
> = {
  market: { label: "Market", color: "#7c6cff", icon: Globe2 },
  ops: { label: "Ops", color: "#5f5f5d", icon: SettingsIcon },
  finance: { label: "Finance", color: "#1f8a4c", icon: Wallet },
  compliance: { label: "Compliance", color: "#c89211", icon: ShieldCheck },
};

const STATUS_META: Record<
  RoutineStatus,
  { label: string; color: string; icon: IconType }
> = {
  success: { label: "Success", color: "#1f8a4c", icon: CheckCircle2 },
  failed: { label: "Failed", color: "#b8443a", icon: AlertCircle },
  running: { label: "Running", color: "#2563eb", icon: Circle },
  scheduled: { label: "Paused", color: "rgba(28,28,28,0.4)", icon: Circle },
};

const AGENT_ICONS: Record<string, IconType> = {
  CEO: Bot,
  CTO: BrainCircuit,
  UXDesigner: Gem,
  Marketer: Megaphone,
  Engineer: Wrench,
};

const INITIAL_ROUTINES: Routine[] = [
  // Market (4)
  {
    id: "r-1",
    name: "Competitor changelog scrape",
    description:
      "Linear · Notion · Vercel · Cursor changelog 수집 후 변경 발견 시 Slack #intel-competitor에 정리해서 알림",
    category: "market",
    schedule: "Daily · 09:00 KST",
    cron: "0 9 * * *",
    agent: "Engineer",
    enabled: true,
    lastRun: "3시간 전",
    lastStatus: "success",
    nextRun: "21h 뒤",
  },
  {
    id: "r-2",
    name: "ICP keyword radar",
    description:
      "Reddit r/SaaS · Hacker News · X 에서 ICP 키워드 멘션 수집, 요약 → Notion DB",
    category: "market",
    schedule: "Hourly",
    cron: "0 * * * *",
    agent: "Marketer",
    enabled: true,
    lastRun: "12분 전",
    lastStatus: "success",
    nextRun: "48m 뒤",
  },
  {
    id: "r-3",
    name: "Competitor pricing snapshot",
    description:
      "경쟁사 가격 페이지 스냅샷 → 직전 스냅샷과 diff, 변경 시 Slack + Notion 기록",
    category: "market",
    schedule: "Mon · 10:00 KST",
    cron: "0 10 * * 1",
    agent: "Marketer",
    enabled: true,
    lastRun: "5일 전",
    lastStatus: "success",
    nextRun: "월 10:00",
  },
  {
    id: "r-4",
    name: "SaaS funding & launch radar",
    description:
      "Crunchbase · ProductHunt 신규 펀딩/런칭 감지, 카테고리 필터 후 주간 다이제스트로 묶음",
    category: "market",
    schedule: "Daily · 10:00 KST",
    cron: "0 10 * * *",
    agent: "CEO",
    enabled: true,
    lastRun: "2시간 전",
    lastStatus: "success",
    nextRun: "22h 뒤",
  },
  // Ops (4)
  {
    id: "r-5",
    name: "AWS cost anomaly alert",
    description:
      "전일 대비 일별 비용 anomaly 탐지, 서비스별 spike → Slack #ops-finance",
    category: "ops",
    schedule: "Daily · 08:00 KST",
    cron: "0 8 * * *",
    agent: "Engineer",
    enabled: true,
    lastRun: "4시간 전",
    lastStatus: "failed",
    nextRun: "20h 뒤",
  },
  {
    id: "r-6",
    name: "Sentry error volume digest",
    description:
      "전일 에러 볼륨, 신규 이슈 Top 5, 회귀 의심 이슈 요약 → Slack #eng-quality",
    category: "ops",
    schedule: "Daily · 08:30 KST",
    cron: "30 8 * * *",
    agent: "Engineer",
    enabled: true,
    lastRun: "3시간 전",
    lastStatus: "success",
    nextRun: "21h 뒤",
  },
  {
    id: "r-7",
    name: "Hiring pipeline summary",
    description:
      "Greenhouse 단계별 후보자 수, 정체된 스테이지, 이번 주 면접 일정을 한 페이지로",
    category: "ops",
    schedule: "Mon · 09:30 KST",
    cron: "30 9 * * 1",
    agent: "CEO",
    enabled: true,
    lastRun: "5일 전",
    lastStatus: "success",
    nextRun: "월 09:30",
  },
  {
    id: "r-8",
    name: "Investor update draft",
    description:
      "MRR · 활성 사용자 · 채용 · 핵심 사건을 자동 수집해 투자자 업데이트 초안 작성 → CEO 검토 대기",
    category: "ops",
    schedule: "Thu · 16:00 KST",
    cron: "0 16 * * 4",
    agent: "CEO",
    enabled: true,
    lastRun: "지난 목 16:00",
    lastStatus: "success",
    nextRun: "목 16:00",
  },
  // Finance (3)
  {
    id: "r-9",
    name: "Stripe failed payment recovery",
    description:
      "전일 실패 결제 → 자동 재시도 + 고객 알림 메일 발송, 일별 회수율 리포트",
    category: "finance",
    schedule: "Daily · 07:00 KST",
    cron: "0 7 * * *",
    agent: "CTO",
    enabled: true,
    lastRun: "5시간 전",
    lastStatus: "success",
    nextRun: "23h 뒤",
  },
  {
    id: "r-10",
    name: "Runway & burn report",
    description:
      "현금 잔고 · 월 burn · 잔여 runway 계산 → CEO/CFO 매주 월요일 아침 Slack DM",
    category: "finance",
    schedule: "Mon · 08:00 KST",
    cron: "0 8 * * 1",
    agent: "CEO",
    enabled: true,
    lastRun: "5일 전",
    lastStatus: "success",
    nextRun: "월 08:00",
  },
  {
    id: "r-11",
    name: "Overdue invoice reminder",
    description:
      "30일 경과 미수금 인보이스 대상 자동 리마인더 메일. 60일 경과 시 계정 매니저에게 에스컬레이션",
    category: "finance",
    schedule: "Daily · 09:00 KST",
    cron: "0 9 * * *",
    agent: "CEO",
    enabled: false,
    lastRun: "—",
    lastStatus: "scheduled",
    nextRun: "일시 정지",
  },
  // Compliance (1)
  {
    id: "r-12",
    name: "SOC2 evidence collection",
    description:
      "Vanta 통합 — 일일 컨트롤 evidence 수집, 누락 항목 발견 시 담당자에게 자동 티켓 발행",
    category: "compliance",
    schedule: "Daily · 03:00 KST",
    cron: "0 3 * * *",
    agent: "CTO",
    enabled: true,
    lastRun: "8시간 전",
    lastStatus: "success",
    nextRun: "16h 뒤",
  },
];

const FILTERS: Array<{ id: "all" | RoutineCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "market", label: "Market" },
  { id: "ops", label: "Ops" },
  { id: "finance", label: "Finance" },
  { id: "compliance", label: "Compliance" },
];

type Props = {
  sampleData: boolean;
  onLoadSamples: () => void;
};

export function Routines({ sampleData, onLoadSamples }: Props) {
  const [routines, setRoutines] = useState<Routine[]>(
    sampleData ? INITIAL_ROUTINES : []
  );
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: routines.length };
    for (const r of routines) c[r.category] = (c[r.category] ?? 0) + 1;
    return c;
  }, [routines]);

  const visible = useMemo(() => {
    return filter === "all"
      ? routines
      : routines.filter((r) => r.category === filter);
  }, [routines, filter]);

  const toggleEnabled = (id: string) =>
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              enabled: !r.enabled,
              lastStatus: !r.enabled ? r.lastStatus : "scheduled",
              nextRun: !r.enabled ? r.nextRun : "일시 정지",
            }
          : r
      )
    );

  const runNow = (id: string) =>
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, lastStatus: "running", lastRun: "방금 실행" }
          : r
      )
    );

  const enabledCount = routines.filter((r) => r.enabled).length;
  const failedCount = routines.filter(
    (r) => r.enabled && r.lastStatus === "failed"
  ).length;

  if (routines.length === 0) {
    return (
      <div className="mx-auto max-w-[1200px]">
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
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-8">
        <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Routines
        </h2>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Routines" value={routines.length.toString()} />
        <StatCard label="Enabled" value={enabledCount.toString()} />
        <StatCard
          label="Failed today"
          value={failedCount.toString()}
          tone={failedCount > 0 ? "warn" : undefined}
        />
        <StatCard label="Next" value="48m" hint="ICP keyword radar" />
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

      <section className="mt-5">
        <div className="card overflow-hidden">
          <ul className="divide-y divide-cream-light">
            {visible.map((r) => (
              <RoutineRow
                key={r.id}
                routine={r}
                onToggle={() => toggleEnabled(r.id)}
                onRun={() => runNow(r.id)}
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
  onToggle,
  onRun,
}: {
  routine: Routine;
  onToggle: () => void;
  onRun: () => void;
}) {
  const cat = CATEGORY_META[routine.category];
  const CatIcon = cat.icon;
  const status = STATUS_META[routine.lastStatus];
  const StatusIcon = status.icon;
  const AgentIcon = AGENT_ICONS[routine.agent] ?? User;

  return (
    <li
      className={cn(
        "px-5 py-4 transition hover:bg-[rgba(28,28,28,0.025)]",
        !routine.enabled && "opacity-60"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Category icon */}
        <span
          aria-label={cat.label}
          title={cat.label}
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border border-cream-light bg-cream"
          style={{ color: cat.color }}
        >
          <CatIcon className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-pill px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.06em]"
              style={{
                color: cat.color,
                backgroundColor: `${cat.color}14`,
                border: `1px solid ${cat.color}33`,
              }}
            >
              {cat.label}
            </span>
            <p className="text-[15px] font-[480] text-charcoal">
              {routine.name}
            </p>
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-[1.55] text-charcoal-muted">
            {routine.description}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-charcoal-muted">
            <span className="inline-flex items-center gap-1.5" title={routine.cron}>
              <Clock className="h-3.5 w-3.5" strokeWidth={1.6} />
              {routine.schedule}
              <code className="rounded border border-cream-light bg-cream px-1 py-0.5 font-mono text-[11px] text-charcoal">
                {routine.cron}
              </code>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="grid h-4 w-4 place-items-center rounded-pill border border-cream-light bg-cream">
                <AgentIcon className="h-2.5 w-2.5" strokeWidth={1.6} />
              </span>
              {routine.agent}
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              style={{ color: status.color }}
            >
              {routine.lastStatus === "running" ? (
                <span className="relative grid h-3 w-3 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/50" />
                  <span className="relative h-2 w-2 rounded-full bg-blue-500" />
                </span>
              ) : (
                <StatusIcon
                  className="h-3.5 w-3.5"
                  style={{ color: status.color }}
                  strokeWidth={1.8}
                />
              )}
              Last: {routine.lastRun}
            </span>
            <span>Next: {routine.nextRun}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onRun}
            disabled={!routine.enabled}
            title="Run now"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md border border-cream-light bg-cream text-charcoal transition",
              routine.enabled
                ? "hover:bg-[rgba(28,28,28,0.04)]"
                : "cursor-not-allowed opacity-50"
            )}
          >
            <Play className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <Toggle enabled={routine.enabled} onClick={onToggle} />
          <button
            type="button"
            aria-label="More"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </li>
  );
}

function Toggle({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onClick}
      title={enabled ? "Pause" : "Enable"}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-pill transition",
        enabled
          ? "bg-charcoal shadow-inset-dark"
          : "bg-[rgba(28,28,28,0.15)]"
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

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "warn";
}) {
  return (
    <div className="card p-4">
      <p className="text-[12px] text-charcoal-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-[24px] font-[600] tracking-[-0.4px]",
          tone === "warn" ? "text-[#b8443a]" : "text-charcoal"
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 truncate text-[12px] text-charcoal-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
