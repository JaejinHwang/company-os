export type ExperimentStatus = "in_progress" | "pending" | "done" | "todo";
export type ExperimentVerdict = "validated" | "invalidated" | "mixed" | "tbd";
export type NextActionKind =
  | "ship"
  | "kill"
  | "investigate"
  | "new-experiment"
  | "rollback";

export type ExperimentNextAction = {
  title: string;
  kind: NextActionKind;
  owner?: string;
  status?: "queued" | "in_progress" | "done";
};

export type Experiment = {
  href: string;
  title: string;
  status: ExperimentStatus;
  product?: string;
  startedAt: string;
  closedAt?: string;
  hypothesis: string;
  metric: string;
  target: string;
  baseline?: string;
  result?: string;
  resultDelta?: string;
  verdict: ExperimentVerdict;
  learnings: string[];
  nextActions: ExperimentNextAction[];
};

export const EXPERIMENTS: Experiment[] = [
  {
    href: "#proj-health",
    title: "Customer health score",
    status: "done",
    product: "Sprint",
    startedAt: "2026-02-12",
    closedAt: "2026-04-30",
    hypothesis:
      "워크스페이스 단위 활성/리스크 점수를 PM과 CS가 같은 화면에서 보면, 14일 내 자발적 리텐션 액션이 늘어 분기 자발 해지율이 줄어든다.",
    metric: "분기 자발 해지율 (voluntary churn)",
    target: "−25% (3.4% → 2.5%)",
    baseline: "3.4% (Q1 2026)",
    result: "2.3% (Q2 2026 부분 데이터)",
    resultDelta: "−32%",
    verdict: "validated",
    learnings: [
      "리스크 점수가 노출된 워크스페이스의 70%에서 7일 내 CS 아웃리치가 트리거됨 — 점수 자체보다 '누가 봐야 하는가' 알림이 더 큰 레버였음.",
      "PM이 가장 자주 본 단일 신호는 '주간 활성 시트 수 -30%'. 점수 합산보다 raw signal이 의사결정에 직접 쓰임.",
      "Free → Team 전환 직전 워크스페이스의 점수는 신규 가입과 거의 동일 — Activation 단계 정의가 부적절했음.",
    ],
    nextActions: [
      {
        title: "Health score를 Activation 정의 재설계의 입력으로 사용",
        kind: "new-experiment",
        owner: "PM",
        status: "queued",
      },
      {
        title: "리스크 임계치 도달 시 CS 채널로 자동 라우팅 (Slack)",
        kind: "ship",
        owner: "Engineer",
        status: "in_progress",
      },
      {
        title: "점수 합산 UI는 보조 지표로 강등, raw signal을 최상단으로",
        kind: "investigate",
        owner: "UX",
        status: "queued",
      },
    ],
  },
  {
    href: "#proj-onboarding",
    title: "Onboarding flow v2",
    status: "in_progress",
    product: "Sprint",
    startedAt: "2026-04-08",
    hypothesis:
      "신규 유저가 가입 후 30분 내 첫 가치 경험(첫 backlog 생성 + 첫 agent run)까지 도달하는 비율을 60%로 끌어올리면 7일 리텐션이 2배가 된다.",
    metric: "Time-to-First-Value (TTFV) ≤ 30분 비율 · D7 retention",
    target: "TTFV ≤30분 60% / D7 retention 2x",
    baseline: "TTFV ≤30분 34% / D7 retention 18%",
    verdict: "tbd",
    learnings: [
      "Phase 7 Components 단계 — Atoms/Molecules 토큰 컴플라이언스 100%, Organisms 75%까지 진행. WorkspacePicker 빈 상태 카피가 결정 블로커.",
      "초기 프로토타입 사용자 5명 인터뷰 — 가입 직후 '무엇부터 해야 할지' 모르는 순간이 가장 큰 마찰. First-task seed가 가설보다 더 결정적일 수 있음.",
    ],
    nextActions: [
      {
        title: "WorkspacePicker 빈 상태 카피 결정 (CTO 권한 모델 리뷰 대기)",
        kind: "investigate",
        owner: "UX",
        status: "in_progress",
      },
      {
        title: "First-task seed 가설을 독립 실험으로 분리",
        kind: "new-experiment",
        owner: "PM",
        status: "queued",
      },
    ],
  },
  {
    href: "#proj-marketplace",
    title: "AI agent marketplace",
    status: "in_progress",
    product: "Agents Cloud",
    startedAt: "2026-03-18",
    hypothesis:
      "외부 개발자가 등록한 에이전트를 검증·과금 흐름과 함께 노출하면, 워크스페이스당 활성 에이전트 수가 1.7개 → 3.0개로 늘고 ARPA가 비례 상승한다.",
    metric: "워크스페이스당 활성 에이전트 수 · ARPA",
    target: "활성 에이전트 1.7 → 3.0 / ARPA +40%",
    baseline: "활성 에이전트 1.7 / ARPA $48",
    verdict: "tbd",
    learnings: [
      "베타 등록 외부 에이전트 12개 중 8개가 신뢰성 검증 (uptime ≥99%) 미달 — 검증 게이트 없이는 디스커버리 신뢰가 무너짐.",
      "결제는 워크스페이스 단위 prepaid wallet이 가장 마찰이 적음 (vs 에이전트별 구독).",
    ],
    nextActions: [
      {
        title: "Tier-1 검증 게이트 (uptime, abuse, latency) 출시 전 필수화",
        kind: "ship",
        owner: "Engineer",
        status: "in_progress",
      },
      {
        title: "Wallet 충전 UX A/B 테스트",
        kind: "new-experiment",
        owner: "UX",
        status: "queued",
      },
    ],
  },
  {
    href: "#proj-pricing",
    title: "Pricing & billing rework",
    status: "pending",
    product: "Sprint",
    startedAt: "2026-05-02",
    hypothesis:
      "신규 요금제(Team/Business/Scale)로 가격을 재정렬하고 Stripe Tax로 마이그레이션하면 ko-KR/jp-JP 시장 전환율이 정상화되고 인보이스 분쟁이 50% 줄어든다.",
    metric: "ko-KR/jp-JP 전환율 · 인보이스 분쟁 건수",
    target: "전환율 글로벌 평균 ±10% / 분쟁 −50%",
    baseline: "ko-KR 전환율 -38% vs 글로벌 / 분쟁 24건/월",
    verdict: "tbd",
    learnings: [
      "현재 ko-KR에서 portal 호출 404 — Stripe 마이그레이션 전 hotfix 필요 (CS 신호 12건).",
    ],
    nextActions: [
      {
        title: "ko-KR portal 404 hotfix",
        kind: "ship",
        owner: "CTO",
        status: "in_progress",
      },
    ],
  },
  {
    href: "#proj-mobile",
    title: "Mobile app launch",
    status: "todo",
    product: "Sprint",
    startedAt: "2026-05-14",
    hypothesis:
      "iOS/Android 네이티브 앱이 출시되면 MAU의 30%가 모바일에서 최소 1회 backlog 확인/실행을 수행해, 평균 세션 빈도가 주 3.1 → 5.0회로 증가한다.",
    metric: "모바일 MAU 비중 · 주간 세션 빈도",
    target: "모바일 MAU ≥30% / 세션 5.0/주",
    baseline: "모바일 MAU 0% / 세션 3.1/주",
    verdict: "tbd",
    learnings: [],
    nextActions: [
      {
        title: "TestFlight 베타 모집 (50명)",
        kind: "new-experiment",
        owner: "PM",
        status: "queued",
      },
    ],
  },
];

export function getExperimentByHref(href: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.href === href);
}

export const VERDICT_CONFIG: Record<
  ExperimentVerdict,
  { color: string; label: string }
> = {
  validated: { color: "#1f8a4c", label: "Validated" },
  invalidated: { color: "#b04444", label: "Invalidated" },
  mixed: { color: "#c89211", label: "Mixed" },
  tbd: { color: "rgba(28,28,28,0.45)", label: "TBD" },
};

export const NEXT_ACTION_CONFIG: Record<
  NextActionKind,
  { color: string; label: string }
> = {
  ship: { color: "#1f8a4c", label: "Ship" },
  kill: { color: "#b04444", label: "Kill" },
  investigate: { color: "#c89211", label: "Investigate" },
  "new-experiment": { color: "#2563eb", label: "New experiment" },
  rollback: { color: "#b04444", label: "Rollback" },
};
