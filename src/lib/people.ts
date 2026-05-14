import type { AgentName } from "./agents";

export type PersonId = "jazz" | "daniel" | "minji" | "sora" | "hyunwoo";

export type PersonStatus = "focused" | "in_meeting" | "off" | "pto";

export const PERSON_STATUS_CONFIG: Record<
  PersonStatus,
  { label: string; color: string; bg: string }
> = {
  focused: { label: "Focused", color: "#1f8a4c", bg: "rgba(31,138,76,0.12)" },
  in_meeting: { label: "In meeting", color: "#2563eb", bg: "rgba(37,99,235,0.12)" },
  off: { label: "Off", color: "#8a8a87", bg: "rgba(28,28,28,0.06)" },
  pto: { label: "PTO", color: "#c89211", bg: "rgba(200,146,17,0.14)" },
};

export type Person = {
  id: PersonId;
  href: string;
  name: string;
  role: string;
  email: string;
  timezone: string;
  localTime: string;
  status: PersonStatus;
  joined: string;
  agents: AgentName[];
};

export const PEOPLE: Record<PersonId, Person> = {
  jazz: {
    id: "jazz",
    href: "#m-jazz",
    name: "Jazz Hwang",
    role: "CEO",
    email: "jazz@sprint.co",
    timezone: "Asia/Seoul",
    localTime: "10:42 KST",
    status: "focused",
    joined: "2024-01",
    agents: ["CEO"],
  },
  daniel: {
    id: "daniel",
    href: "#m-daniel",
    name: "Daniel Kim",
    role: "CTO",
    email: "daniel@sprint.co",
    timezone: "Asia/Seoul",
    localTime: "10:42 KST",
    status: "in_meeting",
    joined: "2024-01",
    agents: ["CTO", "Engineer"],
  },
  minji: {
    id: "minji",
    href: "#m-minji",
    name: "Minji Park",
    role: "CPO",
    email: "minji@sprint.co",
    timezone: "Asia/Seoul",
    localTime: "10:42 KST",
    status: "focused",
    joined: "2024-03",
    agents: ["UXDesigner"],
  },
  sora: {
    id: "sora",
    href: "#m-sora",
    name: "Sora Lee",
    role: "CMO",
    email: "sora@sprint.co",
    timezone: "Asia/Seoul",
    localTime: "10:42 KST",
    status: "off",
    joined: "2024-06",
    agents: ["Marketer"],
  },
  hyunwoo: {
    id: "hyunwoo",
    href: "#m-hyunwoo",
    name: "Hyunwoo Choi",
    role: "Sales Manager",
    email: "hyunwoo@sprint.co",
    timezone: "Asia/Seoul",
    localTime: "10:42 KST",
    status: "pto",
    joined: "2025-02",
    agents: [],
  },
};

export const PERSON_ORDER: PersonId[] = ["jazz", "daniel", "minji", "sora", "hyunwoo"];

export function personByHref(href: string): Person | undefined {
  return Object.values(PEOPLE).find((p) => p.href === href);
}

export type PersonDirectWork = {
  id: string;
  title: string;
  kind: "decision" | "review" | "draft" | "task";
  source: string;
  due?: string;
  reason?: "human-only" | "sensitive" | "quick" | "judgment";
};

export const PERSON_DIRECT_WORK: Record<PersonId, PersonDirectWork[]> = {
  jazz: [
    { id: "j1", title: "Series A 메모 최종 리뷰", kind: "review", source: "Fundraising", due: "Today", reason: "sensitive" },
    { id: "j2", title: "Q3 Top-line target 결정", kind: "decision", source: "OKR planning", due: "Thu", reason: "judgment" },
    { id: "j3", title: "Board update draft", kind: "draft", source: "Board prep", due: "Fri", reason: "human-only" },
  ],
  daniel: [
    { id: "d1", title: "AWS → GCP 마이그레이션 GO/NO-GO", kind: "decision", source: "Infra", due: "Wed", reason: "judgment" },
    { id: "d2", title: "Engineer 채용 final round", kind: "review", source: "Hiring", due: "Tomorrow", reason: "human-only" },
    { id: "d3", title: "Incident postmortem #INC-204", kind: "draft", source: "Reliability", due: "Today" },
  ],
  minji: [
    { id: "m1", title: "Onboarding v2 spec 승인", kind: "review", source: "Onboarding flow v2", due: "Today", reason: "judgment" },
    { id: "m2", title: "Pricing UX 방향 결정", kind: "decision", source: "Pricing rework", due: "Fri", reason: "judgment" },
  ],
  sora: [
    { id: "s1", title: "Launch tagline 최종 선택", kind: "decision", source: "Mobile launch", due: "Mon", reason: "judgment" },
    { id: "s2", title: "Partner outreach: TechCrunch", kind: "task", source: "PR", reason: "human-only" },
  ],
  hyunwoo: [
    { id: "h1", title: "Acme Co. 계약 협상", kind: "task", source: "Deals", due: "Wed", reason: "human-only" },
    { id: "h2", title: "Q3 quota 분배 결정", kind: "decision", source: "Sales planning", due: "Fri", reason: "judgment" },
    { id: "h3", title: "Globex Renewal 미팅", kind: "task", source: "Renewals", due: "Tomorrow", reason: "human-only" },
  ],
};

