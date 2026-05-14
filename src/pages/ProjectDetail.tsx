import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDashed,
  CircleDot,
  Copy,
  Download,
  FileText,
  GitBranch,
  Hammer,
  Link as LinkIcon,
  MoreHorizontal,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "../lib/cn";
import {
  getExperimentByHref,
  NEXT_ACTION_CONFIG,
  VERDICT_CONFIG,
  type Experiment,
} from "../lib/experiments";

type PhaseStatus = "todo" | "in_progress" | "done" | "blocked";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}>;

type Phase = {
  id: number;
  name: string;
  status: PhaseStatus;
  durationDays?: number;
  owner?: string;
  artifact?: Artifact;
};

type LoopGroup = {
  id: string;
  label: string;
  phases: Phase[];
};

type Artifact = {
  kind: "report" | "spec" | "prototype" | "doc";
  title: string;
  createdAt: string;
  phaseLabel: string;
  summary?: string;
  sections: ArtifactSection[];
};

type ArtifactSection =
  | { kind: "kv"; title: string; rows: [string, string][] }
  | {
      kind: "table";
      title: string;
      caption?: string;
      columns: string[];
      rows: string[][];
    }
  | { kind: "callout"; title: string; body: string };

const STATUS_CONFIG: Record<
  PhaseStatus,
  { icon: IconType; color: string; label: string }
> = {
  todo: { icon: Circle, color: "rgba(28,28,28,0.35)", label: "Todo" },
  in_progress: { icon: CircleDot, color: "#2563eb", label: "In progress" },
  done: { icon: CheckCircle2, color: "#1f8a4c", label: "Done" },
  blocked: { icon: CircleDashed, color: "#c89211", label: "Blocked" },
};

type Props = {
  title: string;
  description: string;
  href?: string;
};

export function ProjectDetail({ title, description, href }: Props) {
  const experiment = href ? getExperimentByHref(href) : undefined;
  const closed = experiment?.status === "done";

  const groups = useMemo<LoopGroup[]>(() => {
    const learnPhaseStatus: PhaseStatus = closed ? "done" : "todo";
    return [
      {
        id: "cast",
        label: "Cast Loop — Plan",
        phases: [
          { id: 1, name: "Context", status: "done", durationDays: 2, owner: "UX" },
          { id: 2, name: "Foundation", status: "done", durationDays: 3, owner: "UX" },
          {
            id: 3,
            name: "Architecture",
            status: "done",
            durationDays: 4,
            owner: "UX · Eng",
          },
        ],
      },
      {
        id: "spell",
        label: "Spell Loop — Build",
        phases: [
          { id: 4, name: "Components: Setup", status: "done", owner: "Eng" },
          { id: 5, name: "Components: Atoms", status: "done", owner: "Eng" },
          { id: 6, name: "Components: Molecules", status: "done", owner: "Eng" },
          {
            id: 7,
            name: "Components: Organisms",
            status: "in_progress",
            owner: "Eng",
            artifact: COMPONENTS_REPORT,
          },
          { id: 8, name: "Pages: Diverge", status: "todo", owner: "UX" },
          { id: 9, name: "Pages: Build", status: "todo", owner: "UX · Eng" },
          { id: 10, name: "Pages: Polish", status: "todo", owner: "UX" },
          { id: 11, name: "Prototype", status: "todo", owner: "UX" },
          { id: 12, name: "Specification", status: "todo", owner: "UX" },
          { id: 13, name: "Test Design", status: "todo", owner: "QA" },
        ],
      },
      {
        id: "ship",
        label: "Ship Loop — Release",
        phases: [
          { id: 14, name: "Review", status: "todo", owner: "PO" },
          { id: 15, name: "QA Sign-off", status: "todo", owner: "QA" },
          { id: 16, name: "Launch", status: "todo", owner: "Eng" },
        ],
      },
      {
        id: "learn",
        label: "Learn Loop — Close",
        phases: [
          {
            id: 17,
            name: "Outcome",
            status: learnPhaseStatus,
            owner: "PM",
            artifact: experiment ? buildOutcomeArtifact(experiment) : undefined,
          },
          {
            id: 18,
            name: "Learnings",
            status: learnPhaseStatus,
            owner: "PM · UX",
            artifact: experiment ? buildLearningsArtifact(experiment) : undefined,
          },
          {
            id: 19,
            name: "Next Actions",
            status: learnPhaseStatus,
            owner: "PM",
            artifact: experiment ? buildNextActionsArtifact(experiment) : undefined,
          },
        ],
      },
    ];
  }, [experiment, closed]);

  const flatPhases = groups.flatMap((g) => g.phases);
  const defaultPhaseId =
    flatPhases.find((p) => p.status === "in_progress")?.id ??
    flatPhases[0].id;
  const [selectedId, setSelectedId] = useState<number>(defaultPhaseId);

  const selected = flatPhases.find((p) => p.id === selectedId) ?? flatPhases[0];

  const totals = useMemo(() => {
    const all = flatPhases.length;
    const done = flatPhases.filter((p) => p.status === "done").length;
    const inProgress = flatPhases.filter(
      (p) => p.status === "in_progress"
    ).length;
    return {
      done,
      inProgress,
      total: all,
      pct: Math.round(((done + inProgress * 0.5) / all) * 100),
    };
  }, [flatPhases]);

  return (
    <div className="mx-auto max-w-[1280px]">
      <ProjectHeader title={title} description={description} totals={totals} />

      <LoopProgress groups={groups} />

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <PhaseRail
          groups={groups}
          selectedId={selected.id}
          onSelect={setSelectedId}
        />
        <ArtifactPanel phase={selected} />
      </section>
    </div>
  );
}

