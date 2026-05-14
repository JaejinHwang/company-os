export type ObjectiveLite = {
  id: string;
  short: string;
  full: string;
  emoji: string;
};

export type KrLite = {
  id: string;
  label: string;
  objectiveId: string;
};

export const OBJECTIVES_LITE: ObjectiveLite[] = [
  {
    id: "obj-activation",
    short: "Activation",
    full: "신규 가입자가 첫 가치까지 빠르게 도달하게 한다",
    emoji: "🌱",
  },
  {
    id: "obj-revenue",
    short: "Revenue",
    full: "ARR 본격 가속 — $100K MRR을 분기 안에 돌파한다",
    emoji: "📈",
  },
  {
    id: "obj-marketplace",
    short: "Marketplace",
    full: "Agent Marketplace의 기반을 세운다",
    emoji: "🛒",
  },
  {
    id: "obj-mobile",
    short: "Mobile",
    full: "Mobile 1.0을 출시해 채널을 다양화한다",
    emoji: "📱",
  },
];

export const KRS: KrLite[] = [
  { id: "kr-1-1", label: "Activation rate", objectiveId: "obj-activation" },
  { id: "kr-1-2", label: "Time to first value", objectiveId: "obj-activation" },
  { id: "kr-1-3", label: "Step 3 완료율", objectiveId: "obj-activation" },
  { id: "kr-2-1", label: "MRR", objectiveId: "obj-revenue" },
  { id: "kr-2-2", label: "Enterprise pilots", objectiveId: "obj-revenue" },
  { id: "kr-2-3", label: "Churn", objectiveId: "obj-revenue" },
  { id: "kr-3-1", label: "External agents 등록", objectiveId: "obj-marketplace" },
  { id: "kr-3-2", label: "/workflows p95", objectiveId: "obj-marketplace" },
  { id: "kr-3-3", label: "Agent uptime", objectiveId: "obj-marketplace" },
  { id: "kr-4-1", label: "iOS 1.0 출시", objectiveId: "obj-mobile" },
  { id: "kr-4-2", label: "Android 1.0 출시", objectiveId: "obj-mobile" },
  { id: "kr-4-3", label: "모바일 신규 가입 비중", objectiveId: "obj-mobile" },
];

export const KR_BY_ID: Record<string, KrLite> = Object.fromEntries(
  KRS.map((k) => [k.id, k])
);

export const OBJECTIVE_BY_ID: Record<string, ObjectiveLite> = Object.fromEntries(
  OBJECTIVES_LITE.map((o) => [o.id, o])
);

export function formatKrLabel(krId: string): string | undefined {
  const kr = KR_BY_ID[krId];
  if (!kr) return undefined;
  const obj = OBJECTIVE_BY_ID[kr.objectiveId];
  return obj ? `${obj.short} · ${kr.label}` : kr.label;
}

export function krGroupsForSelect() {
  return OBJECTIVES_LITE.map((o) => ({
    label: o.short,
    options: KRS.filter((k) => k.objectiveId === o.id).map((k) => ({
      value: k.id,
      label: k.label,
    })),
  }));
}
