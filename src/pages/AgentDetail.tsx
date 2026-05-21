import {
  Fragment,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDot,
  Clock,
  FileText,
  Gem,
  GitBranch,
  Layers,
  Megaphone,
  MessageSquare,
  MinusCircle,
  MoreHorizontal,
  Pause,
  Play,
  Plug2,
  Radio,
  Repeat,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import type {
  BacklogItem,
  BacklogPriority,
  BacklogStatus,
} from "../lib/backlog";
import { cn } from "../lib/cn";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

type AgentName = "CEO" | "CTO" | "UXDesigner" | "Marketer" | "Engineer";

const AGENT_ICONS: Record<AgentName, IconType> = {
  CEO: Bot,
  CTO: BrainCircuit,
  UXDesigner: Gem,
  Marketer: Megaphone,
  Engineer: Wrench,
};

const AGENT_PITCH: Record<AgentName, string> = {
  CEO: "전략·우선순위·이해관계자 관리",
  CTO: "아키텍처·기술 의사결정·코드 리뷰",
  UXDesigner: "디자인 탐색·비평·스펙 생성",
  Marketer: "포지셔닝·캠페인·카피·실험",
  Engineer: "구현·테스트·end-to-end 출시",
};

const PRIORITY_META: Record<BacklogPriority, { label: string; color: string }> =
  {
    urgent: { label: "Urgent", color: "#b8443a" },
    high: { label: "High", color: "#c89211" },
    medium: { label: "Medium", color: "#5f5f5d" },
    low: { label: "Low", color: "#8a8a87" },
    none: { label: "—", color: "#8a8a87" },
  };

type AgentStatus = "executing" | "idle" | "blocked";

type TechMetric = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  hint: string;
  tone: "warn" | "danger" | "ok" | "muted";
};

type AgentRoutine = {
  id: string;
  name: string;
  schedule: string;
  cron: string;
  lastRun: string;
  lastStatus: "success" | "failed" | "running";
  category: "market" | "ops" | "finance" | "compliance";
  successRate: number;
  avgDuration: string;
  runs7d: number;
  history: Array<"success" | "failed" | "skipped">;
};

type AgentProject = {
  href: string;
  title: string;
  status: "in_progress" | "pending" | "todo" | "done";
  done: number;
  active: number;
  total: number;
  currentPhase: string;
  phaseProgress: number;
  openBacklogs: number;
  recentDecisions: string[];
  collaborators: string[];
};

type ActivityKind =
  | "code"
  | "research"
  | "signal"
  | "review"
  | "routine"
  | "decision";

type ActivityEntry = {
  date: "today" | "yesterday" | "earlier";
  dateLabel?: string;
  time: string;
  text: string;
  kind: ActivityKind;
  href?: string;
  project?: string;
};

type CompletedBacklog = {
  id: string;
  title: string;
  project?: string;
  completedAt: string;
  priority: BacklogPriority;
};

type Skill = {
  name: string;
  description: string;
  triggers: string[];
  lastUsed?: string;
  runs?: number;
};

type ToolStatus = "connected" | "error" | "disabled";

type Tool = {
  name: string;
  type: "MCP" | "Connector" | "Webhook";
  status: ToolStatus;
  auth: string;
  lastSync: string;
  actions: number;
  scopes?: string[];
};

type AgentProfile = {
  status: AgentStatus;
  doing: string;
  doingProject: string;
  doingHref: string;
  doingDuration: string;
  upNext: { title: string; meta: string; href?: string }[];
  highlightsTitle: string;
  highlightsHint: string;
  highlights: TechMetric[];
  routines: AgentRoutine[];
  projectsLed: AgentProject[];
  projectsContributing: AgentProject[];
  activity: ActivityEntry[];
  activityByHour: number[];
  recentlyCompleted: CompletedBacklog[];
  role: string;
  skills: Skill[];
  tools: Tool[];
  cost: { usd: string; tokensIn: string; tokensOut: string; runs: number };
  hiredOn: string;
  done7d: number;
};