function ProjectHeader({
  title,
  description,
  totals,
}: {
  title: string;
  description: string;
  totals: { done: number; inProgress: number; total: number; pct: number };
}) {
  const tag = description.split(" · ")[0] ?? "In progress";
  return (
    <section className="mb-8">
      <nav className="flex items-center gap-1.5 text-[12.5px] text-charcoal-muted">
        <a
          href="#dashboard"
          className="rounded px-1 py-0.5 hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
        >
          Workspace
        </a>
        <ChevronRight className="h-3 w-3" strokeWidth={1.6} />
        <span className="rounded px-1 py-0.5 hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal">
          Projects
        </span>
        <ChevronRight className="h-3 w-3" strokeWidth={1.6} />
        <span className="text-charcoal">{title}</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sub font-[600] tracking-[-0.9px] text-charcoal">
              {title}
            </h2>
            <StatusPill label={tag} />
          </div>
          <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-charcoal-muted">
            {description.includes(" · ")
              ? description.split(" · ").slice(1).join(" · ")
              : description}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="btn-ghost h-9 px-3 text-[13.5px]">
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.6} />
            Share
          </button>
          <button className="btn-surface h-9 px-3 text-[13.5px]">
            <GitBranch className="h-3.5 w-3.5" strokeWidth={1.6} />
            Branch
          </button>
          <button className="btn-primary h-9 px-3 text-[13.5px]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
            Resume run
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

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaCard
          icon={Hammer}
          label="Phase"
          value={`${totals.done + totals.inProgress}/${totals.total}`}
          hint={`${totals.pct}% complete`}
        />
        <MetaCard
          icon={CalendarDays}
          label="Started"
          value="2026-04-08"
          hint="35 days ago"
        />
        <MetaCard
          icon={Users}
          label="Owners"
          value="3 people"
          hint="UX · Eng · QA"
        />
        <MetaCard
          icon={FileText}
          label="Artifacts"
          value="12 docs"
          hint="Latest: Components Report"
        />
      </div>
    </section>
  );
}

function MetaCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: IconType;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-[12.5px] text-charcoal-muted">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
        {label}
      </div>
      <p className="mt-2 text-[20px] font-[600] tracking-[-0.4px] text-charcoal">
        {value}
      </p>
      <p className="mt-0.5 text-[12.5px] text-charcoal-muted">{hint}</p>
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  const tone = label.toLowerCase();
  const color =
    tone.includes("done")
      ? "#1f8a4c"
      : tone.includes("progress")
      ? "#2563eb"
      : tone.includes("pending")
      ? "#c89211"
      : "rgba(28,28,28,0.5)";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2.5 py-1 text-[12px] text-charcoal">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function LoopProgress({ groups }: { groups: LoopGroup[] }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] font-[480] text-charcoal">Progress by loop</p>
        <p className="text-[12.5px] text-charcoal-muted">
          Updated 2 hours ago · auto-synced from agent runs
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {groups.map((g) => {
          const total = g.phases.length;
          const done = g.phases.filter((p) => p.status === "done").length;
          const inProgress = g.phases.filter(
            (p) => p.status === "in_progress"
          ).length;
          const donePct = (done / total) * 100;
          const inProgressPct = (inProgress / total) * 100;
          return (
            <div key={g.id} className="flex items-center gap-4">
              <div className="w-[140px] shrink-0 text-[13px] text-charcoal">
                {g.label}
              </div>
              <div className="relative h-2 flex-1 overflow-hidden rounded-pill bg-[rgba(28,28,28,0.06)]">
                <div
                  className="absolute inset-y-0 left-0 bg-charcoal/85"
                  style={{ width: `${donePct}%` }}
                />
                <div
                  className="absolute inset-y-0 bg-charcoal/35"
                  style={{
                    left: `${donePct}%`,
                    width: `${inProgressPct}%`,
                  }}
                />
              </div>
              <div className="w-[56px] shrink-0 text-right text-[12.5px] tabular-nums text-charcoal-muted">
                {done + inProgress}/{total}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseRail({
  groups,
  selectedId,
  onSelect,
}: {
  groups: LoopGroup[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <aside className="card sticky top-4 h-fit overflow-hidden">
      <div className="border-b border-cream-light px-4 py-3">
        <p className="text-[14px] font-[480] text-charcoal">Phases</p>
        <p className="mt-0.5 text-[12px] text-charcoal-muted">
          Click a step to view its artifact
        </p>
      </div>
      <nav className="flex flex-col py-2">
        {groups.map((group, gi) => (
          <div key={group.id} className={cn(gi !== 0 && "mt-2")}>
            <p className="px-4 py-1.5 text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
              {group.label}
            </p>
            <ul className="flex flex-col">
              {group.phases.map((p) => {
                const status = STATUS_CONFIG[p.status];
                const StatusIcon = status.icon;
                const active = p.id === selectedId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(p.id)}
                      className={cn(
                        "group flex w-full items-center gap-2.5 px-4 py-2 text-left text-[14px] transition",
                        active
                          ? "bg-[rgba(28,28,28,0.06)] text-charcoal"
                          : "text-charcoal/80 hover:bg-[rgba(28,28,28,0.04)] hover:text-charcoal"
                      )}
                    >
                      <StatusIcon
                        className="h-4 w-4 shrink-0"
                        style={{ color: status.color }}
                        strokeWidth={1.8}
                      />
                      <span className="w-5 shrink-0 text-[12px] tabular-nums text-charcoal-muted">
                        {p.id}
                      </span>
                      <span
                        className={cn(
                          "truncate",
                          p.status === "todo" && !active && "text-charcoal/55"
                        )}
                      >
                        {p.name}
                      </span>
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-cream-light px-4 py-3 text-[12px] text-charcoal-muted">
        <div className="flex items-center gap-3">
          <Legend color="#1f8a4c" label="Done" />
          <Legend color="#2563eb" label="Active" />
          <Legend color="rgba(28,28,28,0.35)" label="Todo" />
        </div>
      </div>
    </aside>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function ArtifactPanel({ phase }: { phase: Phase }) {
  if (!phase.artifact) {
    return <EmptyArtifact phase={phase} />;
  }
  const { artifact } = phase;
  return (
    <article className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cream-light px-6 py-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12.5px] text-charcoal-muted">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.6} />
            {artifact.kind.toUpperCase()} · Phase {phase.id} · {phase.name}
          </div>
          <h3 className="mt-2 text-[24px] font-[600] tracking-[-0.5px] text-charcoal">
            {artifact.title}
          </h3>
          <p className="mt-1.5 text-[13px] text-charcoal-muted">
            Created {artifact.createdAt} · {artifact.phaseLabel} ·{" "}
            <span className="inline-flex items-center gap-1 text-charcoal">
              <StatusInline status={phase.status} />
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="btn-ghost h-8 px-2.5 text-[12.5px]">
            <LinkIcon className="h-3.5 w-3.5" strokeWidth={1.6} />
            Copy link
          </button>
          <button className="btn-ghost h-8 px-2.5 text-[12.5px]">
            <Copy className="h-3.5 w-3.5" strokeWidth={1.6} />
            Duplicate
          </button>
          <button className="btn-surface h-8 px-2.5 text-[12.5px]">
            <Download className="h-3.5 w-3.5" strokeWidth={1.6} />
            Export
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {artifact.summary && (
          <p className="mb-6 text-[14.5px] leading-[1.6] text-charcoal">
            {artifact.summary}
          </p>
        )}

        <div className="flex flex-col gap-8">
          {artifact.sections.map((s, i) => (
            <SectionView key={i} section={s} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-cream-light bg-cream px-6 py-4">
        <p className="text-[12.5px] text-charcoal-muted">
          Last edited by{" "}
          <span className="text-charcoal">UXDesigner Agent</span> · 2h ago
        </p>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1 text-[13px] text-charcoal underline-offset-4 hover:underline"
        >
          Open full document
          <ArrowUpRight className="h-3 w-3" strokeWidth={1.8} />
        </a>
      </div>
    </article>
  );
}

function StatusInline({ status }: { status: PhaseStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <>
      <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} strokeWidth={1.8} />
      {cfg.label}
    </>
  );
}

function SectionView({ section }: { section: ArtifactSection }) {
  if (section.kind === "kv") {
    return (
      <section>
        <h4 className="text-[16px] font-[600] tracking-[-0.2px] text-charcoal">
          {section.title}
        </h4>
        <dl className="mt-3 grid grid-cols-1 divide-y divide-cream-light overflow-hidden rounded-card border border-cream-light bg-cream">
          {section.rows.map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-[200px_1fr] gap-4 px-4 py-2.5 text-[13.5px]"
            >
              <dt className="text-charcoal-muted">{k}</dt>
              <dd className="text-charcoal">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }
  if (section.kind === "callout") {
    return (
      <section className="rounded-card border border-cream-light bg-cream p-4">
        <p className="text-[13px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
          {section.title}
        </p>
        <p className="mt-2 text-[14px] leading-[1.55] text-charcoal">
          {section.body}
        </p>
      </section>
    );
  }
  return (
    <section>
      <div className="flex items-end justify-between">
        <h4 className="text-[16px] font-[600] tracking-[-0.2px] text-charcoal">
          {section.title}
        </h4>
        {section.caption && (
          <p className="text-[12.5px] text-charcoal-muted">{section.caption}</p>
        )}
      </div>
      <div className="mt-3 overflow-hidden rounded-card border border-cream-light">
        <table className="w-full text-left text-[13.5px]">
          <thead className="bg-cream">
            <tr className="text-[11.5px] uppercase tracking-[0.06em] text-charcoal-muted">
              {section.columns.map((c) => (
                <th key={c} className="px-4 py-2.5 font-[480]">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-t border-cream-light hover:bg-[rgba(28,28,28,0.03)]"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      "px-4 py-2.5",
                      ci === 0 ? "text-charcoal" : "text-charcoal-muted"
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EmptyArtifact({ phase }: { phase: Phase }) {
  const cfg = STATUS_CONFIG[phase.status];
  const Icon = cfg.icon;
  return (
    <article className="card flex flex-col items-center justify-center px-8 py-20 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-pill bg-cream-light">
        <Icon
          className="h-5 w-5"
          style={{ color: cfg.color }}
          strokeWidth={1.8}
        />
      </span>
      <h3 className="mt-5 text-[20px] font-[600] tracking-[-0.3px] text-charcoal">
        Phase {phase.id} · {phase.name}
      </h3>
      <p className="mt-2 max-w-md text-[14px] leading-[1.55] text-charcoal-muted">
        이 단계의 산출물은 아직 생성되지 않았어요. 이전 단계가 완료되면 자동으로
        에이전트 런이 시작되거나, 직접 실행할 수 있습니다.
      </p>
      <div className="mt-5 flex items-center gap-2">
        <button className="btn-ghost h-9 px-3 text-[13.5px]">
          단계 설정 보기
        </button>
        <button className="btn-primary h-9 px-3 text-[13.5px]">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
          이 단계 실행
        </button>
      </div>
    </article>
  );
}

function buildOutcomeArtifact(e: Experiment): Artifact {
  const verdict = VERDICT_CONFIG[e.verdict];
  const closed = e.status === "done";
  const verdictLine = closed
    ? `${verdict.label}${e.resultDelta ? ` · ${e.resultDelta}` : ""}`
    : `${verdict.label} · 진행 중`;

  return {
    kind: "report",
    title: closed
      ? `Outcome: ${e.title}`
      : `Outcome (in flight): ${e.title}`,
    createdAt: e.closedAt ?? e.startedAt,
    phaseLabel: "Phase 17 — Outcome",
    summary: closed
      ? "이 프로젝트가 던졌던 질문과, 실제로 측정된 결과를 한 면에 정렬한 클로즈아웃 리포트."
      : "프로젝트는 아직 클로즈되지 않았어요. 가설과 현재 측정 중인 지표를 보여줍니다. 종료 시 자동으로 결과/판정이 채워집니다.",
    sections: [
      {
        kind: "kv",
        title: "Hypothesis & Metric",
        rows: [
          ["Hypothesis", e.hypothesis],
          ["Primary metric", e.metric],
          ["Target", e.target],
          ["Baseline", e.baseline ?? "—"],
        ],
      },
      {
        kind: "kv",
        title: "Result",
        rows: [
          ["Result", e.result ?? "측정 중"],
          ["Delta", e.resultDelta ?? "—"],
          ["Verdict", verdictLine],
          [
            "Closed",
            e.closedAt
              ? e.closedAt
              : `진행 중 · ${e.startedAt} 시작`,
          ],
        ],
      },
    ],
  };
}

function buildLearningsArtifact(e: Experiment): Artifact {
  const hasLearnings = e.learnings.length > 0;
  return {
    kind: "doc",
    title: `Learnings: ${e.title}`,
    createdAt: e.closedAt ?? e.startedAt,
    phaseLabel: "Phase 18 — Learnings",
    summary: hasLearnings
      ? "결과 자체보다 더 중요한 — '왜 그렇게 됐는지'에 대한 정제된 학습. 다음 프로젝트의 가설 입력으로 직접 사용됩니다."
      : "아직 정제된 학습이 등록되지 않았어요. 프로젝트가 종료되면 PM 에이전트가 측정 결과와 인터뷰 메모를 정리합니다.",
    sections: hasLearnings
      ? [
          {
            kind: "table",
            title: "Distilled learnings",
            caption: `${e.learnings.length} items`,
            columns: ["#", "Learning"],
            rows: e.learnings.map((l, i) => [String(i + 1), l]),
          },
        ]
      : [
          {
            kind: "callout",
            title: "Pending",
            body: "Outcome 페이즈가 완료되면 Learnings는 자동 초안이 생성되고, PM/UX 에이전트가 검토 후 확정합니다.",
          },
        ],
  };
}

function buildNextActionsArtifact(e: Experiment): Artifact {
  const has = e.nextActions.length > 0;
  return {
    kind: "spec",
    title: `Next Actions: ${e.title}`,
    createdAt: e.closedAt ?? e.startedAt,
    phaseLabel: "Phase 19 — Next Actions",
    summary: has
      ? "학습을 바탕으로 즉시 백로그/실험으로 전환된 액션. 'Ship'은 결정 사항, 'New experiment'는 새 가설, 'Investigate'는 추가 조사가 필요한 항목입니다."
      : "아직 후속 액션이 도출되지 않았어요. Learnings가 확정되면 PM 에이전트가 액션 후보를 제안합니다.",
    sections: has
      ? [
          {
            kind: "table",
            title: "Derived actions",
            caption: `${e.nextActions.length} actions`,
            columns: ["Action", "Kind", "Owner", "Status"],
            rows: e.nextActions.map((a) => [
              a.title,
              NEXT_ACTION_CONFIG[a.kind].label,
              a.owner ?? "—",
              a.status ?? "queued",
            ]),
          },
          {
            kind: "callout",
            title: "Closing the loop",
            body:
              "여기서 만들어진 'New experiment' 액션은 새 프로젝트의 Hypothesis 입력이 됩니다. Product SSOT → Experiments 탭에서 이 흐름을 한눈에 볼 수 있어요.",
          },
        ]
      : [
          {
            kind: "callout",
            title: "Pending",
            body: "Learnings가 확정되면 액션 후보가 자동 생성됩니다.",
          },
        ],
  };
}

const COMPONENTS_REPORT: Artifact = {
  kind: "report",
  title: "Components Report: Onboarding flow v2",
  createdAt: "2026-05-12",
  phaseLabel: "Phase 7 - Components: Organisms",
  summary:
    "Atoms · Molecules 단계의 산출물을 토대로 Organism 16종을 정의했습니다. 모두 QDS3 시맨틱 토큰 기준이며, 접근성 ARIA 속성과 키보드 이동 흐름이 명시되어 있습니다.",
  sections: [
    {
      kind: "kv",
      title: "Scaffold Summary",
      rows: [
        ["package.json", "Created · React 19, TypeScript, Tailwind 3, Vite"],
        ["tsconfig.json", "Created · @/* path alias"],
        ["tailwind.config.ts", "Created · QDS3 Orange semantic tokens"],
        ["index.html", "Created · Pretendard font CDN"],
        ["main.tsx / App.tsx", "Created"],
        ["Router", "/, /home, /challenge, /challenge/result"],
        ["tokens.ts", "Runtime token values"],
        ["mock.ts", "Challenge question, heatmap, user stats"],
      ],
    },
    {
      kind: "table",
      title: "Component Inventory · Atoms",
      caption: "12 components",
      columns: ["Component", "File", "ARIA", "Token Compliant"],
      rows: [
        ["AnimatedOutlet", "atoms/AnimatedOutlet.tsx", "N/A (layout)", "Yes"],
        ["Avatar", "atoms/Avatar.tsx", "role=\"img\", aria-label", "Yes"],
        ["Badge", "atoms/Badge.tsx", "role=\"status\", aria-label", "Yes"],
        ["Button", "atoms/Button.tsx", "aria-busy, aria-disabled", "Yes"],
        ["Checkbox", "atoms/Checkbox.tsx", "aria-checked", "Yes"],
        ["Divider", "atoms/Divider.tsx", "role=\"separator\"", "Yes"],
        ["Icon", "atoms/Icon.tsx", "role=\"img\", aria-label", "Yes (pre-built)"],
        ["Input", "atoms/Input.tsx", "aria-invalid, aria-describedby", "Yes"],
        ["Radio", "atoms/Radio.tsx", "aria-checked", "Yes"],
        ["Select", "atoms/Select.tsx", "aria-invalid", "Yes"],
        ["Skeleton", "atoms/Skeleton.tsx", "role=\"status\", aria-busy", "Yes"],
        ["Switch", "atoms/Switch.tsx", "role=\"switch\"", "Yes"],
      ],
    },
    {
      kind: "table",
      title: "Component Inventory · Organisms",
      caption: "6 of 8 reviewed",
      columns: ["Component", "Owner", "Reviewed", "Notes"],
      rows: [
        ["OnboardingHero", "UX", "Yes", "Pretendard 32 · 1 CTA"],
        ["StepIndicator", "UX", "Yes", "4 steps, AA contrast OK"],
        ["AccountForm", "Eng", "Yes", "Server validation wired"],
        ["WorkspacePicker", "UX", "Pending", "Empty state copy in review"],
        ["InviteList", "Eng", "Yes", "Bulk paste supported"],
        ["MilestoneCard", "UX · Eng", "Yes", "Confetti on complete"],
      ],
    },
    {
      kind: "callout",
      title: "Open questions",
      body:
        "WorkspacePicker의 빈 상태 카피와 InviteList의 권한 토큰 처리 방식은 다음 Pages: Diverge 단계 시작 전 결정 필요. CTO 에이전트에게 권한 모델 리뷰를 요청한 상태.",
    },
  ],
};
