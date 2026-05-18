// Routine catalog. Single source of truth for scheduled automations.
// Each routine declares which connectors it requires; if any required
// connector is not "connected", the routine is "blocked" and cannot run.

import type { ComponentType, CSSProperties } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Circle,
  Globe2,
  Wallet,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

export type RoutineCategory = "market" | "ops" | "finance" | "compliance";
export type RoutineRunStatus = "success" | "failed" | "running" | "scheduled";

export type Routine = {
  id: string;
  name: string;
  description: string;
  category: RoutineCategory;
  schedule: string;
  cron: string;
  agent: string;
  enabled: boolean;
  lastRun: string;
  lastStatus: RoutineRunStatus;
  nextRun: string;
  requiredConnectors: string[]; // connector ids — see lib/connectors.ts
};

export const ROUTINE_CATEGORY_META: Record<
  RoutineCategory,
  { label: string; color: string; icon: IconType }
> = {
  market: { label: "Market", color: "#7c6cff", icon: Globe2 },
  ops: { label: "Ops", color: "#5f5f5d", icon: SettingsIcon },
  finance: { label: "Finance", color: "#1f8a4c", icon: Wallet },
  compliance: { label: "Compliance", color: "#c89211", icon: ShieldCheck },
};

export const ROUTINE_RUN_STATUS_META: Record<
  RoutineRunStatus,
  { label: string; color: string; icon: IconType }
> = {
  success: { label: "Success", color: "#1f8a4c", icon: CheckCircle2 },
  failed: { label: "Failed", color: "#b8443a", icon: AlertCircle },
  running: { label: "Running", color: "#2563eb", icon: Circle },
  scheduled: { label: "Paused", color: "rgba(28,28,28,0.4)", icon: Circle },
};

