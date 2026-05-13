import { useMemo, useState, type ComponentType } from "react";
import {
  Headphones,
  Bug,
  Lightbulb,
  Crosshair,
  Globe2,
  Briefcase,
  ArrowRight,
  Flame,
} from "lucide-react";
import type { NewIssueSeed } from "../components/NewIssueModal";
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

const STATUS_META: Record<SignalStatus, { label: string; tone: string }> = {
  new: { label: "New", tone: "text-charcoal bg-cream border-cream-light" },
  triaging: {
    label: "Triaging",
    tone: "text-charcoal bg-[rgba(28,28,28,0.06)] border-transparent",
  },
  planned: {
    label: "Planned",
    tone: "text-[#1f8a4c] bg-[rgba(31,138,76,0.08)] border-[rgba(31,138,76,0.25)]",
  },
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
  },
  {
    id: "s-4",
    source: "competitor",
    title: "Linear shipped 'Agents Marketplace' — overlaps our Q3 plan",
    detail:
      "Linear 0.32 릴리스에서 외부 에이전트 등록·과금 흐름을 선공개. 우리 marketplace 프로젝트와 기능 범위 중복.",
    channel: "Linear changelog · 2d ago",
    timeAgo: "어제",
    status: "new",
    hot: true,
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
  },
  {
    id: "s-6",
    source: "sales",
    title: "Vercel 파일럿, SOC2 문서 요청",
    detail:
      "딜 금액 $48K · 계약 전 보안 문서 패키지 필요. 현재 Type II 미보유, Type I만 공유 가능.",
    channel: "Salesforce · deal $48K",
    timeAgo: "3일 전",
    status: "planned",
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
  },
  {
    id: "s-8",
    source: "internal",
    title: "/workflows p95 latency 1.8s로 급등 (Mon 09:14 이후)",
    detail:
      "deploy 0.241 이후 워크플로우 트리거 API의 p95가 평소 320ms → 1.8s. background job 큐 길이가 함께 증가.",
    channel: "Grafana · since Mon 09:14",
    timeAgo: "오늘 09:14",
    status: "triaging",
    hot: true,
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
  onPlan: (seed: NewIssueSeed) => void;
};

export function Signals({ onPlan }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: SIGNALS.length };
    for (const s of SIGNALS) c[s.source] = (c[s.source] ?? 0) + 1;
    return c;
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? SIGNALS : SIGNALS.filter((s) => s.source === filter)),
    [filter]
  );

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-8">
        <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
          Signals
        </h2>
      </header>

      <section className="mt-2">
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
              해당 소스의 새 시그널이 아직 없습니다.
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
  const status = STATUS_META[signal.status];

  return (
    <li className="group">
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4 px-5 py-4 transition hover:bg-[rgba(28,28,28,0.025)]">
        <span
          aria-label={src.label}
          title={src.label}
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border border-cream-light bg-cream"
          style={{ color: src.color }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-pill px-2 py-0.5 text-[11px] font-[480] uppercase tracking-[0.06em]"
              style={{
                color: src.color,
                backgroundColor: `${src.color}14`,
                border: `1px solid ${src.color}33`,
              }}
            >
              {src.short}
            </span>
            <span
              className={cn(
                "rounded-pill border px-2 py-0.5 text-[11px] font-[480]",
                status.tone
              )}
            >
              {status.label}
            </span>
            {signal.hot && (
              <span className="inline-flex items-center gap-1 rounded-pill border border-[rgba(184,68,58,0.25)] bg-[rgba(184,68,58,0.08)] px-2 py-0.5 text-[11px] font-[480] text-[#b8443a]">
                <Flame className="h-3 w-3" strokeWidth={1.8} />
                Escalate
              </span>
            )}
            <span className="text-[12px] text-charcoal-muted">
              {signal.channel} · {signal.timeAgo}
            </span>
          </div>

          <p className="mt-2 text-[15px] font-[480] leading-[1.4] text-charcoal">
            {signal.title}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.55] text-charcoal-muted">
            {signal.detail}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 self-center">
          <button
            type="button"
            onClick={() =>
              onPlan({
                title: signal.title,
                description: `> Signal · ${src.label} · ${signal.channel}\n\n${signal.detail}`,
                sourceLabel: `${src.short} signal`,
              })
            }
            className="btn-primary h-8 px-3 text-[13px]"
          >
            Plan
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="text-[12px] text-charcoal-muted underline-offset-4 transition hover:underline"
          >
            Archive
          </button>
        </div>
      </div>
    </li>
  );
}
