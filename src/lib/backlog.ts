export type BacklogStatus = "todo" | "pending" | "in_progress" | "done";
export type BacklogPriority = "urgent" | "high" | "medium" | "low" | "none";

export type BacklogItem = {
  id: string;
  title: string;
  description?: string;
  sourceLabel?: string;
  project?: string;
  projectHref?: string;
  agent?: string;
  product?: string;
  priority: BacklogPriority;
  status: BacklogStatus;
  createdAt: number;
};

let _id = 1000;
export function nextBacklogId() {
  _id += 1;
  return `b-${_id}`;
}

export function priorityFromLabel(label: string): BacklogPriority {
  switch (label) {
    case "Urgent":
      return "urgent";
    case "High":
      return "high";
    case "Medium":
      return "medium";
    case "Low":
      return "low";
    default:
      return "none";
  }
}

export const PROJECT_HREF: Record<string, string> = {
  "Onboarding flow v2": "#proj-onboarding",
  "Pricing & billing rework": "#proj-pricing",
  "Mobile app launch": "#proj-mobile",
  "Customer health score": "#proj-health",
  "AI agent marketplace": "#proj-marketplace",
};

const now = Date.now();
const h = (n: number) => now - n * 60 * 60 * 1000;

export const INITIAL_BACKLOGS: BacklogItem[] = [
  {
    id: "b-1",
    title: "Korean customers can't change subscription tier from Settings",
    description:
      "ko-KR 로케일에서 Stripe portal 호출 시 404. 24h 내 12건의 CS 티켓.",
    sourceLabel: "CS signal",
    project: "Pricing & billing rework",
    projectHref: "#proj-pricing",
    agent: "CTO",
    product: "Sprint",
    priority: "urgent",
    status: "todo",
    createdAt: h(2),
  },
  {
    id: "b-2",
    title: "Mobile sign-up flow breaks on iOS 17.2 (Safari)",
    description:
      "OTP 입력 후 Continue 버튼 비활성 — input ref unmount 추정.",
    sourceLabel: "Bug signal",
    project: "Mobile app launch",
    projectHref: "#proj-mobile",
    agent: "CTO",
    product: "Sprint",
    priority: "high",
    status: "todo",
    createdAt: h(5),
  },
  {
    id: "b-3",
    title: "/workflows p95 latency 회귀 — 0.241 롤백 검토",
    description:
      "deploy 0.241 이후 트리거 API p95가 320ms → 1.8s. background job 큐 길이도 동반 증가.",
    sourceLabel: "Internal signal",
    project: "AI agent marketplace",
    projectHref: "#proj-marketplace",
    agent: "CTO",
    product: "Agents Cloud",
    priority: "urgent",
    status: "in_progress",
    createdAt: h(8),
  },
  {
    id: "b-4",
    title: "Linear 'Agents Marketplace' 기능 갭 분석",
    description:
      "Linear 0.32 릴리스 vs 우리 marketplace 차별화 포인트 정리.",
    sourceLabel: "Competitor signal",
    project: "AI agent marketplace",
    projectHref: "#proj-marketplace",
    agent: "CEO",
    product: "Agents Cloud",
    priority: "high",
    status: "in_progress",
    createdAt: h(26),
  },
  {
    id: "b-5",
    title: "Onboarding step-3 invite 페이지 재디자인",
    description: "step3 완료율 -38% 회복. 메일 지연 + UI 친화성 동시 개선.",
    sourceLabel: "Internal signal",
    project: "Onboarding flow v2",
    projectHref: "#proj-onboarding",
    agent: "UXDesigner",
    product: "Sprint",
    priority: "high",
    status: "todo",
    createdAt: h(28),
  },
  {
    id: "b-6",
    title: "Per-agent cost analytics 스펙 초안",
    description:
      "Solo founder ICP 강한 요청. 현재 워크스페이스 단위만 가능.",
    sourceLabel: "Market signal",
    project: "Customer health score",
    projectHref: "#proj-health",
    agent: "CEO",
    product: "Sprint",
    priority: "medium",
    status: "pending",
    createdAt: h(48),
  },
];
