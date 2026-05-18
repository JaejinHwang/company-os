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
import { EmptyState } from "../components/EmptyState";
import { cn } from "../lib/cn";

type SignalSource =
  | "cs"
  | "bug"
  | "internal"
  | "competitor"
  | "market"
  | "sales";

type SignalStatus = "new" | "triaging" | "planned";

type Signal = {
  id: string;
  source: SignalSource;
  title: string;
  detail: string;
  channel: string;
  timeAgo: string;
  status: SignalStatus;
  hot?: boolean;
  suggestedKrId?: string;
};

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

const SIGNALS: Signal[] = [
  {
    id: "s-1",
    source: "cs",
    title: "Korean customers can't change subscription tier from Settings",
    detail:
      "결제 페이지에서 'Manage plan'을 누르면 빈 화면이 뜬다는 리포트가 24시간 내 12건. 모두 ko-KR 로케일, Stripe portal 호출 시 404.",
    channel: "Zendesk · 12 tickets",
    timeAgo: "방금 전",
    status: "new",
    hot: true,
    suggestedKrId: "kr-2-3",
  },
  {
    id: "s-2",
    source: "bug",
    title: "Mobile sign-up flow breaks on iOS 17.2 (Safari)",
    detail:
      "OTP 입력 후 'Continue' 버튼이 비활성 상태로 남는 이슈. Sentry breadcrumb으로 input ref unmount 추정.",
    channel: "Sentry · production",
    timeAgo: "32분 전",
    status: "new",
    suggestedKrId: "kr-4-1",
  },
  {
    id: "s-3",
    source: "internal",
    title: "Onboarding completion drops 38% at step 3 (workspace invite)",
    detail:
      "Amplitude 펀널 분석 결과 이번 주 step3 완료율이 지난 4주 평균 대비 -38%. 메일 발송 지연과 상관 가능성 있음.",
    channel: "Amplitude · this week",
    timeAgo: "2시간 전",
    status: "triaging",
    suggestedKrId: "kr-1-3",
  },
  {
    id: "s-4",
    source: "competitor",
    title: "Linear shipped 'Agents Marketplace' — overlaps our Q3 plan",
    detail:
      "Linear 0.32 릴리스에서 외부 에이전트 등록·과금 흐름을 선공개. 우리 marketplace 프로젝트와 기능 범위 중복.",
    channel: "Linear changelog",
    timeAgo: "어제",
    status: "new",
    hot: true,
    suggestedKrId: "kr-3-1",
  },
  {
    id: "s-5",
    source: "market",
    title: "Solo founder ICP, cost analytics에 강한 관심 표명",
    detail:
      "W19 유저 인터뷰 6건 중 5건이 'agent별 누적 비용을 보고 싶다'고 언급. 현재 Costs 탭이 워크스페이스 단위에 머무름.",
    channel: "User interviews · W19",
    timeAgo: "2일 전",
    status: "triaging",
    suggestedKrId: "kr-1-1",
  },
  {
    id: "s-6",
    source: "sales",
    title: "Vercel 파일럿, SOC2 문서 요청",
    detail:
      "딜 금액 $48K · 계약 전 보안 문서 패키지 필요. 현재 Type II 미보유, Type I만 공유 가능.",
    channel: "Salesforce · $48K",
    timeAgo: "3일 전",
    status: "planned",
    suggestedKrId: "kr-2-2",
  },
  {
    id: "s-7",
    source: "cs",
    title: "Bulk-assign for agents 기능 요청 (8건/주)",
    detail:
      "동일 이슈를 여러 에이전트에 한 번에 할당하고 싶다는 요청이 이번 주 8건. 주로 Pro 플랜 사용자.",
    channel: "Intercom · 8 mentions",
    timeAgo: "이번 주",
    status: "new",
    suggestedKrId: "kr-1-1",
  },
  {
    id: "s-8",
    source: "internal",
    title: "/workflows p95 latency 1.8s로 급등 (Mon 09:14 이후)",
    detail:
      "deploy 0.241 이후 워크플로우 트리거 API의 p95가 평소 320ms → 1.8s. background job 큐 길이가 함께 증가.",
    channel: "Grafana",
    timeAgo: "오늘 09:14",
    status: "triaging",
    hot: true,
    suggestedKrId: "kr-3-2",
  },
];

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
  onPlan: (seed: NewIssueSeed) => void;
  onLoadSamples: () => void;
};

export function Signals({ sampleData, onPlan, onLoadSamples }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const source = sampleData ? SIGNALS : [];

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: source.length };
    for (const s of source) c[s.source] = (c[s.source] ?? 0) + 1;
    return c;
  }, [source]);

  const visible = useMemo(
    () =>
      filter === "all" ? source : source.filter((s) => s.source === filter),
    [filter, source]
  );

  if (!sampleData) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8">
          <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
            Signals
          </h2>
        </header>
        <EmptyState
          icon={Radio}
          title="아직 도착한 시그널이 없어요"
          description="외부 채널에서 들어온 신호가 여기 모입니다. Plan을 누르면 Backlog로 승격됩니다."
          onLoadSamples={onLoadSamples}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-8">
        <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Signals
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
