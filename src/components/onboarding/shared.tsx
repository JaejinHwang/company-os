// This file intentionally co-locates the small onboarding-only data (AGENTS,
// AGENT_INFO, SUGGESTIONS) with the components that consume them. Splitting
// them would just add indirection. Fast refresh trade-off acknowledged.
/* eslint-disable react-refresh/only-export-components */
import type { ComponentType, CSSProperties } from "react";
import { Bot, BrainCircuit, Gem, Megaphone, Wrench } from "lucide-react";
import { cn } from "../../lib/cn";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

export type AgentName = "CEO" | "CTO" | "UXDesigner" | "Marketer" | "Engineer";

export const AGENTS: AgentName[] = [
  "CEO",
  "CTO",
  "UXDesigner",
  "Marketer",
  "Engineer",
];

export const AGENT_INFO: Record<AgentName, { icon: IconType; pitch: string }> = {
  CEO: { icon: Bot, pitch: "전략·우선순위·이해관계자 관리" },
  CTO: { icon: BrainCircuit, pitch: "아키텍처·기술 의사결정·코드 리뷰" },
  UXDesigner: { icon: Gem, pitch: "디자인 탐색·비평·스펙 생성" },
  Marketer: { icon: Megaphone, pitch: "포지셔닝·캠페인·카피·실험" },
  Engineer: { icon: Wrench, pitch: "구현·테스트·end-to-end 출시" },
};

export function AgentPicker({
  value,
  onChange,
  animate = true,
}: {
  value: string;
  onChange: (next: AgentName) => void;
  animate?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {AGENTS.map((a, i) => {
        const info = AGENT_INFO[a];
        const Icon = info.icon;
        const selected = value === a;
        return (
          <button
            key={a}
            type="button"
            style={animate ? { animationDelay: `${i * 50}ms` } : undefined}
            onClick={() => onChange(a)}
            className={cn(
              "group flex items-center gap-3 rounded-md border p-3.5 text-left transition-all duration-200",
              animate && "animate-[fadeUp_400ms_ease-out_both]",
              selected
                ? "border-charcoal bg-[rgba(28,28,28,0.04)]"
                : "border-cream-light bg-cream hover:border-[rgba(28,28,28,0.3)] hover:-translate-y-0.5"
            )}
          >
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-pill border bg-cream transition",
                selected
                  ? "border-charcoal text-charcoal shadow-inset-dark"
                  : "border-cream-light text-charcoal/80"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-[480] text-charcoal">{a}</p>
              <p className="text-[12px] text-charcoal-muted">{info.pitch}</p>
            </div>
            {selected && (
              <span className="text-[11.5px] font-[480] uppercase tracking-[0.06em] text-charcoal">
                Hired
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function QuickPicks({
  options,
  active,
  onPick,
  animate = true,
}: {
  options: string[];
  active: string;
  onPick: (v: string) => void;
  animate?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {options.map((s, i) => {
        const isActive = active === s;
        return (
          <button
            key={s}
            type="button"
            style={animate ? { animationDelay: `${i * 30}ms` } : undefined}
            onClick={() => onPick(s)}
            className={cn(
              "inline-flex h-7 items-center rounded-pill border px-2.5 text-[12.5px] transition",
              animate && "animate-[fadeUp_400ms_ease-out_both]",
              isActive
                ? "border-charcoal bg-charcoal text-charcoal-offwhite shadow-inset-dark"
                : "border-cream-light bg-cream text-charcoal hover:bg-[rgba(28,28,28,0.04)]"
            )}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

export const SUGGESTIONS = {
  name: ["Sprint", "Atlas", "Lumen", "Helio", "Cinder", "Foundry"],
  vision: [
    "팀의 OS를 다시 발명한다",
    "에이전트와 사람이 함께 일하는 가장 빠른 방법",
    "솔로 창업자에게 필요한 모든 도구를 한 화면에",
    "데이터로 의사결정하는 회사를 누구나 만들 수 있게",
  ],
  task: [
    "랜딩페이지 v1 디자인",
    "사용자 인터뷰 5건 진행",
    "Stripe 결제 연동",
    "데모 데이 데크 작성",
    "초기 사용자 10명 컨택",
  ],
};
