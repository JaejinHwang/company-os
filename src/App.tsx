import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import {
  NewIssueModal,
  type NewIssueSeed,
  type NewIssuePayload,
} from "./components/NewIssueModal";
import { ChiefOfStaff } from "./components/ChiefOfStaff";
import {
  Onboarding,
  type OnboardingResult,
} from "./components/onboarding/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Placeholder } from "./pages/Placeholder";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Signals } from "./pages/Signals";
import { Backlogs, BacklogToast } from "./pages/Backlogs";
import { Routines } from "./pages/Routines";
import { Connectors } from "./pages/Connectors";
import { Goals } from "./pages/Goals";
import { Okrs } from "./pages/Okrs";
import { Settings } from "./pages/Settings";
import { AgentDetail } from "./pages/AgentDetail";
import { PersonDetail } from "./pages/PersonDetail";
import { Experiments } from "./pages/Experiments";
import { PEOPLE, type PersonId } from "./lib/people";
import {
  INITIAL_BACKLOGS,
  PROJECT_HREF,
  nextBacklogId,
  priorityFromLabel,
  type BacklogItem,
  type BacklogStatus,
} from "./lib/backlog";
import { INITIAL_CONNECTORS, type Connector } from "./lib/connectors";
import { INITIAL_ROUTINES, type Routine } from "./lib/routines";

const PAGES: Record<string, { title: string; description: string }> = {
  "#new-issue": {
    title: "New Issue",
    description: "Capture a new issue. This mockup will become the issue composer.",
  },
  "#dashboard": {
    title: "Dashboard",
    description: "Daily overview of your workspace.",
  },
  "#inbox": {
    title: "Inbox",
    description: "Notifications, mentions, and assigned work — all in one quiet place.",
  },
  "#connectors": {
    title: "Connectors",
    description:
      "Notion · Slack · GitHub · Stripe · Amplitude 등 외부 시스템을 연결해 시그널·루틴·태스크 동작을 활성화합니다.",
  },
  "#signals": {
    title: "Signals",
    description:
      "들어오는 알림·이벤트·트리거를 한 곳에서 모니터링하고 분류합니다.",
  },
  "#backlogs": {
    title: "Backlogs",
    description:
      "프로젝트/에이전트별 백로그. 우선순위·담당자·일정으로 정렬해 트리아지합니다.",
  },
  "#routines": {
    title: "Routines",
    description: "Scheduled work and recurring agent tasks.",
  },
  "#goals": {
    title: "Goals",
    description:
      "회사 비전 · 미션 · spirits manifesto · anti-goals · 장기 horizon.",
  },
  "#okrs": {
    title: "OKRs",
    description:
      "Q2 2026 objectives + Key Results. 테이블 · 그래프 두 가지 뷰.",
  },
  "#proj-onboarding": {
    title: "Onboarding flow v2",
    description:
      "In progress · 신규 유저가 가입 후 첫 가치 경험까지 도달하는 흐름을 재설계.",
  },
  "#proj-pricing": {
    title: "Pricing & billing rework",
    description:
      "Pending · 신규 요금제 적용, Stripe Tax 마이그레이션, 인보이스 리포맷.",
  },
  "#proj-mobile": {
    title: "Mobile app launch",
    description:
      "Todo · iOS / Android 1.0 출시 준비. 디자인, 빌드 파이프라인, TestFlight.",
  },
  "#proj-health": {
    title: "Customer health score",
    description:
      "Done · 활성/리스크 점수 계산식 합의, 워크스페이스 단위 대시보드 출시.",
  },
  "#proj-marketplace": {
    title: "AI agent marketplace",
    description:
      "In progress · 외부 에이전트 등록/검증/과금 흐름과 디스커버리 페이지.",
  },
  "#ceo": {
    title: "CEO Agent",
    description: "Strategy, prioritization, and high-level decisions.",
  },
  "#cto": {
    title: "CTO Agent",
    description: "Architecture, technical direction, and engineering review.",
  },
  "#ux": {
    title: "UXDesigner Agent",
    description: "Design exploration, critique, and spec generation.",
  },
  "#marketer": {
    title: "Marketer Agent",
    description: "Positioning, campaigns, copy, and growth experiments.",
  },
  "#engineer": {
    title: "Engineer Agent",
    description: "Implementation, code review, and shipping work end-to-end.",
  },
  "#m-jazz": {
    title: "Jazz Hwang",
    description: "CEO · 본인이 점유한 에이전트, 직접 작업, 목표, 휴가/미팅을 한 곳에서.",
  },
  "#m-daniel": {
    title: "Daniel Kim",
    description: "CTO · 본인이 점유한 에이전트, 직접 작업, 목표, 휴가/미팅을 한 곳에서.",
  },
  "#m-minji": {
    title: "Minji Park",
    description: "CPO · 본인이 점유한 에이전트, 직접 작업, 목표, 휴가/미팅을 한 곳에서.",
  },
  "#m-sora": {
    title: "Sora Lee",
    description: "CMO · 본인이 점유한 에이전트, 직접 작업, 목표, 휴가/미팅을 한 곳에서.",
  },
  "#m-hyunwoo": {
    title: "Hyunwoo Choi",
    description: "Sales Manager · 본인이 점유한 에이전트, 직접 작업, 목표, 휴가/미팅을 한 곳에서.",
  },
  "#screens": {
    title: "Screens",
    description: "Mockup gallery — wizard-artifact 기반 스크린 컬렉션.",
  },
  "#flow": {
    title: "Flow",
    description: "Cross-domain product graph. 도메인 간 흐름과 의존을 한 화면에.",
  },
  "#design-system": {
    title: "Design System",
    description: "QDS3 tokens, DESIGN.md, 컴포넌트 가이드라인.",
  },
  "#policies": {
    title: "Policies",
    description: "Shared rules — _policies/ 디렉토리에 정의된 운영 규칙.",
  },
  "#data": {
    title: "Data",
    description: "Data definitions — qdp repo의 metric/event 정의.",
  },
  "#experiments": {
    title: "Experiments",
    description:
      "이 제품에서 돌아간 실험과 결과·학습·다음 액션의 집계 뷰. 각 Project의 Learn Loop 산출물에서 자동 집계됩니다.",
  },
  "#org": {
    title: "Org",
    description: "People, teams, and reporting structure.",
  },
  "#skills": {
    title: "Skills",
    description: "Capability matrix across the organization.",
  },
  "#costs": {
    title: "Costs",
    description: "Spend, budgets, and unit economics.",
  },
  "#activity": {
    title: "Activity",
    description: "Everything that's happened across the workspace, in time order.",
  },
  "#settings": {
    title: "Settings",
    description: "Workspace, billing, members, and integrations.",
  },
};