export type PersonOkr = {
  id: string;
  title: string;
  progress: number;
  trend: "up" | "down" | "flat";
};

export const PERSON_OKRS: Record<PersonId, PersonOkr[]> = {
  jazz: [
    { id: "o-rev", title: "ARR $3M 달성", progress: 62, trend: "up" },
    { id: "o-runway", title: "런웨이 18개월 확보", progress: 78, trend: "up" },
  ],
  daniel: [
    { id: "o-uptime", title: "월 가용성 99.95%", progress: 88, trend: "flat" },
    { id: "o-velocity", title: "엔지니어 throughput +30%", progress: 41, trend: "up" },
  ],
  minji: [
    { id: "o-activation", title: "신규 가입 7일 활성 60%", progress: 53, trend: "up" },
    { id: "o-nps", title: "NPS 45+", progress: 70, trend: "up" },
  ],
  sora: [
    { id: "o-aware", title: "월간 브랜드 노출 5M", progress: 34, trend: "up" },
    { id: "o-leadgen", title: "MQL 600/월", progress: 58, trend: "down" },
  ],
  hyunwoo: [
    { id: "o-pipe", title: "파이프라인 $5M 유지", progress: 67, trend: "up" },
    { id: "o-winrate", title: "Win rate 28%", progress: 48, trend: "flat" },
  ],
};

export type PersonMeeting = {
  id: string;
  title: string;
  when: string;
  with: string;
  outcome?: string;
};

export const PERSON_MEETINGS: Record<PersonId, PersonMeeting[]> = {
  jazz: [
    { id: "mj1", title: "Weekly leadership", when: "Today 14:00", with: "Daniel, Minji, Sora, Hyunwoo" },
    { id: "mj2", title: "Investor 1:1 — Sequoia", when: "Tomorrow 09:30", with: "Lee H." },
    { id: "mj3", title: "Board prep", when: "Fri 16:00", with: "Daniel", outcome: "Q3 narrative confirmed" },
  ],
  daniel: [
    { id: "md1", title: "Infra sync", when: "Today 11:00", with: "SRE team" },
    { id: "md2", title: "1:1 with Jazz", when: "Today 17:00", with: "Jazz" },
    { id: "md3", title: "Hiring debrief", when: "Wed 10:00", with: "Recruiter, Jazz", outcome: "1 offer extended" },
  ],
  minji: [
    { id: "mm1", title: "Onboarding review", when: "Today 13:30", with: "Daniel, UX team" },
    { id: "mm2", title: "1:1 with Jazz", when: "Tomorrow 15:00", with: "Jazz" },
  ],
  sora: [
    { id: "ms1", title: "Launch dry-run", when: "Mon 10:00", with: "Marketer agent, PR" },
    { id: "ms2", title: "1:1 with Jazz", when: "Tomorrow 11:00", with: "Jazz" },
  ],
  hyunwoo: [
    { id: "mh1", title: "Acme negotiation", when: "Wed 14:00", with: "Acme team" },
    { id: "mh2", title: "Pipeline review", when: "Today 16:00", with: "Sales reps" },
    { id: "mh3", title: "1:1 with Jazz", when: "Fri 10:00", with: "Jazz" },
  ],
};

export type PersonPto = {
  nextLeave?: string;
  daysUsedThisYear: number;
  daysRemaining: number;
  cover?: string;
};

export const PERSON_PTO: Record<PersonId, PersonPto> = {
  jazz: { daysUsedThisYear: 6, daysRemaining: 9 },
  daniel: { nextLeave: "Jun 10 – Jun 14", daysUsedThisYear: 4, daysRemaining: 11, cover: "Minji" },
  minji: { daysUsedThisYear: 3, daysRemaining: 12 },
  sora: { nextLeave: "May 22 (PM)", daysUsedThisYear: 7, daysRemaining: 8 },
  hyunwoo: { nextLeave: "On PTO — back May 19", daysUsedThisYear: 10, daysRemaining: 5, cover: "Jazz" },
};
