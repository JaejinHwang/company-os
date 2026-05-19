// Signal model and seed catalog. Signals are incoming notifications/events
// that the user can promote to a backlog item via the Signals page.

export type SignalSource =
  | "cs"
  | "bug"
  | "internal"
  | "competitor"
  | "market"
  | "sales";

export type SignalStatus = "new" | "triaging" | "planned";

export type Signal = {
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

export const INITIAL_SIGNALS: Signal[] = [
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