const ONBOARDED_KEY = "cream.onboarded";
const WORKSPACE_KEY = "cream.workspace.name";
const VISION_KEY = "cream.workspace.vision";
const FIRST_AGENT_KEY = "cream.workspace.firstAgent";
const SAMPLE_DATA_KEY = "cream.sample_data";

const SAMPLE_BACKLOG_IDS = new Set(INITIAL_BACKLOGS.map((b) => b.id));

function readSampleDataDefault(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(SAMPLE_DATA_KEY);
  if (v === "1") return true;
  if (v === "0") return false;
  // First-time visit (no flag, no onboarded): demo on for richness.
  // Onboarded but no flag (shouldn't happen): default clean.
  return window.localStorage.getItem(ONBOARDED_KEY) !== "1";
}

function App() {
  const [hash, setHash] = useState<string>(
    () => window.location.hash || "#dashboard"
  );
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [issueSeed, setIssueSeed] = useState<NewIssueSeed | undefined>(undefined);
  const [newBacklogCount, setNewBacklogCount] = useState(0);
  const [chosOpen, setChosOpen] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(ONBOARDED_KEY) === "1";
  });
  const [workspaceName, setWorkspaceName] = useState<string>(() => {
    if (typeof window === "undefined") return "Sprint Org";
    return window.localStorage.getItem(WORKSPACE_KEY) || "Sprint Org";
  });
  const [workspaceVision, setWorkspaceVision] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(VISION_KEY) || "";
  });
  const [firstAgent, setFirstAgent] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(FIRST_AGENT_KEY) || "";
  });
  const [sampleData, setSampleData] = useState<boolean>(readSampleDataDefault);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>(() =>
    readSampleDataDefault() ? INITIAL_BACKLOGS : []
  );
  const [connectors, setConnectors] = useState<Connector[]>(() =>
    readSampleDataDefault() ? INITIAL_CONNECTORS : []
  );
  const [routines, setRoutines] = useState<Routine[]>(() =>
    readSampleDataDefault() ? INITIAL_ROUTINES : []
  );

  useEffect(() => {
    const onHashChange = () =>
      setHash(window.location.hash || "#dashboard");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (href: string) => {
    if (href === "#new-issue") {
      setIssueSeed(undefined);
      setNewIssueOpen(true);
      return;
    }
    if (href === "#atlas") {
      setChosOpen(true);
      return;
    }
    window.location.hash = href;
    setHash(href);
  };

  const openPlanFromSignal = (seed: NewIssueSeed) => {
    setIssueSeed(seed);
    setNewIssueOpen(true);
  };

  const openNewBacklogForKr = (krId: string) => {
    setIssueSeed({ krId });
    setNewIssueOpen(true);
  };

  const handleCreateIssue = (p: NewIssuePayload) => {
    const projectHref = p.project ? PROJECT_HREF[p.project] : undefined;
    const status = (p.status as BacklogStatus) || "todo";
    const item: BacklogItem = {
      id: nextBacklogId(),
      title: p.title.trim(),
      description: p.description.trim() || undefined,
      sourceLabel: p.sourceLabel ?? "Manual",
      project: p.project || undefined,
      projectHref,
      agent: p.assignee || undefined,
      product: p.product || undefined,
      krId: p.krId || undefined,
      priority: priorityFromLabel(p.priority),
      status,
      createdAt: Date.now(),
    };
    setBacklogs((prev) => [item, ...prev]);
    setNewBacklogCount((c) => c + 1);
  };

  const handleExecute = (id: string) => {
    setBacklogs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "in_progress" } : b))
    );
  };

  const handleOnboardingDone = (r: OnboardingResult) => {
    window.localStorage.setItem(ONBOARDED_KEY, "1");
    window.localStorage.setItem(WORKSPACE_KEY, r.companyName);
    window.localStorage.setItem(VISION_KEY, r.vision || "");
    window.localStorage.setItem(FIRST_AGENT_KEY, r.firstAgent || "");
    window.localStorage.setItem(SAMPLE_DATA_KEY, "0");
    setWorkspaceName(r.companyName);
    setWorkspaceVision(r.vision || "");
    setFirstAgent(r.firstAgent || "");
    setSampleData(false);
    const fresh: BacklogItem[] = r.firstTask
      ? [
          {
            id: nextBacklogId(),
            title: r.firstTask,
            description: r.vision ? `> Vision · ${r.vision}` : undefined,
            sourceLabel: "Onboarding",
            agent: r.firstAgent || undefined,
            priority: "high",
            status: "todo",
            createdAt: Date.now(),
          },
        ]
      : [];
    setBacklogs(fresh);
    setOnboarded(true);
    window.location.hash = "#backlogs";
    setHash("#backlogs");
  };

  const handleLoadSamples = () => {
    window.localStorage.setItem(SAMPLE_DATA_KEY, "1");
    setSampleData(true);
    setBacklogs((prev) => {
      const userOnly = prev.filter((b) => !SAMPLE_BACKLOG_IDS.has(b.id));
      return [...INITIAL_BACKLOGS, ...userOnly];
    });
    setConnectors(INITIAL_CONNECTORS);
    setRoutines(INITIAL_ROUTINES);
  };

  const handleClearSamples = () => {
    window.localStorage.setItem(SAMPLE_DATA_KEY, "0");
    setSampleData(false);
    setBacklogs((prev) => prev.filter((b) => !SAMPLE_BACKLOG_IDS.has(b.id)));
    setConnectors([]);
    setRoutines([]);
  };

  // Connector actions
  const handleToggleCapability = (cid: string, capId: string) =>
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === cid
          ? {
              ...c,
              capabilities: c.capabilities.map((cap) =>
                cap.id === capId ? { ...cap, enabled: !cap.enabled } : cap
              ),
            }
          : c
      )
    );

  const handleConnectConnector = (id: string) =>
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "connected",
              workspace: c.workspace ?? "sprint-org · just-now",
              lastSync: "방금 전",
              capabilities: c.capabilities.map((cap, i) => ({
                ...cap,
                enabled:
                  cap.enabled ||
                  c.capabilities.findIndex((x) => x.kind === cap.kind) === i,
              })),
            }
          : c
      )
    );

  const handleDisconnectConnector = (id: string) =>
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "available",
              workspace: undefined,
              lastSync: undefined,
              capabilities: c.capabilities.map((cap) => ({
                ...cap,
                enabled: false,
              })),
            }
          : c
      )
    );

  const handleReconnectConnector = (id: string) =>
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "syncing", errorReason: undefined } : c
      )
    );

  // Routine actions
  const handleToggleRoutine = (id: string) =>
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              enabled: !r.enabled,
              lastStatus: !r.enabled ? r.lastStatus : "scheduled",
              nextRun: !r.enabled ? r.nextRun : "일시 정지",
            }
          : r
      )
    );

  const handleRunRoutine = (id: string) =>
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, lastStatus: "running", lastRun: "방금 실행" }
          : r
      )
    );

  const meta = PAGES[hash] ?? PAGES["#dashboard"];

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingDone} />;
  }

  return (
    <>
      <AppShell
        title={meta.title}
        activeHref={hash}
        workspaceName={workspaceName}
        sampleData={sampleData}
        onNavigate={navigate}
        onOpenChoS={() => setChosOpen(true)}
      >
        {hash === "#dashboard" ? (
          <Dashboard
            backlogs={backlogs}
            sampleData={sampleData}
            firstAgent={firstAgent}
            onLoadSamples={handleLoadSamples}
            onNavigate={navigate}
            onPlan={openPlanFromSignal}
            onExecute={handleExecute}
            onNewIssue={() => {
              setIssueSeed(undefined);
              setNewIssueOpen(true);
            }}
          />
        ) : hash === "#connectors" ? (
          <Connectors
            sampleData={sampleData}
            connectors={connectors}
            routines={routines}
            onLoadSamples={handleLoadSamples}
            onNavigate={navigate}
            onToggleCapability={handleToggleCapability}
            onConnect={handleConnectConnector}
            onDisconnect={handleDisconnectConnector}
            onReconnect={handleReconnectConnector}
          />
        ) : hash === "#signals" ? (
          <Signals
            sampleData={sampleData}
            onLoadSamples={handleLoadSamples}
            onPlan={openPlanFromSignal}
          />
        ) : hash === "#backlogs" ? (
          <Backlogs
            items={backlogs}
            sampleData={sampleData}
            onLoadSamples={handleLoadSamples}
            onNewIssue={() => {
              setIssueSeed(undefined);
              setNewIssueOpen(true);
            }}
            onExecute={handleExecute}
            onNavigate={navigate}
          />
        ) : hash === "#routines" ? (
          <Routines
            routines={routines}
            connectors={connectors}
            onLoadSamples={handleLoadSamples}
            onToggle={handleToggleRoutine}
            onRun={handleRunRoutine}
            onNavigate={navigate}
          />
        ) : hash === "#goals" ? (
          <Goals
            sampleData={sampleData}
            workspaceVision={workspaceVision}
            onLoadSamples={handleLoadSamples}
          />
        ) : hash === "#okrs" ? (
          <Okrs
            backlogs={backlogs}
            sampleData={sampleData}
            onLoadSamples={handleLoadSamples}
            onNavigate={navigate}
            onAddBacklog={openNewBacklogForKr}
          />
        ) : hash === "#settings" ? (
          <Settings
            sampleData={sampleData}
            workspaceName={workspaceName}
            onLoadSamples={handleLoadSamples}
            onClearSamples={handleClearSamples}
          />
        ) : hash === "#experiments" ? (
          <Experiments onNavigate={navigate} onPlan={openPlanFromSignal} />
        ) : hash.startsWith("#proj-") ? (
          <ProjectDetail
            title={meta.title}
            description={meta.description}
            href={hash}
          />
        ) : hash === "#ceo" ? (
          <AgentDetail
            agentName="CEO"
            backlogs={backlogs}
            sampleData={sampleData}
            onNavigate={navigate}
            onExecute={handleExecute}
            onLoadSamples={handleLoadSamples}
          />
        ) : hash === "#cto" ? (
          <AgentDetail
            agentName="CTO"
            backlogs={backlogs}
            sampleData={sampleData}
            onNavigate={navigate}
            onExecute={handleExecute}
            onLoadSamples={handleLoadSamples}
          />
        ) : hash === "#ux" ? (
          <AgentDetail
            agentName="UXDesigner"
            backlogs={backlogs}
            sampleData={sampleData}
            onNavigate={navigate}
            onExecute={handleExecute}
            onLoadSamples={handleLoadSamples}
          />
        ) : hash === "#marketer" ? (
          <AgentDetail
            agentName="Marketer"
            backlogs={backlogs}
            sampleData={sampleData}
            onNavigate={navigate}
            onExecute={handleExecute}
            onLoadSamples={handleLoadSamples}
          />
        ) : hash === "#engineer" ? (
          <AgentDetail
            agentName="Engineer"
            backlogs={backlogs}
            sampleData={sampleData}
            onNavigate={navigate}
            onExecute={handleExecute}
            onLoadSamples={handleLoadSamples}
          />
        ) : hash.startsWith("#m-") &&
          Object.values(PEOPLE).some((p) => p.href === hash) ? (
          <PersonDetail
            personId={
              Object.values(PEOPLE).find((p) => p.href === hash)!.id as PersonId
            }
            backlogs={backlogs}
            sampleData={sampleData}
            onNavigate={navigate}
            onLoadSamples={handleLoadSamples}
          />
        ) : (
          <Placeholder title={meta.title} description={meta.description} />
        )}
      </AppShell>
      <NewIssueModal
        open={newIssueOpen}
        onClose={() => setNewIssueOpen(false)}
        seed={issueSeed}
        onCreate={handleCreateIssue}
      />
      <BacklogToast
        count={hash === "#backlogs" ? 0 : newBacklogCount}
        onNavigate={() => {
          setNewBacklogCount(0);
          navigate("#backlogs");
        }}
        onDismiss={() => setNewBacklogCount(0)}
      />
      <ChiefOfStaff
        open={chosOpen}
        sampleData={sampleData}
        onClose={() => setChosOpen(false)}
        onNavigate={navigate}
        onLoadSamples={handleLoadSamples}
      />
    </>
  );
}

export default App;
