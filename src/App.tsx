import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import {
  NewIssueModal,
  type NewIssueSeed,
} from "./components/NewIssueModal";
import { Dashboard } from "./pages/Dashboard";
import { Placeholder } from "./pages/Placeholder";
import { ProjectDetail } from "./pages/ProjectDetail";
import { Signals } from "./pages/Signals";

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
    description: "Quarterly objectives and the work that ladders up to them.",
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

function App() {
  const [hash, setHash] = useState<string>(
    () => window.location.hash || "#dashboard"
  );
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [issueSeed, setIssueSeed] = useState<NewIssueSeed | undefined>(undefined);

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
    window.location.hash = href;
    setHash(href);
  };

  const openPlanFromSignal = (seed: NewIssueSeed) => {
    setIssueSeed(seed);
    setNewIssueOpen(true);
  };

  const meta = PAGES[hash] ?? PAGES["#dashboard"];

  return (
    <>
      <AppShell title={meta.title} activeHref={hash} onNavigate={navigate}>
        {hash === "#dashboard" ? (
          <Dashboard />
        ) : hash === "#signals" ? (
          <Signals onPlan={openPlanFromSignal} />
        ) : hash.startsWith("#proj-") ? (
          <ProjectDetail title={meta.title} description={meta.description} />
        ) : (
          <Placeholder title={meta.title} description={meta.description} />
        )}
      </AppShell>
      <NewIssueModal
        open={newIssueOpen}
        onClose={() => setNewIssueOpen(false)}
        seed={issueSeed}
      />
    </>
  );
}

export default App;