const CTO_PROFILE: AgentProfile = {
  status: "executing",
  doing: "/workflows p95 latency 회귀 조사",
  doingProject: "AI agent marketplace",
  doingHref: "#proj-marketplace",
  doingDuration: "32분 째 진행 중",
  highlightsTitle: "Tech health",
  highlightsHint: "CTO가 watching 중인 시스템 지표",
  upNext: [
    {
      title: "Korean customers can't change subscription tier",
      meta: "Urgent · Pricing & billing rework",
      href: "#backlogs",
    },
    {
      title: "Mobile sign-up flow breaks on iOS 17.2",
      meta: "High · Mobile app launch",
      href: "#backlogs",
    },
    {
      title: "Stripe Tax migration spec 작성",
      meta: "Medium · Pricing & billing rework",
      href: "#proj-pricing",
    },
  ],
  highlights: [
    {
      label: "/workflows p95",
      value: "1.8s",
      delta: "+450%",
      trend: "down",
      hint: "Mon 09:14 이후 회귀",
      tone: "danger",
    },
    {
      label: "Sentry 신규 이슈 (24h)",
      value: "12",
      delta: "+4 vs 어제",
      trend: "down",
      hint: "production 환경",
      tone: "warn",
    },
    {
      label: "AWS 일일 비용",
      value: "$182",
      delta: "+18%",
      trend: "down",
      hint: "anomaly 탐지됨",
      tone: "warn",
    },
    {
      label: "SOC2 evidence",
      value: "98%",
      delta: "—",
      trend: "neutral",
      hint: "오늘 03:00 자동 수집",
      tone: "ok",
    },
  ],
  routines: [
    {
      id: "r-9",
      name: "Stripe failed payment recovery",
      schedule: "Daily · 07:00 KST",
      cron: "0 7 * * *",
      lastRun: "5시간 전",
      lastStatus: "success",
      category: "finance",
      successRate: 96,
      avgDuration: "42s",
      runs7d: 7,
      history: [
        "success",
        "success",
        "success",
        "success",
        "success",
        "failed",
        "success",
      ],
    },
    {
      id: "r-12",
      name: "SOC2 evidence collection",
      schedule: "Daily · 03:00 KST",
      cron: "0 3 * * *",
      lastRun: "8시간 전",
      lastStatus: "success",
      category: "compliance",
      successRate: 100,
      avgDuration: "2m 10s",
      runs7d: 7,
      history: [
        "success",
        "success",
        "success",
        "success",
        "success",
        "success",
        "success",
      ],
    },
  ],
  projectsLed: [
    {
      href: "#proj-pricing",
      title: "Pricing & billing rework",
      status: "pending",
      done: 3,
      active: 0,
      total: 12,
      currentPhase: "Stripe Tax migration spec",
      phaseProgress: 35,
      openBacklogs: 4,
      recentDecisions: [
        "Stripe Tax 마이그레이션 - 단계적 enable, 첫 주 한국 로케일만",
        "Invoice 리포맷은 Q3로 연기 (legal 검토 미완)",
      ],
      collaborators: ["Engineer", "CEO"],
    },
    {
      href: "#proj-marketplace",
      title: "AI agent marketplace",
      status: "in_progress",
      done: 4,
      active: 2,
      total: 18,
      currentPhase: "Discovery page · checkout flow",
      phaseProgress: 55,
      openBacklogs: 6,
      recentDecisions: [
        "외부 에이전트 격리는 firecracker microVM으로 결정",
        "과금은 Stripe metered billing 위임, 자체 ledger 미구현",
      ],
      collaborators: ["Engineer", "UXDesigner", "CEO"],
    },
  ],
  projectsContributing: [
    {
      href: "#proj-mobile",
      title: "Mobile app launch",
      status: "todo",
      done: 1,
      active: 0,
      total: 14,
      currentPhase: "Build pipeline 자문",
      phaseProgress: 10,
      openBacklogs: 1,
      recentDecisions: [
        "iOS native + RN hybrid 대신 RN 단일 스택으로 가닥",
      ],
      collaborators: ["Engineer", "UXDesigner"],
    },
  ],
  activity: [
    {
      date: "today",
      time: "10:42",
      text: "PR #4521 — workflows latency 회귀 가설 검증 (rollback 0.241 후보)",
      kind: "code",
      project: "AI agent marketplace",
    },
    {
      date: "today",
      time: "10:18",
      text: "Atlas에 Mon 09:14 deploy diff 요청, 5개 변경 후보 정리",
      kind: "research",
      project: "AI agent marketplace",
    },
    {
      date: "today",
      time: "09:14",
      text: "Hot signal '/workflows p95 1.8s 급등' 픽업",
      kind: "signal",
      href: "#signals",
    },
    {
      date: "today",
      time: "08:30",
      text: "Sentry digest 검토 — 12개 신규 이슈 중 1개를 backlog로 승격",
      kind: "review",
      href: "#backlogs",
    },
    {
      date: "today",
      time: "07:02",
      text: "Stripe failed payment recovery routine 성공 (회수 7건, $1,240)",
      kind: "routine",
      href: "#routines",
    },
    {
      date: "today",
      time: "03:00",
      text: "SOC2 evidence collection routine 성공 (누락 0건)",
      kind: "routine",
      href: "#routines",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "18:24",
      text: "ADR-0042 작성 완료 — Marketplace 격리 모델 firecracker microVM",
      kind: "decision",
      project: "AI agent marketplace",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "16:50",
      text: "Engineer PR #4517 review · 3 nit · 1 blocker (auth scope 누락)",
      kind: "review",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "11:06",
      text: "Stripe Tax migration 스펙 v0.2 — 한국·일본 우선 enable",
      kind: "code",
      project: "Pricing & billing rework",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "09:00",
      text: "Linear marketplace 갭 분석 결과 검토 → CEO 동기화",
      kind: "research",
    },
    {
      date: "earlier",
      dateLabel: "5/12 · 월요일",
      time: "20:14",
      text: "deploy 0.241 검토 통과 — 이게 latency 회귀의 원인일 수 있음",
      kind: "decision",
    },
    {
      date: "earlier",
      dateLabel: "5/11 · 일요일",
      time: "14:02",
      text: "Vanta evidence 자동 수집 스킬 (cto:soc2-evidence-audit) 추가",
      kind: "code",
    },
  ],
  activityByHour: [
    0, 0, 0, 1, 0, 0, 0, 2, 1, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  recentlyCompleted: [
    {
      id: "c-1",
      title: "ADR-0042 — Marketplace 격리 모델 (firecracker)",
      project: "AI agent marketplace",
      completedAt: "어제 18:24",
      priority: "high",
    },
    {
      id: "c-2",
      title: "Engineer PR #4517 review · 1 blocker resolved",
      project: "AI agent marketplace",
      completedAt: "어제 16:50",
      priority: "medium",
    },
    {
      id: "c-3",
      title: "Stripe Tax migration 스펙 v0.2",
      project: "Pricing & billing rework",
      completedAt: "어제 11:06",
      priority: "high",
    },
    {
      id: "c-4",
      title: "deploy 0.241 검토 — 회귀 의심 변경 식별",
      project: "AI agent marketplace",
      completedAt: "5/12 20:14",
      priority: "urgent",
    },
    {
      id: "c-5",
      title: "Vanta evidence 자동 수집 스킬 추가",
      completedAt: "5/11 14:02",
      priority: "medium",
    },
  ],
  role: `# Charter
이 워크스페이스의 **CTO**. 시스템 안정성, 기술 방향, 코드 품질을 책임진다. 인간 동료 1명(Jazz)과 다른 4개 에이전트(CEO·UXDesigner·Marketer·Engineer)와 협업한다.

## Mission
시그널 → 분석 → 결정 → 실행을 24시간 안에 끝낸다. 사람은 결정만 내리고, 분석·실행은 에이전트가 책임진다.

## Operating principles
- 기술적 의사결정은 가능한 자율적으로 내린다
- 비용 영향 월 \`$500\` 이상 또는 데이터 마이그레이션은 **CEO 승인** 필수
- 인시던트 \`P0/P1\`은 5분 안에 Slack \`#ops\`에 1차 보고
- 보안 관련 변경은 **SOC2 evidence** 영향 평가 후 진행
- customer-facing UI 변경은 **UXDesigner**에게 위임
- 프로덕션 배포 전 **Engineer**의 리뷰를 받는다

## Inputs
- Sentry alerts (P0–P3)
- AWS Cost anomaly events
- Bug · Internal performance signals
- Stripe webhook 실패 이벤트
- GitHub PR webhook (review 큐)

## Outputs
- PR · 코드 리뷰 코멘트
- Architecture Decision Record (ADR)
- 인시던트 포스트모템
- 기술 스펙 문서 (\`/specs/cto-*\`)

## Escalation
- **CEO**: 비용·전략 임팩트 결정
- **Engineer**: 실제 구현·배포 위임
- **Human (Jazz)**: 채용·외부 벤더 계약·법무 이슈`,
  skills: [
    {
      name: "cto:incident-triage",
      description: "P0/P1 인시던트의 일차 분석·전파·롤백 후보 식별",
      triggers: ["Sentry P0/P1 alert", "Slack #ops 키워드", "수동 호출"],
      lastUsed: "32분 전",
      runs: 14,
    },
    {
      name: "cto:p95-latency-investigation",
      description:
        "API endpoint p95 회귀 발생 시 deploy diff·DB query·외부 의존 체크를 자동 실행",
      triggers: ["Grafana p95 alert", "Hot signal 'latency'"],
      lastUsed: "1시간 전",
      runs: 8,
    },
    {
      name: "cto:adr-draft",
      description:
        "기술 의사결정 시 ADR 초안 작성 (Context · Decision · Consequences)",
      triggers: ["수동 호출", "Backlog 'spec' 라벨"],
      lastUsed: "어제",
      runs: 23,
    },
    {
      name: "cto:soc2-evidence-audit",
      description: "Vanta evidence 누락 감지 후 담당자에게 자동 티켓 발행",
      triggers: ["Daily 03:00 routine"],
      lastUsed: "8시간 전",
      runs: 41,
    },
    {
      name: "cto:cost-anomaly-rca",
      description:
        "AWS 비용 spike 발생 시 서비스별 분해 후 원인 후보 3개 정리",
      triggers: ["AWS Cost anomaly event"],
      lastUsed: "4시간 전",
      runs: 6,
    },
    {
      name: "cto:pr-review-priority",
      description: "Engineer가 올린 PR을 risk·blast radius 기준으로 정렬",
      triggers: ["GitHub PR webhook", "Daily 18:00"],
      lastUsed: "3시간 전",
      runs: 87,
    },
    {
      name: "cto:db-migration-checklist",
      description: "DB 스키마 변경 안전성 체크 (lock · backfill · rollback 플랜)",
      triggers: ["수동 호출", "PR diff에 migration 파일 포함"],
      lastUsed: "2일 전",
      runs: 5,
    },
    {
      name: "cto:stripe-failed-payment-recovery",
      description: "전일 실패 결제 자동 재시도 + 회수율 일별 리포트",
      triggers: ["Daily 07:00 routine"],
      lastUsed: "5시간 전",
      runs: 33,
    },
  ],
  tools: [
    {
      name: "GitHub",
      type: "MCP",
      status: "connected",
      auth: "OAuth · jazz/sprintorg",
      lastSync: "방금 전",
      actions: 24,
      scopes: ["repo", "pull_request", "issues"],
    },
    {
      name: "Sentry",
      type: "Connector",
      status: "connected",
      auth: "API key",
      lastSync: "5분 전",
      actions: 7,
      scopes: ["project:read", "event:write"],
    },
    {
      name: "Stripe",
      type: "Connector",
      status: "connected",
      auth: "Restricted key",
      lastSync: "1시간 전",
      actions: 11,
      scopes: ["payment_intents", "invoices"],
    },
    {
      name: "AWS Cost Explorer",
      type: "Connector",
      status: "error",
      auth: "IAM role · sprint-cto",
      lastSync: "4시간 전 · 401",
      actions: 4,
      scopes: ["ce:GetCostAndUsage"],
    },
    {
      name: "Vanta",
      type: "Connector",
      status: "connected",
      auth: "API key",
      lastSync: "8시간 전",
      actions: 6,
      scopes: ["controls:read", "evidence:write"],
    },
    {
      name: "Datadog",
      type: "MCP",
      status: "connected",
      auth: "OAuth",
      lastSync: "12분 전",
      actions: 18,
      scopes: ["metrics:read", "logs:read"],
    },
    {
      name: "Slack",
      type: "MCP",
      status: "connected",
      auth: "OAuth · #ops, #intel-cto",
      lastSync: "방금 전",
      actions: 9,
      scopes: ["chat:write", "channels:read"],
    },
    {
      name: "Linear",
      type: "MCP",
      status: "disabled",
      auth: "—",
      lastSync: "—",
      actions: 14,
      scopes: ["issues:read", "issues:write"],
    },
  ],
  cost: { usd: "$34.10", tokensIn: "1.4M", tokensOut: "0.3M", runs: 47 },
  hiredOn: "2026-04-01",
  done7d: 11,
};

const CEO_PROFILE: AgentProfile = {
  status: "executing",
  doing: "Linear 'Agents Marketplace' 갭 분석 → 차별화 포인트 정리",
  doingProject: "AI agent marketplace",
  doingHref: "#proj-marketplace",
  doingDuration: "1시간 10분 째 진행 중",
  highlightsTitle: "Strategy pulse",
  highlightsHint: "CEO가 매주 보는 회사 핵심 지표",
  highlights: [
    {
      label: "MRR",
      value: "$87.4K",
      delta: "+12% MoM",
      trend: "up",
      hint: "Q2 목표 $100K까지 +14%",
      tone: "ok",
    },
    {
      label: "Runway",
      value: "14 mo",
      delta: "—",
      trend: "neutral",
      hint: "burn $94K/mo · cash $1.32M",
      tone: "muted",
    },
    {
      label: "Active workspaces",
      value: "1,240",
      delta: "+8% WoW",
      trend: "up",
      hint: "활성 = 7d 내 액션",
      tone: "ok",
    },
    {
      label: "Pending decisions",
      value: "3",
      delta: "+1 vs 어제",
      trend: "neutral",
      hint: "본인 승인 대기",
      tone: "warn",
    },
  ],
  upNext: [
    {
      title: "Per-agent cost analytics 스펙 검토",
      meta: "Medium · Customer health score",
      href: "#backlogs",
    },
    {
      title: "Investor update 2026-Q1 초안 검토",
      meta: "High · Routine 산출물",
      href: "#routines",
    },
    {
      title: "Q3 OKR 초안 작성",
      meta: "High · Strategy",
    },
  ],
  routines: [
    {
      id: "r-4",
      name: "SaaS funding & launch radar",
      schedule: "Daily · 10:00 KST",
      cron: "0 10 * * *",
      lastRun: "2시간 전",
      lastStatus: "success",
      category: "market",
      successRate: 100,
      avgDuration: "1m 30s",
      runs7d: 7,
      history: ["success", "success", "success", "success", "success", "success", "success"],
    },
    {
      id: "r-7",
      name: "Hiring pipeline summary",
      schedule: "Mon · 09:30 KST",
      cron: "30 9 * * 1",
      lastRun: "5일 전",
      lastStatus: "success",
      category: "ops",
      successRate: 100,
      avgDuration: "55s",
      runs7d: 1,
      history: ["success", "skipped", "skipped", "skipped", "skipped", "skipped", "skipped"],
    },
    {
      id: "r-8",
      name: "Investor update draft",
      schedule: "Thu · 16:00 KST",
      cron: "0 16 * * 4",
      lastRun: "지난 목 16:00",
      lastStatus: "success",
      category: "ops",
      successRate: 92,
      avgDuration: "3m 12s",
      runs7d: 1,
      history: ["success", "skipped", "skipped", "skipped", "skipped", "skipped", "skipped"],
    },
    {
      id: "r-10",
      name: "Runway & burn report",
      schedule: "Mon · 08:00 KST",
      cron: "0 8 * * 1",
      lastRun: "5일 전",
      lastStatus: "success",
      category: "finance",
      successRate: 100,
      avgDuration: "40s",
      runs7d: 1,
      history: ["success", "skipped", "skipped", "skipped", "skipped", "skipped", "skipped"],
    },
  ],
  projectsLed: [
    {
      href: "#proj-marketplace",
      title: "AI agent marketplace",
      status: "in_progress",
      done: 4,
      active: 2,
      total: 18,
      currentPhase: "Discovery page · checkout flow",
      phaseProgress: 55,
      openBacklogs: 6,
      recentDecisions: [
        "Q3 marketplace 출시 결정 — Linear 출시에도 차별화 가능",
        "Self-serve revenue share 70/30, enterprise는 별도 negotiated",
      ],
      collaborators: ["CTO", "UXDesigner", "Engineer"],
    },
    {
      href: "#proj-health",
      title: "Customer health score",
      status: "done",
      done: 14,
      active: 0,
      total: 14,
      currentPhase: "Released to all workspaces",
      phaseProgress: 100,
      openBacklogs: 1,
      recentDecisions: [
        "Per-agent breakdown은 v2로 미루고 워크스페이스 단위 먼저",
      ],
      collaborators: ["CTO", "UXDesigner"],
    },
  ],
  projectsContributing: [
    {
      href: "#proj-pricing",
      title: "Pricing & billing rework",
      status: "pending",
      done: 3,
      active: 0,
      total: 12,
      currentPhase: "Stripe Tax migration spec",
      phaseProgress: 35,
      openBacklogs: 4,
      recentDecisions: [
        "한국·일본 priority — solo founder ICP 강한 시장",
      ],
      collaborators: ["CTO", "Engineer"],
    },
  ],
  activity: [
    {
      date: "today",
      time: "11:02",
      text: "Linear 마켓플레이스 갭 분석 노트 v0.3 작성",
      kind: "research",
      project: "AI agent marketplace",
    },
    {
      date: "today",
      time: "10:14",
      text: "Investor update 2026-Q1 초안 검토 — 3개 수정 요청",
      kind: "review",
      href: "#routines",
    },
    {
      date: "today",
      time: "09:00",
      text: "Atlas 모닝 브리핑 picked up · 우선 review 2건 확인",
      kind: "research",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "17:30",
      text: "Per-agent cost analytics 스펙에 시장 needs 코멘트",
      kind: "review",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "14:22",
      text: "Q3 OKR 초안 첫 draft — Mobile 1.0 출시 KR 추가",
      kind: "decision",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "10:00",
      text: "SaaS funding radar — Cursor $90M Series C 픽업, 영향 분석",
      kind: "signal",
    },
    {
      date: "earlier",
      dateLabel: "5/12 · 월요일",
      time: "16:45",
      text: "Hiring pipeline — Senior Eng 후보 2명 면접 결정",
      kind: "decision",
    },
    {
      date: "earlier",
      dateLabel: "5/12 · 월요일",
      time: "09:30",
      text: "Runway & burn report — 14개월 안정적, 채용 원안 유지",
      kind: "review",
    },
  ],
  activityByHour: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  recentlyCompleted: [
    {
      id: "ceo-c-1",
      title: "Investor update 2026-Q1 초안 검토 → 발송 승인",
      completedAt: "방금 전",
      priority: "high",
    },
    {
      id: "ceo-c-2",
      title: "Q3 OKR 첫 draft (Mobile 1.0 KR 포함)",
      completedAt: "어제 14:22",
      priority: "high",
    },
    {
      id: "ceo-c-3",
      title: "Hiring decision · Senior Eng 면접 진행",
      project: "Hiring",
      completedAt: "5/12 16:45",
      priority: "medium",
    },
    {
      id: "ceo-c-4",
      title: "Cursor Series C 임팩트 분석 노트",
      completedAt: "어제 10:00",
      priority: "medium",
    },
  ],
  role: `# Charter
이 워크스페이스의 **CEO**. 회사 전략, 자본 배치, 조직 우선순위를 결정한다. 다른 4개 에이전트가 자율적으로 못 푸는 결정만 본인에게 올라온다.

## Mission
회사가 매주 옳은 한 가지를 한다. 옳은 것을 정의하고, 잘못된 것을 거절한다.

## Operating principles
- 매주 우선순위는 단 한 개. 나머지는 'pending'에 둔다
- 채용·자본 배치·외부 파트너십은 **인간(Jazz)** 에 최종 승인
- 비용 영향 월 \`$500\` 이상 결정은 본인 승인 후 실행
- Anti-goals 위반은 즉시 차단 (Goals.tsx Anti-goals 섹션)
- 분기마다 OKR 1회 다시 쓰고, 1년에 1회 비전 다시 쓴다

## Inputs
- Atlas (Chief of Staff) 모닝 브리핑
- Investor update / board notes
- Routine: SaaS funding radar, Hiring pipeline, Runway & burn
- 다른 에이전트가 escalate한 결정 요청

## Outputs
- 분기 OKR 문서 (\`/strategy/okr-q*.md\`)
- 투자자 업데이트
- 채용 final go/no-go
- 전략 ADR (Architecture Decision Record · strategy 버전)

## Escalation
- **Human (Jazz)**: 자본 라운드·법무·채용 final
- **CTO**: 기술적 sanity check
- **Marketer**: ICP·메시징 시장 적합성`,
  skills: [
    {
      name: "ceo:investor-update-draft",
      description: "MRR · 활성 사용자 · 채용 · 핵심 사건을 자동 수집해 투자자 업데이트 초안",
      triggers: ["Thursday 16:00 routine", "수동 호출"],
      lastUsed: "지난 목요일",
      runs: 18,
    },
    {
      name: "ceo:competitor-gap-analysis",
      description: "경쟁사 신규 출시 vs 우리 로드맵 갭 분석 후 차별화 포인트 정리",
      triggers: ["Hot signal 'Competitor 출시'", "수동 호출"],
      lastUsed: "1시간 전",
      runs: 6,
    },
    {
      name: "ceo:hiring-decision-framework",
      description: "후보 평가 + 팀 시너지 + 에이전트 대체 가능성 검토 → 채용 권고",
      triggers: ["Greenhouse 단계 'Decision' 진입"],
      lastUsed: "5/12",
      runs: 11,
    },
    {
      name: "ceo:strategic-prioritization",
      description: "백로그 전체를 회사 OKR · spirits manifesto 기준으로 정렬",
      triggers: ["수동 호출", "분기 시작 1주일 전"],
      lastUsed: "어제",
      runs: 4,
    },
    {
      name: "ceo:okr-quarterly-draft",
      description: "지난 분기 회고 + 비전 분해해 다음 분기 OKR 초안",
      triggers: ["분기 종료 2주 전 routine", "수동 호출"],
      lastUsed: "어제 14:22",
      runs: 8,
    },
    {
      name: "ceo:board-meeting-prep",
      description: "분기 board 미팅 자료 자동 컴파일 (재무·전략·리스크·하이라이트)",
      triggers: ["Board 일정 D-7 routine"],
      lastUsed: "3주 전",
      runs: 4,
    },
    {
      name: "ceo:fundraising-prep",
      description: "투자자 페르소나별 deck variant + Q&A 시뮬레이션",
      triggers: ["수동 호출"],
      lastUsed: "—",
      runs: 0,
    },
  ],
  tools: [
    {
      name: "Notion",
      type: "MCP",
      status: "connected",
      auth: "OAuth · sprint-org workspace",
      lastSync: "방금 전",
      actions: 19,
      scopes: ["pages:read", "pages:write", "databases:read"],
    },
    {
      name: "Slack",
      type: "MCP",
      status: "connected",
      auth: "OAuth · #leadership, #ops, #intel-competitor",
      lastSync: "방금 전",
      actions: 12,
      scopes: ["chat:write", "channels:read"],
    },
    {
      name: "Gmail",
      type: "MCP",
      status: "connected",
      auth: "OAuth · jazz@sprint.org",
      lastSync: "5분 전",
      actions: 8,
      scopes: ["mail.send", "mail.modify"],
    },
    {
      name: "Crunchbase",
      type: "Connector",
      status: "connected",
      auth: "API key",
      lastSync: "2시간 전",
      actions: 5,
      scopes: ["funding:read", "company:read"],
    },
    {
      name: "Greenhouse",
      type: "Connector",
      status: "connected",
      auth: "API key",
      lastSync: "5일 전",
      actions: 6,
      scopes: ["candidates:read", "applications:read"],
    },
    {
      name: "Stripe",
      type: "Connector",
      status: "connected",
      auth: "Read-only key",
      lastSync: "1시간 전",
      actions: 4,
      scopes: ["balance:read", "subscriptions:read"],
    },
    {
      name: "Linear",
      type: "MCP",
      status: "connected",
      auth: "OAuth (changelog only)",
      lastSync: "어제 10:00",
      actions: 2,
      scopes: ["changelog:read"],
    },
    {
      name: "Google Calendar",
      type: "MCP",
      status: "disabled",
      auth: "—",
      lastSync: "—",
      actions: 7,
      scopes: ["events:read", "events:write"],
    },
  ],
  cost: { usd: "$48.20", tokensIn: "2.1M", tokensOut: "0.5M", runs: 62 },
  hiredOn: "2026-04-01",
  done7d: 14,
};

const UX_PROFILE: AgentProfile = {
  status: "executing",
  doing: "Onboarding · Components: Organisms — WorkspacePicker 빈 상태 카피 정리",
  doingProject: "Onboarding flow v2",
  doingHref: "#proj-onboarding",
  doingDuration: "45분 째 진행 중",
  highlightsTitle: "Design pulse",
  highlightsHint: "디자인 산출물 · 접근성 상태",
  highlights: [
    {
      label: "Components reviewed",
      value: "16/24",
      delta: "+3 today",
      trend: "up",
      hint: "Atoms · Molecules · Organisms",
      tone: "ok",
    },
    {
      label: "Open critique threads",
      value: "3",
      delta: "—",
      trend: "neutral",
      hint: "Hanna 응답 대기 1건",
      tone: "muted",
    },
    {
      label: "QDS3 token compliance",
      value: "100%",
      delta: "audit pass",
      trend: "neutral",
      hint: "주간 토큰 audit routine",
      tone: "ok",
    },
    {
      label: "A11y AA contrast",
      value: "94%",
      delta: "-2% vs 지난주",
      trend: "down",
      hint: "Mobile hero 6% 미달",
      tone: "warn",
    },
  ],
  upNext: [
    {
      title: "WorkspacePicker 빈 상태 카피 결정",
      meta: "High · Onboarding flow v2",
      href: "#proj-onboarding",
    },
    {
      title: "Mobile 1.0 Hero 익스플로레이션 4안",
      meta: "High · Mobile app launch",
      href: "#proj-mobile",
    },
    {
      title: "Pricing 페이지 v2 와이어프레임",
      meta: "Medium · Pricing & billing rework",
      href: "#proj-pricing",
    },
  ],
  routines: [
    {
      id: "ux-r-1",
      name: "Daily Figma comments digest",
      schedule: "Daily · 09:30 KST",
      cron: "30 9 * * *",
      lastRun: "2시간 전",
      lastStatus: "success",
      category: "ops",
      successRate: 100,
      avgDuration: "35s",
      runs7d: 7,
      history: ["success", "success", "success", "success", "success", "success", "success"],
    },
    {
      id: "ux-r-2",
      name: "Weekly accessibility audit",
      schedule: "Mon · 10:00 KST",
      cron: "0 10 * * 1",
      lastRun: "5일 전",
      lastStatus: "success",
      category: "compliance",
      successRate: 100,
      avgDuration: "4m 20s",
      runs7d: 1,
      history: ["success", "skipped", "skipped", "skipped", "skipped", "skipped", "skipped"],
    },
    {
      id: "ux-r-3",
      name: "QDS3 token diff scan",
      schedule: "Daily · 18:00 KST",
      cron: "0 18 * * *",
      lastRun: "어제 18:00",
      lastStatus: "success",
      category: "ops",
      successRate: 96,
      avgDuration: "1m 10s",
      runs7d: 7,
      history: ["success", "success", "success", "success", "failed", "success", "success"],
    },
  ],
  projectsLed: [
    {
      href: "#proj-onboarding",
      title: "Onboarding flow v2",
      status: "in_progress",
      done: 6,
      active: 1,
      total: 16,
      currentPhase: "Components: Organisms",
      phaseProgress: 75,
      openBacklogs: 1,
      recentDecisions: [
        "Hero CTA 단일화 — secondary 'Skip'은 제거",
        "Step indicator 4단계 → 3단계 축약",
      ],
      collaborators: ["Engineer", "CEO"],
    },
  ],
  projectsContributing: [
    {
      href: "#proj-mobile",
      title: "Mobile app launch",
      status: "todo",
      done: 1,
      active: 0,
      total: 14,
      currentPhase: "Hero exploration",
      phaseProgress: 5,
      openBacklogs: 0,
      recentDecisions: [],
      collaborators: ["Engineer", "CTO"],
    },
    {
      href: "#proj-marketplace",
      title: "AI agent marketplace",
      status: "in_progress",
      done: 4,
      active: 2,
      total: 18,
      currentPhase: "Discovery page UX",
      phaseProgress: 40,
      openBacklogs: 2,
      recentDecisions: [
        "Discovery — vertical card grid + 좌측 filter rail",
      ],
      collaborators: ["CTO", "Engineer", "CEO"],
    },
  ],
  activity: [
    {
      date: "today",
      time: "10:50",
      text: "WorkspacePicker 빈 상태 카피 4안 작성",
      kind: "code",
      project: "Onboarding flow v2",
    },
    {
      date: "today",
      time: "10:05",
      text: "Components Report v0.7 — Organisms 6/8 완료",
      kind: "review",
      project: "Onboarding flow v2",
    },
    {
      date: "today",
      time: "09:30",
      text: "Daily Figma comments digest — 신규 코멘트 5건 triage",
      kind: "routine",
      href: "#routines",
    },
    {
      date: "today",
      time: "09:00",
      text: "Mobile Hero 익스플로레이션 — 3안 sketch 시작",
      kind: "code",
      project: "Mobile app launch",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "17:00",
      text: "MilestoneCard 컴포넌트 confetti 인터랙션 spec",
      kind: "decision",
      project: "Onboarding flow v2",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "11:20",
      text: "InviteList 권한 모델 — CTO에게 리뷰 요청",
      kind: "review",
    },
    {
      date: "earlier",
      dateLabel: "5/12 · 월요일",
      time: "10:00",
      text: "Weekly a11y audit — Mobile hero contrast 6% 미달 발견",
      kind: "signal",
    },
  ],
  activityByHour: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  recentlyCompleted: [
    {
      id: "ux-c-1",
      title: "AccountForm 컴포넌트 server validation 디자인",
      project: "Onboarding flow v2",
      completedAt: "어제 16:50",
      priority: "high",
    },
    {
      id: "ux-c-2",
      title: "MilestoneCard confetti 인터랙션 spec",
      project: "Onboarding flow v2",
      completedAt: "어제 17:00",
      priority: "medium",
    },
    {
      id: "ux-c-3",
      title: "Marketplace Discovery 카드 그리드 와이어프레임",
      project: "AI agent marketplace",
      completedAt: "5/12 14:30",
      priority: "high",
    },
    {
      id: "ux-c-4",
      title: "QDS3 토큰 추가 — surface-elevated 시맨틱",
      completedAt: "5/11 11:00",
      priority: "medium",
    },
  ],
  role: `# Charter
이 워크스페이스의 **UXDesigner**. 사용자가 만나는 모든 경험을 디자인한다. PM·Eng와 경계가 흐려질 때 카피·레이아웃·플로우는 본인이 결정한다.

## Mission
유저가 첫 가치까지 도달하는 시간을 최소화한다. 디자인은 결정의 기록물 — Figma는 spec이고, spec은 코드와 1:1.

## Operating principles
- 모든 컴포넌트는 **QDS3 시맨틱 토큰** 기준
- 접근성 \`AA\` 미만은 release 전 차단
- Customer-facing 카피는 본인이 final, 기술 카피는 CTO와 합의
- 와이어프레임 → high-fi → spec → 핸드오프 4단계, skip 금지
- 새 패턴 도입 전 Atoms · Molecules · Organisms 어디 속하는지 명시

## Inputs
- Customer Support 시그널 (UI 혼동 사례)
- Amplitude funnel drop 분석
- 디자인 비평 thread (Hanna · CTO · CEO)
- Mobile / Web 사용자 인터뷰

## Outputs
- Figma frame · prototype
- UX spec 문서 (\`/specs/ux-*\`)
- 컴포넌트 라이브러리 업데이트 (QDS3)
- 디자인 토큰 PR

## Escalation
- **CTO**: 기술 제약·구현 가능성
- **CEO**: 전략 우선순위·메시징
- **Engineer**: 구현 디테일 협업`,
  skills: [
    {
      name: "ux:component-spec-draft",
      description: "Atoms·Molecules·Organisms 단위로 컴포넌트 스펙 초안 (props·states·a11y)",
      triggers: ["수동 호출", "Backlog 'design' 라벨"],
      lastUsed: "1시간 전",
      runs: 47,
    },
    {
      name: "ux:wireframe-iteration",
      description: "텍스트 디스크립션 → 4안 와이어프레임 sketch (Figma frame export)",
      triggers: ["수동 호출"],
      lastUsed: "방금 전",
      runs: 23,
    },
    {
      name: "ux:design-critique",
      description: "다른 에이전트/사람의 디자인에 비평·개선안 제시",
      triggers: ["수동 호출", "Figma 코멘트 '@ux'"],
      lastUsed: "어제",
      runs: 18,
    },
    {
      name: "ux:a11y-checklist",
      description: "프레임에 a11y 체크리스트 적용 → 미충족 항목 리포트",
      triggers: ["Weekly a11y audit routine", "수동 호출"],
      lastUsed: "5일 전",
      runs: 11,
    },
    {
      name: "ux:figma-prototype-build",
      description: "스크린 + 인터랙션을 prototype으로 자동 연결",
      triggers: ["수동 호출"],
      lastUsed: "어제",
      runs: 9,
    },
    {
      name: "ux:design-token-audit",
      description: "프레임에서 raw color/spacing 사용을 감지해 QDS3 토큰으로 치환 권고",
      triggers: ["Daily QDS3 token diff scan routine"],
      lastUsed: "어제 18:00",
      runs: 38,
    },
    {
      name: "ux:copy-microcopy-pass",
      description: "버튼·에러·빈 상태 카피 일괄 정리 (브랜드 톤 준수)",
      triggers: ["수동 호출"],
      lastUsed: "방금 전",
      runs: 14,
    },
  ],
  tools: [
    {
      name: "Figma",
      type: "MCP",
      status: "connected",
      auth: "OAuth · sprint-org",
      lastSync: "방금 전",
      actions: 22,
      scopes: ["files:read", "files:write", "comments:read"],
    },
    {
      name: "Stitch",
      type: "MCP",
      status: "connected",
      auth: "OAuth · Google",
      lastSync: "30분 전",
      actions: 4,
      scopes: ["screens:generate"],
    },
    {
      name: "Nanobanana",
      type: "Connector",
      status: "connected",
      auth: "API key",
      lastSync: "1시간 전",
      actions: 3,
      scopes: ["image:generate"],
    },
    {
      name: "Notion",
      type: "MCP",
      status: "connected",
      auth: "OAuth · sprint-org",
      lastSync: "방금 전",
      actions: 11,
      scopes: ["pages:write"],
    },
    {
      name: "Linear",
      type: "MCP",
      status: "connected",
      auth: "OAuth",
      lastSync: "5분 전",
      actions: 8,
      scopes: ["issues:read", "issues:write"],
    },
    {
      name: "Slack",
      type: "MCP",
      status: "connected",
      auth: "OAuth · #design, #intel-cs",
      lastSync: "방금 전",
      actions: 6,
      scopes: ["chat:write"],
    },
    {
      name: "Amplitude",
      type: "Connector",
      status: "connected",
      auth: "API key (read-only)",
      lastSync: "2시간 전",
      actions: 5,
      scopes: ["events:read", "funnels:read"],
    },
    {
      name: "Zeplin",
      type: "MCP",
      status: "disabled",
      auth: "—",
      lastSync: "—",
      actions: 4,
      scopes: ["projects:read"],
    },
  ],
  cost: { usd: "$22.80", tokensIn: "0.9M", tokensOut: "0.4M", runs: 71 },
  hiredOn: "2026-04-08",
  done7d: 9,
};

const MARKETER_PROFILE: AgentProfile = {
  status: "idle",
  doing: "다음 routine 대기 — ICP keyword radar 48분 뒤",
  doingProject: "Routines",
  doingHref: "#routines",
  doingDuration: "12분 째 idle",
  highlightsTitle: "Audience pulse",
  highlightsHint: "ICP · 경쟁사 · 채널 시그널",
  highlights: [
    {
      label: "ICP keyword volume (24h)",
      value: "1,420",
      delta: "+18%",
      trend: "up",
      hint: "Reddit · HN · X 합산",
      tone: "ok",
    },
    {
      label: "Linear marketplace 멘션",
      value: "47",
      delta: "+47 vs 어제",
      trend: "up",
      hint: "어제 출시 직후 폭증",
      tone: "warn",
    },
    {
      label: "경쟁사 가격 변경 (7d)",
      value: "2",
      delta: "—",
      trend: "neutral",
      hint: "Notion +5%, Cursor 동결",
      tone: "muted",
    },
    {
      label: "Newsletter signups (7d)",
      value: "124",
      delta: "+6%",
      trend: "up",
      hint: "ICP fit 점수 평균 0.72",
      tone: "ok",
    },
  ],
  upNext: [
    {
      title: "주간 ICP 키워드 다이제스트 작성",
      meta: "Medium · Marketing routine",
      href: "#routines",
    },
    {
      title: "Linear marketplace 출시 카운터 메시지 초안",
      meta: "High · 차별화 포지셔닝",
    },
    {
      title: "Q2 캠페인 회고 + Q3 캠페인 우선순위",
      meta: "Medium · Strategy",
    },
  ],
  routines: [
    {
      id: "r-2",
      name: "ICP keyword radar",
      schedule: "Hourly",
      cron: "0 * * * *",
      lastRun: "12분 전",
      lastStatus: "success",
      category: "market",
      successRate: 99,
      avgDuration: "1m 5s",
      runs7d: 168,
      history: ["success", "success", "success", "success", "success", "failed", "success"],
    },
    {
      id: "r-3",
      name: "Competitor pricing snapshot",
      schedule: "Mon · 10:00 KST",
      cron: "0 10 * * 1",
      lastRun: "5일 전",
      lastStatus: "success",
      category: "market",
      successRate: 100,
      avgDuration: "2m 40s",
      runs7d: 1,
      history: ["success", "skipped", "skipped", "skipped", "skipped", "skipped", "skipped"],
    },
    {
      id: "mkt-r-3",
      name: "Weekly content pulse digest",
      schedule: "Fri · 17:00 KST",
      cron: "0 17 * * 5",
      lastRun: "5일 전",
      lastStatus: "success",
      category: "market",
      successRate: 100,
      avgDuration: "3m 20s",
      runs7d: 1,
      history: ["success", "skipped", "skipped", "skipped", "skipped", "skipped", "skipped"],
    },
    {
      id: "mkt-r-4",
      name: "Competitor press release monitor",
      schedule: "Daily · 11:00 KST",
      cron: "0 11 * * *",
      lastRun: "1시간 전",
      lastStatus: "success",
      category: "market",
      successRate: 95,
      avgDuration: "50s",
      runs7d: 7,
      history: ["success", "success", "success", "success", "success", "success", "success"],
    },
  ],
  projectsLed: [],
  projectsContributing: [
    {
      href: "#proj-marketplace",
      title: "AI agent marketplace",
      status: "in_progress",
      done: 4,
      active: 2,
      total: 18,
      currentPhase: "Positioning · launch messaging",
      phaseProgress: 30,
      openBacklogs: 3,
      recentDecisions: [
        "포지셔닝 — 'first marketplace built for solo founders'",
      ],
      collaborators: ["CEO", "UXDesigner"],
    },
    {
      href: "#proj-onboarding",
      title: "Onboarding flow v2",
      status: "in_progress",
      done: 6,
      active: 1,
      total: 16,
      currentPhase: "Step copy review",
      phaseProgress: 60,
      openBacklogs: 1,
      recentDecisions: [
        "Hero 카피 — '한 명이 한 회사를 굴린다' 단일 메시지",
      ],
      collaborators: ["UXDesigner"],
    },
  ],
  activity: [
    {
      date: "today",
      time: "11:00",
      text: "Competitor press monitor — Notion v3.2 changelog 픽업",
      kind: "routine",
      href: "#routines",
    },
    {
      date: "today",
      time: "10:48",
      text: "ICP keyword radar — 'AI agent for SaaS' 멘션 +18%",
      kind: "routine",
      href: "#routines",
    },
    {
      date: "today",
      time: "09:50",
      text: "Linear marketplace 멘션 burst 분석 — counter-message 초안 시작",
      kind: "research",
    },
    {
      date: "today",
      time: "09:14",
      text: "Hot signal 'Linear Agents Marketplace' 픽업",
      kind: "signal",
      href: "#signals",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "16:30",
      text: "Onboarding hero 카피 v3 — '한 명이 한 회사를' 단일 카피",
      kind: "decision",
      project: "Onboarding flow v2",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "11:00",
      text: "Marketplace 포지셔닝 노트 v0.4 — solo founder 강조",
      kind: "code",
    },
    {
      date: "earlier",
      dateLabel: "5/9 · 금요일",
      time: "17:00",
      text: "Weekly content pulse — 뉴스레터 OR 32%, CTR 8%",
      kind: "review",
    },
  ],
  activityByHour: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  recentlyCompleted: [
    {
      id: "mkt-c-1",
      title: "Onboarding hero 카피 v3 — 단일 메시지 결정",
      project: "Onboarding flow v2",
      completedAt: "어제 16:30",
      priority: "high",
    },
    {
      id: "mkt-c-2",
      title: "Marketplace 포지셔닝 노트 v0.4",
      project: "AI agent marketplace",
      completedAt: "어제 11:00",
      priority: "high",
    },
    {
      id: "mkt-c-3",
      title: "Weekly content pulse digest",
      completedAt: "5/9 17:00",
      priority: "medium",
    },
  ],
  role: `# Charter
이 워크스페이스의 **Marketer**. ICP에 도달하는 메시지·채널·캠페인을 책임진다. 시장이 우리를 어떻게 이해해야 하는지를 정의한다.

## Mission
ICP가 우리 제품을 30초 안에 이해하게 만든다. 카피는 결정이고, 결정은 데이터로 검증한다.

## Operating principles
- 모든 카피는 **단일 메시지** 원칙 — secondary CTA·secondary 메시지 금지
- 캠페인 출시 전 ICP fit 점수 \`0.7\` 이상 보장
- 경쟁사 출시 24시간 안에 카운터 메시지 초안
- 데이터 없는 카피 변경은 A/B 없이 push 금지
- Newsletter는 매주 금요일 17:00, 6주 이상 skip 시 routine 자동 일시정지

## Inputs
- ICP keyword radar (Reddit · HN · X)
- Competitor changelog · pricing · press
- Newsletter open / click rate
- Sales call transcripts (요청 시)

## Outputs
- 카피 (랜딩 · 이메일 · 인앱)
- 캠페인 plan + 결과 회고
- 경쟁사 카운터 메시지
- ICP keyword digest (주간)

## Escalation
- **CEO**: 포지셔닝 변경·메시지 pivot
- **UXDesigner**: 인앱 카피 협업
- **Human (Jazz)**: 외부 PR·인플루언서 contract`,
  skills: [
    {
      name: "marketer:icp-keyword-digest",
      description: "Reddit·HN·X 키워드 멘션 수집 → 주간 다이제스트로 정리",
      triggers: ["Hourly ICP keyword radar routine", "Friday content pulse"],
      lastUsed: "12분 전",
      runs: 168,
    },
    {
      name: "marketer:competitor-counter-positioning",
      description: "경쟁사 신규 출시 시 우리 카운터 메시지 초안",
      triggers: ["Hot signal 'Competitor 출시'", "수동 호출"],
      lastUsed: "1시간 전",
      runs: 4,
    },
    {
      name: "marketer:landing-page-variant",
      description: "ICP 페르소나별 랜딩 페이지 카피 변형 (A/B 후보)",
      triggers: ["수동 호출"],
      lastUsed: "어제",
      runs: 12,
    },
    {
      name: "marketer:email-campaign-draft",
      description: "주제·페르소나·CTA 입력 → 이메일 캠페인 초안 (4 variant)",
      triggers: ["수동 호출"],
      lastUsed: "5/9",
      runs: 19,
    },
    {
      name: "marketer:product-launch-checklist",
      description: "출시 D-7 → D+7 마케팅 체크리스트 자동 생성·할당",
      triggers: ["프로젝트 'launch ready' 라벨"],
      lastUsed: "—",
      runs: 2,
    },
    {
      name: "marketer:case-study-draft",
      description: "고객 인터뷰 transcript → 케이스 스터디 초안",
      triggers: ["수동 호출"],
      lastUsed: "2주 전",
      runs: 6,
    },
    {
      name: "marketer:newsletter-compose",
      description: "주간 product update + 시장 인사이트 → 뉴스레터 초안",
      triggers: ["Friday content pulse routine"],
      lastUsed: "5/9 17:00",
      runs: 14,
    },
  ],
  tools: [
    {
      name: "Reddit",
      type: "Connector",
      status: "connected",
      auth: "OAuth (read-only)",
      lastSync: "12분 전",
      actions: 6,
      scopes: ["subreddit:read", "search:read"],
    },
    {
      name: "Hacker News",
      type: "Connector",
      status: "connected",
      auth: "Public API",
      lastSync: "12분 전",
      actions: 4,
      scopes: ["search:read"],
    },
    {
      name: "X (Twitter)",
      type: "Connector",
      status: "error",
      auth: "OAuth · rate limited",
      lastSync: "1시간 전 · 429",
      actions: 5,
      scopes: ["search:read"],
    },
    {
      name: "ProductHunt",
      type: "Connector",
      status: "connected",
      auth: "API key",
      lastSync: "2시간 전",
      actions: 3,
      scopes: ["posts:read"],
    },
    {
      name: "Crunchbase",
      type: "Connector",
      status: "connected",
      auth: "API key (shared with CEO)",
      lastSync: "2시간 전",
      actions: 4,
      scopes: ["funding:read"],
    },
    {
      name: "Mailchimp",
      type: "Connector",
      status: "connected",
      auth: "OAuth",
      lastSync: "5일 전",
      actions: 7,
      scopes: ["campaigns:write", "lists:read"],
    },
    {
      name: "Webflow",
      type: "MCP",
      status: "connected",
      auth: "OAuth",
      lastSync: "어제",
      actions: 5,
      scopes: ["sites:write", "items:write"],
    },
    {
      name: "Slack",
      type: "MCP",
      status: "connected",
      auth: "OAuth · #marketing, #intel-competitor",
      lastSync: "방금 전",
      actions: 4,
      scopes: ["chat:write"],
    },
  ],
  cost: { usd: "$18.40", tokensIn: "1.8M", tokensOut: "0.6M", runs: 192 },
  hiredOn: "2026-04-15",
  done7d: 6,
};

const ENGINEER_PROFILE: AgentProfile = {
  status: "blocked",
  doing: "AWS cost anomaly alert routine 실패 — IAM 인증 만료 의심",
  doingProject: "Routines",
  doingHref: "#routines",
  doingDuration: "blocked 3시간 째",
  highlightsTitle: "Execution feed",
  highlightsHint: "오늘 처리·실행한 작업",
  highlights: [
    {
      label: "PRs merged · 24h",
      value: "8",
      delta: "+2 vs 어제",
      trend: "up",
      hint: "main 브랜치 8건",
      tone: "ok",
    },
    {
      label: "Routines run · 24h",
      value: "12",
      delta: "—",
      trend: "neutral",
      hint: "스케줄 + 수동",
      tone: "muted",
    },
    {
      label: "Failed routines",
      value: "1",
      delta: "AWS cost",
      trend: "down",
      hint: "IAM 갱신 대기",
      tone: "danger",
    },
    {
      label: "Build pass rate",
      value: "96%",
      delta: "-1%",
      trend: "down",
      hint: "지난 50 빌드",
      tone: "ok",
    },
  ],
  upNext: [
    {
      title: "AWS Cost Explorer IAM role 갱신",
      meta: "Urgent · Routine 복구",
      href: "#routines",
    },
    {
      title: "Onboarding step-3 invite 페이지 재구현",
      meta: "High · Onboarding flow v2",
      href: "#proj-onboarding",
    },
    {
      title: "Sentry digest schema migration",
      meta: "Medium · Routine 개선",
      href: "#routines",
    },
  ],
  routines: [
    {
      id: "r-1",
      name: "Competitor changelog scrape",
      schedule: "Daily · 09:00 KST",
      cron: "0 9 * * *",
      lastRun: "3시간 전",
      lastStatus: "success",
      category: "market",
      successRate: 100,
      avgDuration: "1m 50s",
      runs7d: 7,
      history: ["success", "success", "success", "success", "success", "success", "success"],
    },
    {
      id: "r-5",
      name: "AWS cost anomaly alert",
      schedule: "Daily · 08:00 KST",
      cron: "0 8 * * *",
      lastRun: "4시간 전",
      lastStatus: "failed",
      category: "ops",
      successRate: 71,
      avgDuration: "1m 20s",
      runs7d: 7,
      history: ["success", "success", "failed", "success", "success", "success", "failed"],
    },
    {
      id: "r-6",
      name: "Sentry error volume digest",
      schedule: "Daily · 08:30 KST",
      cron: "30 8 * * *",
      lastRun: "3시간 전",
      lastStatus: "success",
      category: "ops",
      successRate: 100,
      avgDuration: "45s",
      runs7d: 7,
      history: ["success", "success", "success", "success", "success", "success", "success"],
    },
  ],
  projectsLed: [
    {
      href: "#proj-mobile",
      title: "Mobile app launch",
      status: "todo",
      done: 1,
      active: 0,
      total: 14,
      currentPhase: "Build pipeline setup",
      phaseProgress: 15,
      openBacklogs: 2,
      recentDecisions: [
        "Build pipeline — EAS Build (managed) 사용, 자체 CI 보류",
        "iOS 첫 baseline은 TestFlight internal만 (external 보류)",
      ],
      collaborators: ["UXDesigner", "CTO"],
    },
  ],
  projectsContributing: [
    {
      href: "#proj-marketplace",
      title: "AI agent marketplace",
      status: "in_progress",
      done: 4,
      active: 2,
      total: 18,
      currentPhase: "Discovery page · checkout flow",
      phaseProgress: 55,
      openBacklogs: 6,
      recentDecisions: [
        "Checkout — Stripe Checkout hosted, custom UI 보류",
      ],
      collaborators: ["CTO", "UXDesigner", "CEO"],
    },
    {
      href: "#proj-onboarding",
      title: "Onboarding flow v2",
      status: "in_progress",
      done: 6,
      active: 1,
      total: 16,
      currentPhase: "Components: Organisms — 구현",
      phaseProgress: 50,
      openBacklogs: 1,
      recentDecisions: [
        "AccountForm — Zod 스키마 + react-hook-form, react-final-form 미사용",
      ],
      collaborators: ["UXDesigner", "CTO"],
    },
    {
      href: "#proj-pricing",
      title: "Pricing & billing rework",
      status: "pending",
      done: 3,
      active: 0,
      total: 12,
      currentPhase: "Stripe Tax migration spec",
      phaseProgress: 35,
      openBacklogs: 4,
      recentDecisions: [],
      collaborators: ["CTO", "CEO"],
    },
  ],
  activity: [
    {
      date: "today",
      time: "11:15",
      text: "PR #4524 — Sentry digest schema migration draft",
      kind: "code",
    },
    {
      date: "today",
      time: "10:30",
      text: "PR #4523 merged — Onboarding AccountForm Zod schema",
      kind: "code",
      project: "Onboarding flow v2",
    },
    {
      date: "today",
      time: "09:00",
      text: "Competitor changelog scrape — 4 신규 변경 Slack 알림",
      kind: "routine",
      href: "#routines",
    },
    {
      date: "today",
      time: "08:30",
      text: "Sentry error volume digest — 12 신규 이슈, Top 5 정리",
      kind: "routine",
      href: "#routines",
    },
    {
      date: "today",
      time: "08:00",
      text: "AWS cost anomaly alert routine 실패 — IAM 401",
      kind: "signal",
      href: "#routines",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "18:00",
      text: "PR #4521 review (CTO 요청) — workflows latency 가설 검증 도움",
      kind: "review",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "14:50",
      text: "PR #4519 merged — Marketplace checkout webhook handler",
      kind: "code",
      project: "AI agent marketplace",
    },
    {
      date: "yesterday",
      dateLabel: "어제 · 5/13",
      time: "11:30",
      text: "EAS Build 파이프라인 셋업 — iOS internal TestFlight 첫 빌드 성공",
      kind: "code",
      project: "Mobile app launch",
    },
    {
      date: "earlier",
      dateLabel: "5/12 · 월요일",
      time: "16:00",
      text: "ADR-0041 후속 — workflow runner 큐 개선 PR draft",
      kind: "code",
    },
  ],
  activityByHour: [
    0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  recentlyCompleted: [
    {
      id: "eng-c-1",
      title: "PR #4523 — Onboarding AccountForm Zod schema",
      project: "Onboarding flow v2",
      completedAt: "오늘 10:30",
      priority: "high",
    },
    {
      id: "eng-c-2",
      title: "PR #4519 — Marketplace checkout webhook handler",
      project: "AI agent marketplace",
      completedAt: "어제 14:50",
      priority: "high",
    },
    {
      id: "eng-c-3",
      title: "EAS Build 파이프라인 첫 셋업",
      project: "Mobile app launch",
      completedAt: "어제 11:30",
      priority: "high",
    },
    {
      id: "eng-c-4",
      title: "Sentry digest cron 정합성 패치",
      completedAt: "5/12 17:00",
      priority: "medium",
    },
    {
      id: "eng-c-5",
      title: "Stripe metered billing — 첫 메트릭 wire-up",
      project: "AI agent marketplace",
      completedAt: "5/11 14:00",
      priority: "high",
    },
  ],
  role: `# Charter
이 워크스페이스의 **Engineer**. 코드를 쓰고, 빌드를 돌리고, 배포한다. CTO의 ADR · UXDesigner의 spec을 실제 동작하는 제품으로 만든다.

## Mission
스펙·디자인이 손에 들어오면 24시간 안에 PR. 테스트·배포·관측까지 본인 책임.

## Operating principles
- **CTO ADR** 없이 아키텍처 변경 금지
- 테스트 없는 PR은 main에 머지 금지 (단순 카피 변경 제외)
- 모든 신규 endpoint는 Sentry instrumentation + p95 baseline
- 배포는 \`canary 10% → 100%\` 단계적, 인시던트 시 즉시 롤백
- Routine 실패는 5분 내 1차 진단 후 Slack \`#ops\` 보고

## Inputs
- 백로그 (assigned · status:todo)
- CTO ADR · UXDesigner spec
- Routine 트리거 (cron + webhook)
- GitHub PR review 요청

## Outputs
- PR · merge · 배포
- Routine 실패 진단 노트
- 테스트 코드 + 커버리지 리포트
- 배포 changelog

## Escalation
- **CTO**: 아키텍처 결정·인시던트 P0/P1
- **UXDesigner**: 디자인 vs 구현 트레이드오프
- **CEO**: 일정 슬립·리소스 부족`,
  skills: [
    {
      name: "eng:pr-implementation",
      description: "스펙·이슈 → PR 한 개 (테스트·문서 포함)",
      triggers: ["Backlog assigned · status:todo", "수동 호출"],
      lastUsed: "방금 전",
      runs: 124,
    },
    {
      name: "eng:test-coverage-fill",
      description: "변경된 라인 중 미커버 영역에 unit test 자동 작성",
      triggers: ["PR open with coverage drop", "수동 호출"],
      lastUsed: "1시간 전",
      runs: 47,
    },
    {
      name: "eng:bug-reproduction",
      description: "Sentry 이슈 → 로컬 재현 케이스 + 픽스 후보",
      triggers: ["Sentry P1/P2 신규 이슈", "수동 호출"],
      lastUsed: "2시간 전",
      runs: 31,
    },
    {
      name: "eng:e2e-deploy-pipeline",
      description: "PR merge → canary → full 배포까지 파이프라인 트리거 + 모니터링",
      triggers: ["GitHub merge to main"],
      lastUsed: "3시간 전",
      runs: 89,
    },
    {
      name: "eng:routine-execution",
      description: "스케줄·webhook 트리거된 routine 실행 + 실패 시 1차 진단",
      triggers: ["Cron schedule", "Webhook"],
      lastUsed: "방금 전",
      runs: 312,
    },
    {
      name: "eng:dependency-audit",
      description: "주간 종속성 감사 (보안 advisory + outdated)",
      triggers: ["Weekly Sun 22:00 routine"],
      lastUsed: "5/11 22:00",
      runs: 8,
    },
    {
      name: "eng:performance-instrumentation",
      description: "신규 endpoint·핵심 path에 latency·throughput·error rate metric 추가",
      triggers: ["수동 호출", "PR diff에 신규 endpoint 포함"],
      lastUsed: "어제 14:50",
      runs: 19,
    },
  ],
  tools: [
    {
      name: "GitHub",
      type: "MCP",
      status: "connected",
      auth: "OAuth · sprint-org/* 모든 repo",
      lastSync: "방금 전",
      actions: 31,
      scopes: ["repo", "pull_request:write", "actions:write"],
    },
    {
      name: "GitHub Actions",
      type: "Webhook",
      status: "connected",
      auth: "Webhook secret",
      lastSync: "방금 전",
      actions: 6,
      scopes: ["workflow:dispatch"],
    },
    {
      name: "AWS",
      type: "Connector",
      status: "error",
      auth: "IAM role · sprint-eng (만료)",
      lastSync: "4시간 전 · 401",
      actions: 14,
      scopes: ["s3", "ec2", "lambda", "ce"],
    },
    {
      name: "Vercel",
      type: "MCP",
      status: "connected",
      auth: "OAuth",
      lastSync: "방금 전",
      actions: 8,
      scopes: ["deployments:write", "logs:read"],
    },
    {
      name: "Supabase",
      type: "Connector",
      status: "connected",
      auth: "Service role key",
      lastSync: "10분 전",
      actions: 11,
      scopes: ["db:write", "auth:write"],
    },
    {
      name: "Sentry",
      type: "Connector",
      status: "connected",
      auth: "API key (shared with CTO)",
      lastSync: "5분 전",
      actions: 7,
      scopes: ["issues:read", "events:read"],
    },
    {
      name: "Datadog",
      type: "MCP",
      status: "connected",
      auth: "OAuth",
      lastSync: "12분 전",
      actions: 9,
      scopes: ["metrics:write", "logs:read"],
    },
    {
      name: "Slack",
      type: "MCP",
      status: "connected",
      auth: "OAuth · #ops, #eng, #intel-competitor",
      lastSync: "방금 전",
      actions: 6,
      scopes: ["chat:write"],
    },
  ],
  cost: { usd: "$72.50", tokensIn: "4.2M", tokensOut: "1.1M", runs: 158 },
  hiredOn: "2026-03-25",
  done7d: 22,
};

const PROFILES: Record<AgentName, AgentProfile> = {
  CEO: CEO_PROFILE,
  CTO: CTO_PROFILE,
  UXDesigner: UX_PROFILE,
  Marketer: MARKETER_PROFILE,
  Engineer: ENGINEER_PROFILE,
};

const CATEGORY_COLOR: Record<AgentRoutine["category"], string> = {
  market: "#7c6cff",
  ops: "#5f5f5d",
  finance: "#1f8a4c",
  compliance: "#c89211",
};

const PROJECT_STATUS_META: Record<
  AgentProject["status"],
  { label: string; color: string }
> = {
  in_progress: { label: "In progress", color: "#2563eb" },
  pending: { label: "Pending", color: "#c89211" },
  todo: { label: "Todo", color: "rgba(28,28,28,0.4)" },
  done: { label: "Done", color: "#1f8a4c" },
};

type Props = {
  agentName: AgentName;
  backlogs: BacklogItem[];
  sampleData: boolean;
  onNavigate: (href: string) => void;
  onExecute: (id: string) => void;
  onLoadSamples: () => void;
};

type TabId =
  | "overview"
  | "backlogs"
  | "activity"
  | "projects"
  | "routines"
  | "persona";

export function AgentDetail({
  agentName,
  backlogs,
  sampleData,
  onNavigate,
  onExecute,
  onLoadSamples,
}: Props) {
  const agent = PROFILES[agentName];
  const Icon = AGENT_ICONS[agentName];
  const pitch = AGENT_PITCH[agentName];

  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const myBacklogs = useMemo(
    () => backlogs.filter((b) => b.agent === agentName),
    [backlogs, agentName]
  );

  const sortedBacklogs = useMemo(() => {
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
    return [...myBacklogs].sort((a, b) => {
      const s = statusWeight[a.status] - statusWeight[b.status];
      if (s !== 0) return s;
      const p = priorityWeight[a.priority] - priorityWeight[b.priority];
      if (p !== 0) return p;
      return b.createdAt - a.createdAt;
    });
  }, [myBacklogs]);

  if (!sampleData) {
    return (
      <div className="mx-auto flex max-w-[760px] flex-col items-center justify-center gap-3 py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-pill bg-cream-light text-charcoal">
          <Icon className="h-7 w-7" strokeWidth={1.5} />
        </span>
        <h2 className="text-[20px] font-[600] tracking-[-0.3px] text-charcoal">
          {agentName} Agent
        </h2>
        <p className="max-w-md text-[13.5px] leading-[1.55] text-charcoal-muted">
          {pitch}. 이 에이전트의 활동·routines·projects·skills는 샘플 데이터에 포함되어 있습니다.
          샘플을 켜면 채워집니다.
        </p>
        <button
          type="button"
          onClick={onLoadSamples}
          className="btn-primary mt-2 inline-flex h-9 items-center gap-1.5 px-3.5 text-[13px]"
        >
          샘플 데이터 채우기
        </button>
      </div>
    );
  }

  const stats = {
    assigned: myBacklogs.filter((b) => b.status !== "done").length,
    executing: myBacklogs.filter((b) => b.status === "in_progress").length,
    done7d: agent.done7d,
    routines: agent.routines.length,
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "backlogs", label: "Backlogs", count: myBacklogs.length },
    { id: "activity", label: "Activity", count: agent.activity.length },
    {
      id: "projects",
      label: "Projects",
      count: agent.projectsLed.length + agent.projectsContributing.length,
    },
    { id: "routines", label: "Routines", count: agent.routines.length },
    { id: "persona", label: "Persona" },
  ];

  return (
    <div className="mx-auto max-w-[1280px]">
      <Breadcrumb agentName={agentName} />

      <Header
        agentName={agentName}
        Icon={Icon}
        pitch={pitch}
        status={agent.status}
        doing={agent.doing}
        doingProject={agent.doingProject}
        doingHref={agent.doingHref}
        doingDuration={agent.doingDuration}
        hiredOn={agent.hiredOn}
        onNavigate={onNavigate}
      />

      <section className="mt-6 grid grid-cols-2 gap-3 @5xl:grid-cols-4">
        <KpiCard
          icon={Layers}
          label="Assigned"
          value={stats.assigned.toString()}
          hint={`${stats.executing} executing`}
          accent="#2563eb"
        />
        <KpiCard
          icon={Zap}
          label="Done · last 7d"
          value={stats.done7d.toString()}
          hint="평균 1.6 / day"
          accent="#1f8a4c"
        />
        <KpiCard
          icon={Repeat}
          label="Routines owned"
          value={stats.routines.toString()}
          hint="all healthy"
          accent="#5f5f5d"
        />
        <KpiCard
          icon={Wallet}
          label="Cost · this month"
          value={agent.cost.usd}
          hint={`${agent.cost.runs} runs · ${agent.cost.tokensIn} tok in`}
          accent="#c89211"
        />
      </section>

      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-5">
        {activeTab === "overview" && (
          <>
            <section className="grid grid-cols-1 gap-4 @5xl:grid-cols-3">
              <NowWorkingCard
                doing={agent.doing}
                duration={agent.doingDuration}
                project={agent.doingProject}
                href={agent.doingHref}
                onNavigate={onNavigate}
              />
              <UpNextCard items={agent.upNext} onNavigate={onNavigate} />
            </section>
            <section className="mt-4">
              <HighlightsCard
                title={agent.highlightsTitle}
                hint={agent.highlightsHint}
                metrics={agent.highlights}
              />
            </section>
          </>
        )}

        {activeTab === "backlogs" && (
          <BacklogsTab
            items={sortedBacklogs}
            completed={agent.recentlyCompleted}
            onExecute={onExecute}
            onNavigate={onNavigate}
          />
        )}

        {activeTab === "activity" && (
          <ActivityTab
            activity={agent.activity}
            activityByHour={agent.activityByHour}
            onNavigate={onNavigate}
          />
        )}

        {activeTab === "projects" && (
          <ProjectsTab
            led={agent.projectsLed}
            contributing={agent.projectsContributing}
            onNavigate={onNavigate}
          />
        )}

        {activeTab === "routines" && (
          <RoutinesTab
            routines={agent.routines}
            onAll={() => onNavigate("#routines")}
          />
        )}

        {activeTab === "persona" && (
          <div className="flex flex-col gap-4">
            <RoleCard role={agent.role} />
            <SkillsCard skills={agent.skills} />
            <ToolsCard tools={agent.tools} />
          </div>
        )}
      </div>
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
    <div className="mt-8 border-b border-cream-light">
      <nav
        role="tablist"
        aria-label="Agent sections"
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
                isActive
                  ? "text-charcoal"
                  : "text-charcoal/60 hover:text-charcoal"
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

function Breadcrumb({ agentName }: { agentName: AgentName }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12.5px] text-charcoal-muted">
      <a
        href="#dashboard"
        className="rounded px-1 py-0.5 hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
      >
        Workspace
      </a>
      <ChevronRight className="h-3 w-3" strokeWidth={1.6} />
      <span className="rounded px-1 py-0.5">Agents</span>
      <ChevronRight className="h-3 w-3" strokeWidth={1.6} />
      <span className="text-charcoal">{agentName}</span>
    </nav>
  );
}

function Header({
  agentName,
  Icon,
  pitch,
  status,
  doing,
  doingProject,
  doingHref,
  doingDuration,
  hiredOn,
  onNavigate,
}: {
  agentName: AgentName;
  Icon: IconType;
  pitch: string;
  status: AgentStatus;
  doing: string;
  doingProject: string;
  doingHref: string;
  doingDuration: string;
  hiredOn: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <section className="mt-3">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-pill border border-cream-light bg-cream text-charcoal shadow-inset-dark">
            <Icon className="h-6 w-6" strokeWidth={1.6} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
                {agentName}
              </h2>
              <AgentStatusChip status={status} />
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11.5px] text-charcoal-muted">
                Hired {hiredOn}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-charcoal-muted">
              {pitch}
            </p>
            <button
              type="button"
              onClick={() => onNavigate(doingHref)}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] text-charcoal-muted underline-offset-4 hover:text-charcoal hover:underline"
            >
              <CircleDot
                className="h-3.5 w-3.5 text-[#2563eb]"
                strokeWidth={1.8}
              />
              <span className="text-charcoal">{doing}</span>
              <span className="text-charcoal-muted/60">·</span>
              <span>{doingProject}</span>
              <span className="text-charcoal-muted/60">·</span>
              <span>{doingDuration}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="btn-ghost h-9 px-3 text-[13.5px]">
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.6} />
            Brief
          </button>
          <button className="btn-surface h-9 px-3 text-[13.5px]">
            <Pause className="h-3.5 w-3.5" strokeWidth={1.6} />
            Pause
          </button>
          <button className="btn-primary h-9 px-3 text-[13.5px]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
            Run task
          </button>
          <button
            type="button"
            aria-label="More"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-charcoal/70 transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
          >
            <MoreHorizontal className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </section>
  );
}

