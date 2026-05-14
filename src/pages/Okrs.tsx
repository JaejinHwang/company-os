import { useState } from "react";
import { LayoutGrid, Workflow, Target } from "lucide-react";
import type { BacklogItem } from "../lib/backlog";
import { OkrsTable } from "./OkrsTable";
import { Graph } from "./Graph";
import { EmptyState } from "../components/EmptyState";
import { cn } from "../lib/cn";

type View = "table" | "graph";

type Props = {
  backlogs: BacklogItem[];
  sampleData: boolean;
  onLoadSamples: () => void;
  onNavigate: (href: string) => void;
  onAddBacklog: (krId: string) => void;
};

const STORAGE_KEY = "cream.okrs.view";

export function Okrs({
  backlogs,
  sampleData,
  onLoadSamples,
  onNavigate,
  onAddBacklog,
}: Props) {
  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return "table";
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "graph" ? "graph" : "table";
  });

  const handleSetView = (v: View) => {
    setView(v);
    window.localStorage.setItem(STORAGE_KEY, v);
  };

  if (!sampleData) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-6">
          <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
            Q2 2026
          </p>
          <h2 className="mt-2 text-sub font-[600] tracking-[-0.9px] text-charcoal">
            OKRs
          </h2>
        </header>
        <EmptyState
          icon={Target}
          title="이번 분기 목표가 아직 비어 있어요"
          description="3~5개의 Objective와 각각의 Key Result를 정해두면, 모든 백로그가 자연스럽게 그 방향으로 흘러갑니다."
          onLoadSamples={onLoadSamples}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] uppercase tracking-[0.08em] text-charcoal-muted">
            Q2 2026
          </p>
          <h2 className="mt-2 text-sub font-[600] tracking-[-0.9px] text-charcoal">
            OKRs
          </h2>
        </div>

        <div className="inline-flex items-center gap-1 rounded-pill bg-[rgba(28,28,28,0.06)] p-1">
          <ViewButton
            active={view === "table"}
            onClick={() => handleSetView("table")}
            icon={<LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.8} />}
            label="Table"
          />
          <ViewButton
            active={view === "graph"}
            onClick={() => handleSetView("graph")}
            icon={<Workflow className="h-3.5 w-3.5" strokeWidth={1.8} />}
            label="Graph"
          />
        </div>
      </header>

      {view === "table" ? (
        <OkrsTable
          backlogs={backlogs}
          onNavigate={onNavigate}
          onAddBacklog={onAddBacklog}
        />
      ) : (
        <Graph backlogs={backlogs} onNavigate={onNavigate} />
      )}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-pill px-3.5 text-[13px] transition",
        active
          ? "bg-cream text-charcoal shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(28,28,28,0.04)]"
          : "text-charcoal-muted hover:text-charcoal"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