export const INITIAL_ROUTINES: Routine[] = [
  // Market
  {
    id: "r-comp-changelog",
    name: "Competitor changelog scrape",
    description:
      "Linear · Vercel · Cursor changelog 수집 후 변경 발견 시 Slack #intel-competitor에 정리",
    category: "market",
    schedule: "Daily · 09:00 KST",
    cron: "0 9 * * *",
    agent: "Engineer",
    enabled: true,
    lastRun: "3시간 전",
    lastStatus: "success",
    nextRun: "21h 뒤",
    requiredConnectors: ["github", "notion", "slack"],
  },
  {
    id: "r-icp-radar",
    name: "ICP keyword radar",
    description:
      "Reddit r/SaaS · Hacker News · X 에서 ICP 키워드 멘션 수집 후 Notion DB 적재",
    category: "market",
    schedule: "Hourly",
    cron: "0 * * * *",
    agent: "Marketer",
    enabled: true,
    lastRun: "12분 전",
    lastStatus: "success",
    nextRun: "48m 뒤",
    requiredConnectors: ["notion"],
  },
  {
    id: "r-pricing-snapshot",
    name: "Competitor pricing snapshot",
    description: "경쟁사 가격 페이지 스냅샷 diff, 변경 시 Slack + Notion 기록",
    category: "market",
    schedule: "Mon · 10:00 KST",
    cron: "0 10 * * 1",
    agent: "Marketer",
    enabled: true,
    lastRun: "5일 전",
    lastStatus: "success",
    nextRun: "월 10:00",
    requiredConnectors: ["slack", "notion"],
  },
  // Ops
  {
    id: "r-sentry-digest",
    name: "Sentry error volume digest",
    description: "전일 에러 볼륨 · 신규 이슈 Top 5 · 회귀 의심 → Slack #eng-quality",
    category: "ops",
    schedule: "Daily · 08:30 KST",
    cron: "30 8 * * *",
    agent: "Engineer",
    enabled: true,
    lastRun: "3시간 전",
    lastStatus: "success",
    nextRun: "21h 뒤",
    requiredConnectors: ["sentry", "slack"],
  },
  {
    id: "r-slo-report",
    name: "Daily SLO report",
    description: "각 서비스 SLO 상태와 burn rate를 Slack #ops에 보고",
    category: "ops",
    schedule: "Daily · 09:00 KST",
    cron: "0 9 * * *",
    agent: "Engineer",
    enabled: true,
    lastRun: "12시간 전 (실패)",
    lastStatus: "failed",
    nextRun: "—",
    requiredConnectors: ["grafana", "slack"],
  },
  {
    id: "r-hiring",
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
    requiredConnectors: ["notion"],
  },
  {
    id: "r-investor",
    name: "Investor update draft",
    description:
      "MRR · 활성 사용자 · 핵심 사건을 자동 수집해 투자자 업데이트 초안 작성",
    category: "ops",
    schedule: "Thu · 16:00 KST",
    cron: "0 16 * * 4",
    agent: "CEO",
    enabled: true,
    lastRun: "지난 목 16:00",
    lastStatus: "success",
    nextRun: "목 16:00",
    requiredConnectors: ["stripe", "amplitude", "notion"],
  },
  {
    id: "r-linear-sync",
    name: "Linear ↔ Backlog 동기화",
    description: "Linear 이슈를 Backlog와 1:1 동기화 (양방향)",
    category: "ops",
    schedule: "Every 15m",
    cron: "*/15 * * * *",
    agent: "Engineer",
    enabled: false,
    lastRun: "—",
    lastStatus: "scheduled",
    nextRun: "—",
    requiredConnectors: ["linear"],
  },
  {
    id: "r-feedback-digest",
    name: "Customer feedback digest",
    description:
      "Intercom 대화에서 feature request·sentiment 추출 → Notion 주간 요약",
    category: "ops",
    schedule: "Mon · 09:00 KST",
    cron: "0 9 * * 1",
    agent: "Marketer",
    enabled: false,
    lastRun: "—",
    lastStatus: "scheduled",
    nextRun: "—",
    requiredConnectors: ["intercom", "notion"],
  },
  {
    id: "r-ads-report",
    name: "Daily ads report",
    description:
      "Meta Ads 전일 spend · CPA · conversions를 Slack #marketing으로 발송",
    category: "ops",
    schedule: "Daily · 09:30 KST",
    cron: "30 9 * * *",
    agent: "Marketer",
    enabled: true,
    lastRun: "1시간 전",
    lastStatus: "success",
    nextRun: "23h 뒤",
    requiredConnectors: ["meta-ads", "slack"],
  },
  {
    id: "r-search-report",
    name: "Weekly search query report",
    description: "Google Ads 전환 검색어 vs 낭비된 검색어 분석",
    category: "ops",
    schedule: "Mon · 11:00 KST",
    cron: "0 11 * * 1",
    agent: "Marketer",
    enabled: false,
    lastRun: "—",
    lastStatus: "scheduled",
    nextRun: "—",
    requiredConnectors: ["google-ads"],
  },
  // Finance
  {
    id: "r-stripe-recovery",
    name: "Stripe failed payment recovery",
    description: "전일 실패 결제 자동 재시도 + 고객 알림, 일별 회수율 리포트",
    category: "finance",
    schedule: "Daily · 07:00 KST",
    cron: "0 7 * * *",
    agent: "CTO",
    enabled: true,
    lastRun: "5시간 전",
    lastStatus: "success",
    nextRun: "23h 뒤",
    requiredConnectors: ["stripe"],
  },
  {
    id: "r-runway",
    name: "Runway & burn report",
    description: "현금 잔고 · 월 burn · runway → CEO/CFO에 매주 월요일 Slack DM",
    category: "finance",
    schedule: "Mon · 08:00 KST",
    cron: "0 8 * * 1",
    agent: "CEO",
    enabled: true,
    lastRun: "5일 전",
    lastStatus: "success",
    nextRun: "월 08:00",
    requiredConnectors: ["stripe", "slack"],
  },
  {
    id: "r-overdue",
    name: "Overdue invoice reminder",
    description:
      "30일 경과 미수금 자동 리마인더. 60일 초과 시 계정 매니저 에스컬레이션",
    category: "finance",
    schedule: "Daily · 09:00 KST",
    cron: "0 9 * * *",
    agent: "CEO",
    enabled: false,
    lastRun: "—",
    lastStatus: "scheduled",
    nextRun: "일시 정지",
    requiredConnectors: ["stripe"],
  },
  // Compliance
  {
    id: "r-soc2",
    name: "SOC2 evidence collection",
    description: "일일 컨트롤 evidence 수집, 누락 시 자동 티켓 발행",
    category: "compliance",
    schedule: "Daily · 03:00 KST",
    cron: "0 3 * * *",
    agent: "CTO",
    enabled: true,
    lastRun: "8시간 전",
    lastStatus: "success",
    nextRun: "16h 뒤",
    requiredConnectors: ["vanta"],
  },
];