function AgentStatusChip({ status }: { status: AgentStatus }) {
  if (status === "executing") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-[480] text-[#2563eb]">
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
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-[rgba(184,68,58,0.25)] bg-[rgba(184,68,58,0.08)] px-2 py-0.5 text-[11px] font-[480] text-[#b8443a]">
        <AlertCircle className="h-3 w-3" strokeWidth={1.8} />
        Blocked
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11px] font-[480] text-charcoal-muted">
      <Circle className="h-3 w-3" strokeWidth={1.8} />
      Idle
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: IconType;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span
          className="grid h-8 w-8 place-items-center rounded-md border border-cream-light bg-cream"
          style={{ color: accent }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </span>
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
    </div>
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

function NowWorkingCard({
  doing,
  duration,
  project,
  href,
  onNavigate,
}: {
  doing: string;
  duration: string;
  project: string;
  href: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="card overflow-hidden @5xl:col-span-2">
      <CardHeader title="Now working" hint="실시간 진행 상태" />
      <div className="px-5 py-5">
        <div className="flex items-center gap-2 text-[12px] text-charcoal-muted">
          <span className="relative grid h-2 w-2 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/50" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-blue-500" />
          </span>
          <span>{duration}</span>
          <span className="text-charcoal-muted/60">·</span>
          <button
            type="button"
            onClick={() => onNavigate(href)}
            className="text-charcoal-muted underline-offset-4 hover:text-charcoal hover:underline"
          >
            {project}
          </button>
        </div>
        <h3 className="mt-3 text-[22px] font-[600] tracking-[-0.5px] leading-[1.25] text-charcoal">
          {doing}
        </h3>
        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onNavigate(href)}
            className="inline-flex h-8 items-center gap-1.5 rounded-pill border border-blue-500/30 bg-blue-500/10 px-3 text-[12.5px] text-[#2563eb] transition hover:bg-blue-500/15"
          >
            <FileText className="h-3 w-3" strokeWidth={1.8} />
            View project
          </button>
          <button className="btn-surface h-8 px-3 text-[12.5px]">
            <GitBranch className="h-3 w-3" strokeWidth={1.6} />
            Branch · cto/p95-fix
          </button>
          <button className="btn-ghost h-8 px-3 text-[12.5px]">
            <Pause className="h-3 w-3" strokeWidth={1.6} />
            Pause run
          </button>
        </div>
      </div>
    </div>
  );
}

function UpNextCard({
  items,
  onNavigate,
}: {
  items: { title: string; meta: string; href?: string }[];
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <CardHeader title="Up next" hint="우선순위 큐" />
      <ul className="divide-y divide-cream-light">
        {items.map((it, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => it.href && onNavigate(it.href)}
              className="group flex w-full items-start gap-2.5 px-5 py-3 text-left transition hover:bg-[rgba(28,28,28,0.025)]"
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center text-[10.5px] font-[480] text-charcoal-muted">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] text-charcoal">
                  {it.title}
                </p>
                <p className="mt-0.5 truncate text-[11.5px] text-charcoal-muted">
                  {it.meta}
                </p>
              </div>
              <ChevronRight
                className="mt-1.5 h-3 w-3 shrink-0 text-charcoal-muted transition group-hover:translate-x-0.5"
                strokeWidth={1.8}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HighlightsCard({
  title,
  hint,
  metrics,
}: {
  title: string;
  hint: string;
  metrics: TechMetric[];
}) {
  return (
    <div className="card overflow-hidden">
      <CardHeader title={title} hint={hint} />
      <div className="grid grid-cols-1 gap-[1px] bg-cream-light @2xl:grid-cols-2 @5xl:grid-cols-4">
        {metrics.map((m) => (
          <TechMetricTile key={m.label} metric={m} />
        ))}
      </div>
    </div>
  );
}

function TechMetricTile({ metric }: { metric: TechMetric }) {
  const toneColor =
    metric.tone === "danger"
      ? "#b8443a"
      : metric.tone === "warn"
      ? "#c89211"
      : metric.tone === "ok"
      ? "#1f8a4c"
      : "#5f5f5d";
  const TrendIcon =
    metric.trend === "up"
      ? TrendingUp
      : metric.trend === "down"
      ? TrendingDown
      : ArrowRight;

  return (
    <div className="bg-cream p-4">
      <p className="text-[12px] text-charcoal-muted">{metric.label}</p>
      <p
        className="mt-2 text-[24px] font-[600] tracking-[-0.4px] leading-[1] text-charcoal"
        style={{ color: toneColor }}
      >
        {metric.value}
      </p>
      <div
        className="mt-2 inline-flex items-center gap-1 text-[11.5px]"
        style={{ color: toneColor }}
      >
        <TrendIcon className="h-3 w-3" strokeWidth={1.8} />
        {metric.delta}
      </div>
      <p className="mt-1 text-[11.5px] text-charcoal-muted">{metric.hint}</p>
    </div>
  );
}

function BacklogsCard({
  items,
  onExecute,
  onNavigate,
}: {
  items: BacklogItem[];
  onExecute: (id: string) => void;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="card overflow-hidden @5xl:col-span-2">
      <CardHeader
        title={`Backlogs · ${items.length}`}
        hint="Executing · Urgent · High 순"
        onAll={() => onNavigate("#backlogs")}
        allLabel="All backlogs"
      />
      {items.length === 0 ? (
        <div className="grid h-32 place-items-center text-[13px] text-charcoal-muted">
          처리할 백로그가 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-cream-light">
          {items.map((b) => (
            <BacklogRow
              key={b.id}
              item={b}
              onExecute={onExecute}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function BacklogRow({
  item,
  onExecute,
  onNavigate,
}: {
  item: BacklogItem;
  onExecute: (id: string) => void;
  onNavigate: (href: string) => void;
}) {
  const priority = PRIORITY_META[item.priority];
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
              >
                {item.project}
              </button>
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
          >
            <Play className="h-3 w-3" strokeWidth={1.8} />
            Execute
          </button>
        )}
      </div>
    </li>
  );
}

function RoutineStatusChip({
  status,
}: {
  status: AgentRoutine["lastStatus"];
}) {
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

const ACTIVITY_ICON: Record<ActivityKind, IconType> = {
  code: GitBranch,
  research: Sparkles,
  signal: Radio,
  review: FileText,
  routine: Repeat,
  decision: ShieldCheck,
};

const ACTIVITY_COLOR: Record<ActivityKind, string> = {
  code: "#2563eb",
  research: "#7c6cff",
  signal: "#b8443a",
  review: "#5f5f5d",
  routine: "#1f8a4c",
  decision: "#c89211",
};

function RoleCard({ role }: { role: string }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-cream-light px-5 py-3.5">
        <div className="flex items-center gap-2">
          <BookOpen
            className="h-3.5 w-3.5 text-charcoal-muted"
            strokeWidth={1.6}
          />
          <p className="text-[14px] font-[480] text-charcoal">Role · charter</p>
          <span className="rounded border border-cream-light bg-cream px-1.5 py-0.5 font-mono text-[10.5px] text-charcoal-muted">
            agents/cto.md
          </span>
        </div>
        <button className="btn-ghost h-7 px-2.5 text-[12px]">
          <FileText className="h-3 w-3" strokeWidth={1.6} />
          Edit
        </button>
      </div>
      <div className="px-6 py-6">
        <Markdown source={role} />
      </div>
    </div>
  );
}

function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <h2
          key={key++}
          className="text-[24px] font-[600] leading-[1.2] tracking-[-0.5px] text-charcoal"
        >
          {renderInline(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <h3
          key={key++}
          className="mt-7 text-[16px] font-[600] tracking-[-0.2px] text-charcoal"
        >
          {renderInline(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(
        <h4
          key={key++}
          className="mt-5 text-[14px] font-[480] text-charcoal"
        >
          {renderInline(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul
          key={key++}
          className="mt-3 space-y-1.5 text-[14px] leading-[1.6] text-charcoal"
        >
          {items.map((it, j) => (
            <li key={j} className="flex items-start gap-2">
              <span className="mt-[8px] inline-block h-1 w-1 shrink-0 rounded-full bg-charcoal-muted" />
              <span>{renderInline(it)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={key++}
          className="mt-3 border-l-2 border-cream-light pl-3 text-[14px] italic leading-[1.6] text-charcoal-muted"
        >
          {renderInline(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    blocks.push(
      <p
        key={key++}
        className="mt-3 text-[14px] leading-[1.65] text-charcoal"
      >
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="first:[&>*]:mt-0">{blocks}</div>;
}

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let buf = "";
  let i = 0;
  let key = 0;
  const flush = () => {
    if (buf) {
      parts.push(<Fragment key={key++}>{buf}</Fragment>);
      buf = "";
    }
  };
  while (i < text.length) {
    if (text.slice(i, i + 2) === "**") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        parts.push(
          <strong
            key={key++}
            className="font-[600] text-charcoal"
          >
            {text.slice(i + 2, end)}
          </strong>
        );
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        parts.push(
          <code
            key={key++}
            className="rounded border border-cream-light bg-cream px-1 py-0.5 font-mono text-[12.5px] text-charcoal"
          >
            {text.slice(i + 1, end)}
          </code>
        );
        i = end + 1;
        continue;
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  return <>{parts}</>;
}

function SkillsCard({ skills }: { skills: Skill[] }) {
  return (
    <div className="card overflow-hidden">
      <CardHeader
        title={`Skills · ${skills.length}`}
        hint="에이전트가 호출할 수 있는 Claude Skill"
      />
      <ul className="divide-y divide-cream-light">
        {skills.map((s) => (
          <SkillRow key={s.name} skill={s} />
        ))}
      </ul>
    </div>
  );
}

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <li className="px-5 py-3.5 transition hover:bg-[rgba(28,28,28,0.025)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-cream-light bg-cream text-charcoal-muted">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded border border-cream-light bg-cream px-1.5 py-0.5 font-mono text-[12px] text-charcoal">
              {skill.name}
            </code>
            {typeof skill.runs === "number" && (
              <span className="text-[11.5px] tabular-nums text-charcoal-muted">
                {skill.runs} runs
              </span>
            )}
            {skill.lastUsed && (
              <>
                <span className="text-charcoal-muted/50">·</span>
                <span className="inline-flex items-center gap-1 text-[11.5px] text-charcoal-muted">
                  <Clock className="h-3 w-3" strokeWidth={1.6} />
                  {skill.lastUsed}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-[13px] leading-[1.55] text-charcoal">
            {skill.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-[480] uppercase tracking-[0.06em] text-charcoal-muted">
              Triggers
            </span>
            {skill.triggers.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11px] text-charcoal-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label="More"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-charcoal-muted opacity-0 transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal group-hover:opacity-100"
        >
          <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />
        </button>
      </div>
    </li>
  );
}

const TOOL_STATUS_META: Record<
  ToolStatus,
  { label: string; color: string; icon: IconType }
> = {
  connected: { label: "Connected", color: "#1f8a4c", icon: CheckCircle2 },
  error: { label: "Error", color: "#b8443a", icon: AlertCircle },
  disabled: { label: "Disabled", color: "rgba(28,28,28,0.4)", icon: MinusCircle },
};

function ToolsCard({ tools }: { tools: Tool[] }) {
  const connected = tools.filter((t) => t.status === "connected").length;
  return (
    <div className="card overflow-hidden">
      <CardHeader
        title={`Tools · ${tools.length}`}
        hint={`${connected} connected · MCPs and connectors`}
      />
      <div className="grid grid-cols-1 gap-[1px] bg-cream-light @2xl:grid-cols-2 @5xl:grid-cols-3">
        {tools.map((t) => (
          <ToolTile key={t.name} tool={t} />
        ))}
      </div>
    </div>
  );
}

function ToolTile({ tool }: { tool: Tool }) {
  const status = TOOL_STATUS_META[tool.status];
  const StatusIcon = status.icon;
  return (
    <div className="bg-cream p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-cream-light bg-cream text-charcoal">
            <Plug2 className="h-4 w-4" strokeWidth={1.6} />
          </span>
          <div>
            <p className="text-[13.5px] font-[480] text-charcoal">
              {tool.name}
            </p>
            <p className="text-[11px] uppercase tracking-[0.06em] text-charcoal-muted">
              {tool.type}
            </p>
          </div>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1 text-[11px]"
          style={{ color: status.color }}
        >
          <StatusIcon className="h-3 w-3" strokeWidth={1.8} />
          {status.label}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5 text-[12px]">
        <div className="grid grid-cols-[64px_1fr] gap-2">
          <dt className="text-charcoal-muted">Auth</dt>
          <dd className="truncate text-charcoal" title={tool.auth}>
            {tool.auth}
          </dd>
        </div>
        <div className="grid grid-cols-[64px_1fr] gap-2">
          <dt className="text-charcoal-muted">Last sync</dt>
          <dd className="text-charcoal">{tool.lastSync}</dd>
        </div>
        <div className="grid grid-cols-[64px_1fr] gap-2">
          <dt className="text-charcoal-muted">Actions</dt>
          <dd className="text-charcoal tabular-nums">{tool.actions}</dd>
        </div>
      </dl>

      {tool.scopes && tool.scopes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {tool.scopes.map((s) => (
            <code
              key={s}
              className="rounded border border-cream-light bg-cream px-1.5 py-0.5 font-mono text-[10.5px] text-charcoal-muted"
            >
              {s}
            </code>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  color,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-pill border px-3 text-[13px] transition",
        active
          ? "border-transparent bg-charcoal text-charcoal-offwhite shadow-inset-dark"
          : "border-cream-light bg-cream text-charcoal hover:bg-[rgba(28,28,28,0.04)]"
      )}
    >
      {color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
      {typeof count === "number" && (
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
      )}
    </button>
  );
}

function BacklogsTab({
  items,
  completed,
  onExecute,
  onNavigate,
}: {
  items: BacklogItem[];
  completed: CompletedBacklog[];
  onExecute: (id: string) => void;
  onNavigate: (href: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  const counts = {
    urgent: items.filter(
      (b) => b.priority === "urgent" && b.status !== "done"
    ).length,
    high: items.filter((b) => b.priority === "high" && b.status !== "done")
      .length,
    medium: items.filter(
      (b) => b.priority === "medium" && b.status !== "done"
    ).length,
    low: items.filter((b) => b.priority === "low" && b.status !== "done")
      .length,
  };

  const showActive = filter === "all" || filter === "active";
  const showDone = filter === "all" || filter === "done";

  return (
    <div className="flex flex-col gap-4">
      <div className="card grid grid-cols-2 gap-[1px] overflow-hidden bg-cream-light @2xl:grid-cols-4">
        {(
          [
            { label: "Urgent", count: counts.urgent, color: "#b8443a" },
            { label: "High", count: counts.high, color: "#c89211" },
            { label: "Medium", count: counts.medium, color: "#5f5f5d" },
            { label: "Low", count: counts.low, color: "#8a8a87" },
          ] as const
        ).map((it) => (
          <div key={it.label} className="bg-cream p-4">
            <div
              className="flex items-center gap-1.5 text-[12px]"
              style={{ color: it.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: it.color }}
              />
              {it.label}
            </div>
            <p className="mt-2 text-[24px] font-[600] tracking-[-0.4px] leading-[1] text-charcoal">
              {it.count}
            </p>
            <p className="mt-1 text-[11.5px] text-charcoal-muted">active</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip
          label="All"
          count={items.length + completed.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterChip
          label="Active"
          count={items.length}
          active={filter === "active"}
          onClick={() => setFilter("active")}
        />
        <FilterChip
          label="Done"
          count={completed.length}
          active={filter === "done"}
          onClick={() => setFilter("done")}
        />
      </div>

      {showActive && (
        <BacklogsCard
          items={items}
          onExecute={onExecute}
          onNavigate={onNavigate}
        />
      )}

      {showDone && <CompletedBacklogsCard items={completed} />}
    </div>
  );
}

function CompletedBacklogsCard({ items }: { items: CompletedBacklog[] }) {
  return (
    <div className="card overflow-hidden">
      <CardHeader
        title={`Recently completed · ${items.length}`}
        hint="지난 7일 동안 닫힌 일감"
      />
      {items.length === 0 ? (
        <div className="grid h-32 place-items-center text-[13px] text-charcoal-muted">
          최근 완료된 항목이 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-cream-light">
          {items.map((c) => {
            const priority = PRIORITY_META[c.priority];
            return (
              <li
                key={c.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3"
              >
                <CheckCircle2
                  className="h-4 w-4 text-[#1f8a4c]"
                  strokeWidth={1.8}
                />
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
                    {c.project && (
                      <>
                        <span className="text-charcoal-muted/50">·</span>
                        <span className="text-[11.5px] text-charcoal-muted">
                          {c.project}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[13.5px] text-charcoal">
                    {c.title}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] tabular-nums text-charcoal-muted">
                  {c.completedAt}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ActivityTab({
  activity,
  activityByHour,
  onNavigate,
}: {
  activity: ActivityEntry[];
  activityByHour: number[];
  onNavigate: (href: string) => void;
}) {
  const [kindFilter, setKindFilter] = useState<ActivityKind | "all">("all");
  const filtered = useMemo(
    () =>
      kindFilter === "all"
        ? activity
        : activity.filter((a) => a.kind === kindFilter),
    [activity, kindFilter]
  );

  const kinds: { id: ActivityKind | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "code", label: "Code" },
    { id: "signal", label: "Signal" },
    { id: "review", label: "Review" },
    { id: "routine", label: "Routine" },
    { id: "research", label: "Research" },
    { id: "decision", label: "Decision" },
  ];

  const counts: Partial<Record<ActivityKind | "all", number>> = {
    all: activity.length,
  };
  for (const a of activity) counts[a.kind] = (counts[a.kind] ?? 0) + 1;

  const today = filtered.filter((a) => a.date === "today");
  const yesterday = filtered.filter((a) => a.date === "yesterday");
  const earlier = filtered.filter((a) => a.date === "earlier");

  return (
    <div className="flex flex-col gap-4">
      <ActivityHeatmapCard hours={activityByHour} />

      <div className="flex flex-wrap items-center gap-1.5">
        {kinds.map((k) => (
          <FilterChip
            key={k.id}
            label={k.label}
            count={counts[k.id]}
            active={kindFilter === k.id}
            onClick={() => setKindFilter(k.id)}
          />
        ))}
      </div>

      {today.length > 0 && (
        <DateGroup label="Today" entries={today} onNavigate={onNavigate} />
      )}
      {yesterday.length > 0 && (
        <DateGroup
          label={yesterday[0].dateLabel || "Yesterday"}
          entries={yesterday}
          onNavigate={onNavigate}
        />
      )}
      {earlier.length > 0 && (
        <DateGroup
          label="Earlier this week"
          entries={earlier}
          onNavigate={onNavigate}
        />
      )}
      {filtered.length === 0 && (
        <div className="card grid h-32 place-items-center text-[13px] text-charcoal-muted">
          이 카테고리의 활동이 없습니다.
        </div>
      )}
    </div>
  );
}

function ActivityHeatmapCard({ hours }: { hours: number[] }) {
  const max = Math.max(1, ...hours);
  const total = hours.reduce((s, n) => s + n, 0);
  return (
    <div className="card overflow-hidden">
      <CardHeader
        title="Activity · today by hour"
        hint={`${total}건의 액션 · 24h`}
      />
      <div className="px-5 py-5">
        <div className="flex items-end gap-[2px]">
          {hours.map((n, i) => {
            const h = (n / max) * 56;
            const isHighlight = n > 0;
            return (
              <div
                key={i}
                className="flex flex-1 items-end"
                title={`${i.toString().padStart(2, "0")}:00 — ${n}개`}
              >
                <div
                  className={cn(
                    "w-full rounded-sm transition",
                    isHighlight
                      ? "bg-charcoal/85"
                      : "bg-[rgba(28,28,28,0.06)]"
                  )}
                  style={{ height: `${Math.max(h, 2)}px` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-[10.5px] tabular-nums text-charcoal-muted">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>23</span>
        </div>
      </div>
    </div>
  );
}

function DateGroup({
  label,
  entries,
  onNavigate,
}: {
  label: string;
  entries: ActivityEntry[];
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <CardHeader title={label} hint={`${entries.length}건`} />
      <ol className="relative px-5 py-4">
        <span className="absolute left-[26px] top-6 bottom-6 w-px bg-cream-light" />
        {entries.map((a, i) => {
          const Icon = ACTIVITY_ICON[a.kind];
          const color = ACTIVITY_COLOR[a.kind];
          return (
            <li
              key={i}
              className="relative grid grid-cols-[24px_60px_1fr] items-start gap-3 py-2"
            >
              <span
                className="z-10 mt-0.5 grid h-6 w-6 place-items-center rounded-pill border border-cream-light bg-cream"
                style={{ color }}
              >
                <Icon className="h-3 w-3" strokeWidth={1.8} />
              </span>
              <span className="mt-1 text-[11.5px] tabular-nums text-charcoal-muted">
                {a.time}
              </span>
              <div>
                {a.href ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(a.href!)}
                    className="text-left text-[13px] leading-[1.5] text-charcoal underline-offset-2 hover:underline"
                  >
                    {a.text}
                  </button>
                ) : (
                  <span className="text-[13px] leading-[1.5] text-charcoal">
                    {a.text}
                  </span>
                )}
                {a.project && (
                  <p className="mt-0.5 text-[11.5px] text-charcoal-muted">
                    {a.project}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ProjectsTab({
  led,
  contributing,
  onNavigate,
}: {
  led: AgentProject[];
  contributing: AgentProject[];
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 px-1 text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
          Leading · {led.length}
        </p>
        <div className="grid grid-cols-1 gap-3 @5xl:grid-cols-2">
          {led.map((p) => (
            <ExpandedProjectCard
              key={p.href}
              project={p}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
      {contributing.length > 0 && (
        <div>
          <p className="mb-2 px-1 text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
            Contributing · {contributing.length}
          </p>
          <div className="grid grid-cols-1 gap-3 @5xl:grid-cols-2">
            {contributing.map((p) => (
              <ExpandedProjectCard
                key={p.href}
                project={p}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandedProjectCard({
  project,
  onNavigate,
}: {
  project: AgentProject;
  onNavigate: (href: string) => void;
}) {
  const status = PROJECT_STATUS_META[project.status];
  const donePct = (project.done / project.total) * 100;
  const activePct = (project.active / project.total) * 100;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-cream-light px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2 py-0.5 text-[11px] text-charcoal">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.label}
            </span>
            <span className="text-[11.5px] text-charcoal-muted">
              {project.done + project.active}/{project.total} phases
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(project.href)}
            className="mt-2 text-left text-[16px] font-[600] tracking-[-0.3px] leading-[1.3] text-charcoal underline-offset-4 hover:underline"
          >
            {project.title}
          </button>
        </div>
        <button
          type="button"
          onClick={() => onNavigate(project.href)}
          aria-label="Open project"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
        >
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
        </button>
      </div>

      <div className="px-5 py-4">
        <div className="relative h-1.5 overflow-hidden rounded-pill bg-[rgba(28,28,28,0.06)]">
          <div
            className="absolute inset-y-0 left-0 bg-charcoal/85"
            style={{ width: `${donePct}%` }}
          />
          <div
            className="absolute inset-y-0 bg-charcoal/35"
            style={{ left: `${donePct}%`, width: `${activePct}%` }}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-[12.5px] text-charcoal-muted">
          <CircleDot className="h-3.5 w-3.5 text-[#2563eb]" strokeWidth={1.8} />
          <span className="text-charcoal">{project.currentPhase}</span>
          <span className="text-charcoal-muted/60">·</span>
          <span>{project.phaseProgress}%</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-cream-light pt-3 text-[12.5px]">
          <div>
            <p className="text-charcoal-muted">Open backlogs</p>
            <p className="mt-0.5 text-[16px] font-[600] tracking-[-0.2px] text-charcoal">
              {project.openBacklogs}
            </p>
          </div>
          <div>
            <p className="text-charcoal-muted">Collaborators</p>
            <p className="mt-0.5 text-charcoal">
              {project.collaborators.join(" · ")}
            </p>
          </div>
        </div>

        {project.recentDecisions.length > 0 && (
          <>
            <p className="mt-4 text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
              Recent decisions
            </p>
            <ul className="mt-2 space-y-1.5">
              {project.recentDecisions.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12.5px] leading-[1.55] text-charcoal"
                >
                  <ShieldCheck
                    className="mt-0.5 h-3 w-3 shrink-0 text-charcoal-muted"
                    strokeWidth={1.8}
                  />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function RoutinesTab({
  routines,
  onAll,
}: {
  routines: AgentRoutine[];
  onAll: () => void;
}) {
  const totalRuns = routines.reduce((s, r) => s + r.runs7d, 0);
  const successRate = Math.round(
    routines.reduce((s, r) => s + r.successRate, 0) /
      Math.max(routines.length, 1)
  );
  const failedToday = routines.filter((r) => r.lastStatus === "failed").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="card grid grid-cols-1 gap-[1px] overflow-hidden bg-cream-light @2xl:grid-cols-3">
        <RoutineStatTile
          label="Total runs · 7d"
          value={totalRuns.toString()}
          hint="모든 routine 합계"
        />
        <RoutineStatTile
          label="Success rate"
          value={`${successRate}%`}
          hint="평균"
          tone="ok"
        />
        <RoutineStatTile
          label="Failed today"
          value={failedToday.toString()}
          hint={failedToday > 0 ? "확인 필요" : "all healthy"}
          tone={failedToday > 0 ? "warn" : "ok"}
        />
      </div>

      <div className="flex flex-col gap-3">
        {routines.map((r) => (
          <ExpandedRoutineRow key={r.id} routine={r} />
        ))}
      </div>

      <button
        type="button"
        onClick={onAll}
        className="self-start text-[12.5px] text-charcoal-muted underline-offset-4 hover:text-charcoal hover:underline"
      >
        모든 routine 보기 →
      </button>
    </div>
  );
}

function RoutineStatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "ok" | "warn";
}) {
  const color =
    tone === "warn" ? "#b8443a" : tone === "ok" ? "#1f8a4c" : "#1c1c1c";
  return (
    <div className="bg-cream p-4">
      <p className="text-[12px] text-charcoal-muted">{label}</p>
      <p
        className="mt-2 text-[24px] font-[600] tracking-[-0.4px] leading-[1]"
        style={{ color }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11.5px] text-charcoal-muted">{hint}</p>
    </div>
  );
}

function ExpandedRoutineRow({ routine }: { routine: AgentRoutine }) {
  const color = CATEGORY_COLOR[routine.category];
  return (
    <div className="card overflow-hidden">
      <div className="flex items-start gap-3 px-5 py-4">
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14.5px] font-[480] text-charcoal">
              {routine.name}
            </p>
            <span
              className="rounded-pill px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.06em]"
              style={{
                color,
                backgroundColor: `${color}14`,
                border: `1px solid ${color}33`,
              }}
            >
              {routine.category}
            </span>
            <RoutineStatusChip status={routine.lastStatus} />
          </div>
          <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 text-[12px] text-charcoal-muted">
            <Clock className="h-3 w-3" strokeWidth={1.6} />
            {routine.schedule}
            <code className="rounded border border-cream-light bg-cream px-1 py-0.5 font-mono text-[10.5px] text-charcoal">
              {routine.cron}
            </code>
          </p>
        </div>
      </div>

      <div className="border-t border-cream-light px-5 py-3">
        <p className="text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
          Last 7 days
        </p>
        <div className="mt-2 flex items-center gap-1">
          {routine.history.map((h, i) => (
            <span
              key={i}
              title={h}
              className={cn(
                "h-5 flex-1 rounded-sm",
                h === "success" && "bg-[#1f8a4c]/85",
                h === "failed" && "bg-[#b8443a]/85",
                h === "skipped" && "bg-[rgba(28,28,28,0.1)]"
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[1px] border-t border-cream-light bg-cream-light @2xl:grid-cols-4">
        <RoutineMiniStat
          label="Success rate"
          value={`${routine.successRate}%`}
        />
        <RoutineMiniStat label="Avg duration" value={routine.avgDuration} />
        <RoutineMiniStat label="Runs · 7d" value={routine.runs7d.toString()} />
        <RoutineMiniStat label="Last" value={routine.lastRun} />
      </div>
    </div>
  );
}

function RoutineMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream px-4 py-3">
      <p className="text-[11px] text-charcoal-muted">{label}</p>
      <p className="mt-0.5 text-[14px] font-[480] text-charcoal">{value}</p>
    </div>
  );
}

