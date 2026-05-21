import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  X,
  Send,
  Paperclip,
  Mic,
  Calendar,
  CalendarDays,
  FileText,
  MessageSquare,
  Bot,
  BrainCircuit,
  Gem,
  Megaphone,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  CircleDot,
  CircleDashed,
  CheckCircle2,
  Mail,
  Slash,
  Clock,
  Plus,
  Gavel,
  PenLine,
  Repeat,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { cn } from "../lib/cn";
import { AtlasAvatar } from "./AtlasAvatar";

type IconType = ComponentType<{
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}>;

// ──────────────────────────────────────────────────────────────────────────
// Sample data
// ──────────────────────────────────────────────────────────────────────────

type EventKind = "internal" | "casual" | "agent" | "external";

type CalendarEvent = {
  id: string;
  type: "meeting" | "task" | "block";
  time: string; // "HH:MM"
  duration: number; // minutes
  title: string;
  meta?: string; // sub line
  kind?: EventKind | "review" | "decide" | "approve" | "focus";
  briefReady?: boolean;
};

const EVENTS: CalendarEvent[] = [
  {
    id: "e-1",
    type: "meeting",
    time: "09:30",
    duration: 15,
    title: "Daily standup",
    meta: "with all agents",
    kind: "agent",
  },
  {
    id: "e-2",
    type: "task",
    time: "10:00",
    duration: 12,
    title: "Review Stripe Tax migration v2",
    meta: "from CTO-agent",
    kind: "review",
  },
  {
    id: "e-3",
    type: "task",
    time: "10:20",
    duration: 8,
    title: "Approve onboarding step-3 spec",
    meta: "from Hanna + UX-agent",
    kind: "approve",
  },
  {
    id: "e-4",
    type: "meeting",
    time: "11:00",
    duration: 45,
    title: "Acme demo prep",
    meta: "with Min Park · Slides v3, 반박 4개",
    kind: "internal",
    briefReady: true,
  },
  {
    id: "e-5",
    type: "block",
    time: "12:00",
    duration: 60,
    title: "Lunch break",
    kind: "focus",
  },
  {
    id: "e-6",
    type: "task",
    time: "13:00",
    duration: 25,
    title: "Decide: Q3 hiring plan (3 candidates)",
    meta: "from Atlas",
    kind: "decide",
  },
  {
    id: "e-7",
    type: "meeting",
    time: "14:00",
    duration: 60,
    title: "Lunch w/ Hanna",
    meta: "with Hanna Kim · onboarding 오너십 / Q3 채용",
    kind: "casual",
  },
  {
    id: "e-8",
    type: "task",
    time: "15:30",
    duration: 12,
    title: "Approve marketing landing copy",
    meta: "from Marketer-agent",
    kind: "approve",
  },
  {
    id: "e-9",
    type: "meeting",
    time: "16:00",
    duration: 30,
    title: "CEO 1:1 check-in",
    meta: "with CEO-agent · Q3 plan delta",
    kind: "agent",
  },
  {
    id: "e-10",
    type: "block",
    time: "17:00",
    duration: 90,
    title: "Focus / wrap",
    kind: "focus",
  },
];

const NOW_TIME = "10:25"; // mocked "current time" for visual indicator

type PrepChecklistItem = { id: string; label: string; done: boolean };
type PrepTask = {
  id: string;
  title: string;
  rationale?: string;
  suggestedAgent: string;
  delegated?: boolean;
};
type EventPrep = {
  brief: string;
  checklist: PrepChecklistItem[];
  tasks: PrepTask[];
};

const EVENT_PREP: Record<string, EventPrep> = {
  "e-2": {
    brief:
      "CTO-agent의 Stripe Tax migration v2. v1 리뷰에서 EU VAT 처리, 환불 시 reverse-charge 케이스가 미흡했음. 이번 v2는 그 두 부분 보강 + 마이그레이션 단계 4 → 3으로 압축.",
    checklist: [
      { id: "c1", label: "v1 리뷰 메모 확인", done: true },
      { id: "c2", label: "변경된 SQL diff 훑기", done: true },
      { id: "c3", label: "Rollback 시나리오 확인", done: false },
    ],
    tasks: [
      {
        id: "t1",
        title: "EU VAT edge case 3개 자동 테스트 결과 dump",
        suggestedAgent: "Engineer-agent",
      },
      {
        id: "t2",
        title: "Stripe Connect 모드별 차이 1-pager",
        suggestedAgent: "CTO-agent",
      },
    ],
  },
  "e-3": {
    brief:
      "Onboarding step-3 spec approval. Hanna(UX) + UX-agent 공동 작업. v0.4부터 telemetry hook이 추가됨. 결정 포인트: hook lifecycle / opt-out 경로 / 분석 이벤트 naming.",
    checklist: [
      { id: "c1", label: "step-1, step-2 일관성 확인", done: true },
      { id: "c2", label: "v0.3 → v0.4 변경 사유 검토", done: true },
      { id: "c3", label: "Telemetry naming 옵션 비교", done: false },
    ],
    tasks: [
      {
        id: "t1",
        title: "Step-3 telemetry payload 샘플 dump",
        suggestedAgent: "Engineer-agent",
      },
      {
        id: "t2",
        title: "Naming convention 옵션 1-pager",
        suggestedAgent: "UX-agent",
        delegated: true,
      },
    ],
  },
  "e-4": {
    brief:
      "Acme 내부 데모 prep · 45분. 11시 미팅 전 Min Park과 슬라이드/반박 시뮬레이션. 지난 콜에서 SOC2 Type II 미보유 + custom SSO 요청이 메인 우려였음. 이번엔 paper proposal + Type I + SSO 가능성을 강조.",
    checklist: [
      { id: "c1", label: "Slides v3 최신 버전 확인", done: true },
      { id: "c2", label: "Acme 사용 케이스 4건 리뷰", done: true },
      { id: "c3", label: "SOC2 Type I 첨부 확인", done: false },
      { id: "c4", label: "반박 4개 시뮬레이션 (Min Park)", done: false },
    ],
    tasks: [
      {
        id: "t1",
        title: "Acme 최근 활동·언론 요약 (지난 30일)",
        suggestedAgent: "CEO-agent",
      },
      {
        id: "t2",
        title: "Custom SSO 구현 가능성 1-pager",
        suggestedAgent: "CTO-agent",
      },
      {
        id: "t3",
        title: "Acme 팀 인물 brief (LinkedIn)",
        suggestedAgent: "Marketer-agent",
        delegated: true,
      },
    ],
  },
  "e-6": {
    brief:
      "Q3 채용 3명 후보 결정. 모두 시니어 백엔드. Daniel·CEO-agent의 추천 점수가 갈림 (#2, #3 의견 차). Reference check은 2/3 완료.",
    checklist: [
      { id: "c1", label: "각 후보 case study 검토", done: true },
      { id: "c2", label: "Reference check 결과 정리", done: false },
      { id: "c3", label: "팀 fit 매트릭스 확인", done: false },
    ],
    tasks: [
      {
        id: "t1",
        title: "후보 3명 강점·약점 sheet 통합",
        suggestedAgent: "CEO-agent",
      },
      {
        id: "t2",
        title: "Reference check 미완료분 fast-track",
        suggestedAgent: "Engineer-agent",
      },
    ],
  },
  "e-7": {
    brief:
      "Hanna와 점심 1:1. 토픽 — Onboarding 재설계 오너십, Q3 채용 (UX 신규 헤드카운트 1명). 지난주 액션: Q3 OKR 워크숍 일정 잡기는 in-progress.",
    checklist: [
      { id: "c1", label: "지난 1:1 액션 진행 상태 확인", done: true },
      { id: "c2", label: "Hanna 최근 PR / Figma 활동 훑기", done: false },
    ],
    tasks: [
      {
        id: "t1",
        title: "Hanna 지난 4주 작업 요약",
        suggestedAgent: "UX-agent",
      },
      {
        id: "t2",
        title: "Q3 UX 헤드카운트 비용 영향",
        suggestedAgent: "CEO-agent",
      },
    ],
  },
  "e-9": {
    brief:
      "CEO-agent와 weekly check-in. Q3 plan delta 리뷰 — runway 가정 변경, ARR 페이스, 채용 우선순위.",
    checklist: [
      { id: "c1", label: "지난 주 OKR 진행 확인", done: true },
      { id: "c2", label: "P&L 변동 요인 훑기", done: true },
      { id: "c3", label: "내일 board update 미리 정리 사항 확인", done: false },
    ],
    tasks: [
      {
        id: "t1",
        title: "Runway 시나리오 3종 시뮬레이션",
        suggestedAgent: "CEO-agent",
      },
      {
        id: "t2",
        title: "지난 주 변화 점수 (decisions vs plan)",
        suggestedAgent: "CEO-agent",
      },
    ],
  },
};

function pickActiveEventId(): string {
  const nowMin = timeToMin(NOW_TIME);
  const inProgress = EVENTS.find((e) => {
    if (e.type === "block") return false;
    const start = timeToMin(e.time);
    return start <= nowMin && nowMin < start + e.duration;
  });
  if (inProgress) return inProgress.id;
  const upcoming = EVENTS.find((e) => {
    if (e.type === "block") return false;
    return timeToMin(e.time) > nowMin;
  });
  return upcoming?.id ?? EVENTS[0].id;
}

function eventTimingLabel(e: CalendarEvent): { label: string; tone: "now" | "soon" | "later" | "past" } {
  const nowMin = timeToMin(NOW_TIME);
  const start = timeToMin(e.time);
  const end = start + e.duration;
  if (start <= nowMin && nowMin < end) {
    const remain = end - nowMin;
    return { label: `In progress · ${remain}분 남음`, tone: "now" };
  }
  if (start > nowMin) {
    const diff = start - nowMin;
    if (diff < 60) return { label: `${diff}분 후 시작`, tone: "soon" };
    const hr = Math.floor(diff / 60);
    const mn = diff % 60;
    return { label: `${hr}시간${mn ? ` ${mn}분` : ""} 후`, tone: "later" };
  }
  return { label: "Past", tone: "past" };
}

const EVENT_META: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  internal: {
    label: "Internal",
    color: "#5f5f5d",
    bg: "rgba(28,28,28,0.05)",
    border: "rgba(28,28,28,0.18)",
  },
  casual: {
    label: "Casual",
    color: "#7c6cff",
    bg: "rgba(124,108,255,0.10)",
    border: "rgba(124,108,255,0.35)",
  },
  agent: {
    label: "Agent",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.10)",
    border: "rgba(37,99,235,0.35)",
  },
  external: {
    label: "External",
    color: "#c89211",
    bg: "rgba(200,146,17,0.10)",
    border: "rgba(200,146,17,0.35)",
  },
  review: {
    label: "Review",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.06)",
    border: "rgba(37,99,235,0.25)",
  },
  decide: {
    label: "Decide",
    color: "#c89211",
    bg: "rgba(200,146,17,0.07)",
    border: "rgba(200,146,17,0.30)",
  },
  approve: {
    label: "Approve",
    color: "#1f8a4c",
    bg: "rgba(31,138,76,0.07)",
    border: "rgba(31,138,76,0.30)",
  },
  focus: {
    label: "Focus",
    color: "#8a8a87",
    bg: "rgba(28,28,28,0.03)",
    border: "rgba(28,28,28,0.10)",
  },
};

type ActionKind = "task" | "decision" | "draft" | "routine" | "send";
type ActionStatus = "todo" | "in_progress" | "done";

type MeetingAction = {
  id: string;
  title: string;
  kind: ActionKind;
  owner: string;
  due?: string;
  status: ActionStatus;
};

type MeetingLogItem = {
  id: string;
  title: string;
  when: string;
  with: string;
  summary: string;
  actions: MeetingAction[];
};

const ACTION_KIND_META: Record<
  ActionKind,
  { label: string; icon: IconType; color: string }
> = {
  task: { label: "Task", icon: ListChecks, color: "#5f5f5d" },
  decision: { label: "Decision", icon: Gavel, color: "#c89211" },
  draft: { label: "Drafting", icon: PenLine, color: "#2563eb" },
  routine: { label: "Routine", icon: Repeat, color: "#1f8a4c" },
  send: { label: "Send", icon: Mail, color: "#5f5f5d" },
};

const ACTION_STATUS_META: Record<
  ActionStatus,
  { label: string; color: string; icon: IconType }
> = {
  todo: { label: "Todo", color: "rgba(28,28,28,0.45)", icon: CircleDashed },
  in_progress: { label: "In progress", color: "#2563eb", icon: CircleDot },
  done: { label: "Done", color: "#1f8a4c", icon: CheckCircle2 },
};

const MEETING_LOG: MeetingLogItem[] = [
  {
    id: "ml-1",
    title: "Acme intro call",
    when: "어제 15:00",
    with: "Acme · CTO + Head of Eng",
    summary:
      "30분. SOC2 문서 + 커스텀 SSO 요청. Type II 미보유 사실 전달. NEXT — 목요일까지 paper proposal + SOC2 Type I 발송.",
    actions: [
      {
        id: "ml-1-a1",
        title: "SOC2 Type I 문서 발송",
        kind: "send",
        owner: "CEO-agent",
        due: "Thu",
        status: "in_progress",
      },
      {
        id: "ml-1-a2",
        title: "Paper proposal v1 초안",
        kind: "draft",
        owner: "Jazz Hwang",
        due: "Wed",
        status: "todo",
      },
      {
        id: "ml-1-a3",
        title: "Custom SSO 가능성 검토",
        kind: "decision",
        owner: "Daniel Kim",
        due: "Fri",
        status: "todo",
      },
      {
        id: "ml-1-a4",
        title: "Acme thank-you follow-up email",
        kind: "send",
        owner: "CEO-agent",
        due: "Tomorrow",
        status: "todo",
      },
    ],
  },
  {
    id: "ml-2",
    title: "Vercel pilot kickoff",
    when: "월 14:00",
    with: "Vercel · Solutions Engineering",
    summary:
      "30일 파일럿 합의 · $48K initial. 성공 기준: workflow throughput 2x, NPS 8+. 주간 status 발송 약속.",
    actions: [
      {
        id: "ml-2-a1",
        title: "주간 status 템플릿 routine 등록",
        kind: "routine",
        owner: "Marketer-agent",
        due: "Today",
        status: "in_progress",
      },
      {
        id: "ml-2-a2",
        title: "Workflow throughput 측정 메서드 합의",
        kind: "decision",
        owner: "Daniel Kim",
        due: "Wed",
        status: "todo",
      },
      {
        id: "ml-2-a3",
        title: "Pilot 성공 기준 대시보드 셋업",
        kind: "task",
        owner: "Engineer-agent",
        due: "Mon",
        status: "todo",
      },
    ],
  },
  {
    id: "ml-3",
    title: "1:1 with Hanna",
    when: "지난 금 17:00",
    with: "Hanna Kim (UX)",
    summary:
      "Onboarding 재설계 오너십을 Hanna가 가져가기로 합의. Q3 OKR 워크숍을 함께 짜기로.",
    actions: [
      {
        id: "ml-3-a1",
        title: "Q3 OKR 워크숍 일정 잡기",
        kind: "task",
        owner: "Jazz Hwang",
        due: "Today",
        status: "in_progress",
      },
      {
        id: "ml-3-a2",
        title: "Onboarding redesign brief 작성",
        kind: "draft",
        owner: "Hanna Kim",
        due: "Fri",
        status: "todo",
      },
      {
        id: "ml-3-a3",
        title: "현재 onboarding metrics 공유",
        kind: "send",
        owner: "Engineer-agent",
        due: "Tomorrow",
        status: "done",
      },
    ],
  },
];

type Delegation = {
  id: string;
  agent: string;
  task: string;
  status: "in_progress" | "awaiting_review" | "done";
  eta?: string;
};

const DELEGATIONS: Delegation[] = [
  {
    id: "d-1",
    agent: "Marketer-agent",
    task: "Q2 launch 랜딩 카피 초안",
    status: "awaiting_review",
  },
  {
    id: "d-2",
    agent: "CTO-agent",
    task: "Stripe Tax migration plan v2",
    status: "awaiting_review",
  },
  {
    id: "d-3",
    agent: "CEO-agent",
    task: "Linear marketplace 갭 분석",
    status: "in_progress",
    eta: "2h",
  },
  {
    id: "d-4",
    agent: "Marketer-agent",
    task: "Competitor pricing 주간 스냅샷",
    status: "done",
  },
];

const AGENT_ICONS: Record<string, IconType> = {
  CEO: Bot,
  "CEO-agent": Bot,
  CTO: BrainCircuit,
  "CTO-agent": BrainCircuit,
  UXDesigner: Gem,
  "UX-agent": Gem,
  Marketer: Megaphone,
  "Marketer-agent": Megaphone,
  Engineer: Wrench,
  "Engineer-agent": Wrench,
};

const DELEGATION_META: Record<
  Delegation["status"],
  { label: string; color: string; icon: IconType }
> = {
  in_progress: { label: "In progress", color: "#2563eb", icon: CircleDot },
  awaiting_review: {
    label: "Awaiting review",
    color: "#c89211",
    icon: CircleDashed,
  },
  done: { label: "Done", color: "#1f8a4c", icon: CheckCircle2 },
};

type ChatMsg = { id: string; from: "atlas" | "you"; text: string };

const SEED_MESSAGES: ChatMsg[] = [
  {
    id: "m-1",
    from: "atlas",
    text:
      "Morning. 오늘 미팅 4건, 사람 결정이 필요한 일 4건이에요. 캘린더에 시간 슬롯도 잡아뒀습니다. Acme 미팅 brief부터 보실래요?",
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Layout constants
// ──────────────────────────────────────────────────────────────────────────

const START_HOUR = 9;
const END_HOUR = 18;
const MIN_PER_PX = 1 / 1.5; // 1.5 px per minute
const HOUR_HEIGHT = 60 * 1.5; // = 90px per hour
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function timeToY(t: string): number {
  const m = timeToMin(t) - START_HOUR * 60;
  return m / MIN_PER_PX;
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

type Tab = "today" | "log" | "chat";

type Props = {
  open: boolean;
  sampleData: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  onLoadSamples: () => void;
};

export function ChiefOfStaff({
  open,
  sampleData,
  onClose,
  onNavigate,
  onLoadSamples,
}: Props) {
  const [tab, setTab] = useState<Tab>("today");
  const [recording, setRecording] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>(SEED_MESSAGES);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, tab]);

  if (!open) return null;

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, from: "you", text: t },
      {
        id: `a-${Date.now()}`,
        from: "atlas",
        text: "확인했어요. 관련 컨텍스트 정리해서 곧 다시 보고드릴게요.",
      },
    ]);
    setInput("");
  };

  const askAtlas = (prompt: string) => {
    setTab("chat");
    setInput(prompt);
  };

  const today = new Date().toLocaleDateString("ko-KR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4 py-[4vh]">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-charcoal/25 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Atlas — your Chief of Staff"
        className="relative flex h-full max-h-[92vh] w-full max-w-content flex-col overflow-hidden rounded-container border border-cream-light bg-cream shadow-focus"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-cream-light px-5 py-3">
          <AtlasAvatar size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-[480] text-charcoal">Atlas</p>
            <p className="text-[12px] text-charcoal-muted">
              Chief of Staff · Jazz Hwang
            </p>
          </div>

          {/* Tabs */}
          <div className="hidden items-center gap-1 rounded-pill bg-charcoal/[0.06] p-1 md:inline-flex">
            <TabBtn
              active={tab === "today"}
              onClick={() => setTab("today")}
              icon={<Calendar className="h-3.5 w-3.5" strokeWidth={1.8} />}
              label="Today"
            />
            <TabBtn
              active={tab === "log"}
              onClick={() => setTab("log")}
              icon={<FileText className="h-3.5 w-3.5" strokeWidth={1.8} />}
              label="Meeting log"
              badge={MEETING_LOG.length}
            />
            <TabBtn
              active={tab === "chat"}
              onClick={() => setTab("chat")}
              icon={<MessageSquare className="h-3.5 w-3.5" strokeWidth={1.8} />}
              label="Ask Atlas"
            />
          </div>

          <kbd className="hidden items-center gap-1 rounded border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] text-charcoal-muted md:inline-flex">
            ⌘J
          </kbd>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-charcoal/[0.04] hover:text-charcoal"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0 flex-col">
          {tab === "today" && (
            <TodayPane
              today={today}
              sampleData={sampleData}
              recording={recording}
              onRecord={() => setRecording((v) => !v)}
              onAskAtlas={askAtlas}
              onLoadSamples={() => {
                onLoadSamples();
              }}
              onNavigate={(h) => {
                onClose();
                onNavigate(h);
              }}
            />
          )}
          {tab === "log" && (
            <LogPane
              log={sampleData ? MEETING_LOG : []}
              sampleData={sampleData}
              onAsk={(m) => askAtlas(`${m.title} 후속 액션 정리해줘`)}
              onLoadSamples={onLoadSamples}
            />
          )}
          {tab === "chat" && (
            <ChatPane
              chatRef={chatRef}
              messages={messages}
              input={input}
              setInput={setInput}
              onSend={handleSend}
              onNavigate={(h) => {
                onClose();
                onNavigate(h);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Atlas empty state (when sampleData = false)
// ──────────────────────────────────────────────────────────────────────────

function AtlasEmpty({
  title,
  body,
  onLoadSamples,
}: {
  title: string;
  body: string;
  onLoadSamples: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-8 py-12">
      <div className="max-w-md text-center">
        <p className="text-[15.5px] font-[480] text-charcoal">{title}</p>
        <p className="mt-2 text-[13px] leading-[1.55] text-charcoal-muted">
          {body}
        </p>
        <button
          type="button"
          onClick={onLoadSamples}
          className="btn-primary mt-5 inline-flex h-9 items-center gap-1.5 px-3.5 text-[13px]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          샘플 데이터 채우기
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Today pane (calendar-first)
// ──────────────────────────────────────────────────────────────────────────

function TodayPane({
  today,
  sampleData,
  recording,
  onRecord,
  onAskAtlas,
  onLoadSamples,
  onNavigate,
}: {
  today: string;
  sampleData: boolean;
  recording: boolean;
  onRecord: () => void;
  onAskAtlas: (prompt: string) => void;
  onLoadSamples: () => void;
  onNavigate: (href: string) => void;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string>(() =>
    pickActiveEventId()
  );
  const selectedEvent =
    EVENTS.find((e) => e.id === selectedEventId) ??
    EVENTS.find((e) => e.id === pickActiveEventId());

  if (!sampleData) {
    return (
      <AtlasEmpty
        title="오늘 일정이 비어 있습니다"
        body="샘플 데이터를 켜면 오늘 일정 · prep brief · checklist · delegations가 모두 채워집니다."
        onLoadSamples={onLoadSamples}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Day header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-cream-light px-5 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous day"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-charcoal/[0.04] hover:text-charcoal"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Next day"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-charcoal-muted transition hover:bg-charcoal/[0.04] hover:text-charcoal"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
        <p className="text-[15px] font-[480] text-charcoal">{today}</p>
        <span className="text-charcoal-muted/60">·</span>
        <p className="text-[13px] text-charcoal-muted">
          {EVENTS.filter((e) => e.type === "meeting").length} meetings ·{" "}
          {EVENTS.filter((e) => e.type === "task").length} tasks
        </p>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="inline-flex items-center gap-1 rounded-pill bg-charcoal/[0.06] p-1">
            <ViewSeg active label="Day" />
            <ViewSeg label="Week" />
            <ViewSeg label="Agenda" />
          </div>
          <button
            type="button"
            aria-label="Add event"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-cream-light bg-cream text-charcoal-muted transition hover:bg-charcoal/[0.04] hover:text-charcoal"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={onRecord}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md px-3.5 text-[13.5px] transition",
              recording
                ? "bg-danger text-white shadow-inset-dark"
                : "btn-primary"
            )}
          >
            {recording ? (
              <>
                <span className="relative grid h-2 w-2 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/60" />
                  <span className="relative h-2 w-2 rounded-full bg-white" />
                </span>
                Recording…
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" strokeWidth={1.8} />
                Record meeting
              </>
            )}
          </button>
        </div>
      </div>

      {/* Calendar + right prep panel */}
      <div className="flex min-h-0 flex-1">
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <CalendarTimeline
            onAskAtlas={onAskAtlas}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
          />
        </div>
        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-cream-light bg-charcoal/[0.015] lg:flex">
          <EventPrepPanel event={selectedEvent} onAskAtlas={onAskAtlas} />
        </aside>
      </div>

      {/* Delegations strip */}
      <div className="border-t border-cream-light bg-cream px-5 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
            Delegations
          </span>
          {DELEGATIONS.map((d) => {
            const meta = DELEGATION_META[d.status];
            const StatusIcon = meta.icon;
            const AgentIcon = AGENT_ICONS[d.agent] ?? Bot;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onAskAtlas(`${d.agent}이 작업한 "${d.task}" 결과 보여줘`)}
                title={`${d.agent} · ${d.task}`}
                className="inline-flex items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2 py-1 text-[12px] text-charcoal transition hover:bg-charcoal/[0.04]"
              >
                <AgentIcon className="h-3 w-3" strokeWidth={1.6} />
                <span className="max-w-[160px] truncate">{d.task}</span>
                <StatusIcon
                  className="h-3 w-3 shrink-0"
                  style={{ color: meta.color }}
                  strokeWidth={1.8}
                />
                {d.eta && (
                  <span className="text-[11px] text-charcoal-muted">{d.eta}</span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onNavigate("#backlogs")}
            className="ml-auto inline-flex items-center gap-0.5 text-[11.5px] text-charcoal-muted transition hover:text-charcoal"
          >
            View all
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarTimeline({
  onAskAtlas,
  selectedEventId,
  onSelectEvent,
}: {
  onAskAtlas: (prompt: string) => void;
  selectedEventId: string;
  onSelectEvent: (id: string) => void;
}) {
  const nowY = timeToY(NOW_TIME);
  return (
    <div
      className="relative pl-14 pr-1"
      style={{ height: TOTAL_HEIGHT }}
    >
      {/* Hour rows */}
      {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
        const hour = START_HOUR + i;
        const y = i * HOUR_HEIGHT;
        return (
          <div
            key={hour}
            className="absolute left-0 right-0"
            style={{ top: y }}
          >
            <span className="absolute -top-1.5 left-0 w-10 text-right text-[11px] tabular-nums text-charcoal-muted">
              {String(hour).padStart(2, "0")}:00
            </span>
            <div className="ml-12 h-px bg-cream-light" />
          </div>
        );
      })}

      {/* Now indicator */}
      <div
        className="pointer-events-none absolute left-12 right-0 z-10"
        style={{ top: nowY }}
      >
        <div className="relative">
          <span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-danger ring-2 ring-cream" />
          <div className="h-px bg-danger" />
        </div>
        <span className="absolute -top-3 right-1 rounded bg-danger px-1 py-0 text-[10px] font-[480] text-white">
          {NOW_TIME}
        </span>
      </div>

      {/* Events */}
      {EVENTS.map((e) => (
        <CalendarBlock
          key={e.id}
          event={e}
          onAskAtlas={onAskAtlas}
          selected={e.id === selectedEventId}
          onSelect={() => onSelectEvent(e.id)}
        />
      ))}
    </div>
  );
}

function CalendarBlock({
  event,
  onAskAtlas,
  selected,
  onSelect,
}: {
  event: CalendarEvent;
  onAskAtlas: (prompt: string) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const y = timeToY(event.time);
  const h = Math.max(28, event.duration / MIN_PER_PX);
  const meta = event.kind ? EVENT_META[event.kind] : EVENT_META.internal;

  if (event.type === "block") {
    return (
      <div
        className="absolute right-1 rounded-md border border-dashed bg-transparent px-3 py-1.5 text-[11.5px]"
        style={{
          top: y,
          left: 48,
          height: h,
          borderColor: meta.border,
          color: meta.color,
        }}
        title={event.title}
      >
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" strokeWidth={1.6} />
          {event.title}
        </span>
      </div>
    );
  }

  if (event.type === "meeting") {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "absolute right-1 cursor-pointer overflow-hidden rounded-md border px-2.5 py-1.5 transition",
          selected && "ring-2 ring-charcoal/50 ring-offset-1 ring-offset-cream"
        )}
        style={{
          top: y,
          left: 48,
          height: h,
          borderColor: meta.border,
          backgroundColor: meta.bg,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="rounded-pill px-1.5 py-0 text-[10px] font-[480] uppercase tracking-[0.06em]"
            style={{ color: meta.color, backgroundColor: meta.bg }}
          >
            {meta.label}
          </span>
          <p
            className="truncate text-[13px] font-[480]"
            style={{ color: meta.color }}
          >
            {event.title}
          </p>
          <span
            className="ml-auto shrink-0 text-[10.5px] tabular-nums"
            style={{ color: meta.color }}
          >
            {event.time} · {event.duration}m
          </span>
        </div>
        {event.meta && (
          <p
            className="mt-0.5 truncate text-[11px]"
            style={{ color: meta.color, opacity: 0.75 }}
          >
            {event.meta}
          </p>
        )}
        {event.briefReady && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAskAtlas(`${event.title} brief 보여줘`);
            }}
            className="mt-1 inline-flex items-center gap-1 rounded-pill border border-cream-light bg-cream px-1.5 py-0 text-[10.5px] text-charcoal transition hover:bg-charcoal/[0.04]"
          >
            <FileText className="h-2.5 w-2.5" strokeWidth={1.6} />
            Atlas brief
          </button>
        )}
      </div>
    );
  }

  // task
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group absolute right-1 cursor-pointer overflow-hidden rounded-md border bg-cream px-2.5 py-1.5 transition",
        selected && "ring-2 ring-charcoal/50 ring-offset-1 ring-offset-cream"
      )}
      style={{
        top: y,
        left: 48,
        height: h,
        borderColor: meta.border,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="grid h-3 w-3 shrink-0 place-items-center rounded-pill border"
          style={{ borderColor: meta.color }}
          title={meta.label}
        />
        <span
          className="rounded-pill px-1.5 py-0 text-[10px] font-[480] uppercase tracking-[0.06em]"
          style={{ color: meta.color, backgroundColor: meta.bg }}
        >
          {meta.label}
        </span>
        <p className="truncate text-[12.5px] text-charcoal">{event.title}</p>
        <span className="ml-auto shrink-0 text-[10.5px] tabular-nums text-charcoal-muted">
          {event.time} · {event.duration}m
        </span>
      </div>
      {event.meta && (
        <p className="mt-0.5 truncate text-[11px] text-charcoal-muted">
          {event.meta}
        </p>
      )}
      <div className="mt-0.5 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="rounded-md border border-cream-light bg-cream px-1.5 py-0 text-[10.5px] text-charcoal transition hover:bg-charcoal/[0.04]"
        >
          Open
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAskAtlas(`이걸 적절한 에이전트에게 위임해줘: ${event.title}`);
          }}
          className="rounded-md border border-cream-light bg-cream px-1.5 py-0 text-[10.5px] text-charcoal transition hover:bg-charcoal/[0.04]"
        >
          Delegate
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Event prep panel (right sidebar in Today)
// ──────────────────────────────────────────────────────────────────────────

function EventPrepPanel({
  event,
  onAskAtlas,
}: {
  event: CalendarEvent | undefined;
  onAskAtlas: (prompt: string) => void;
}) {
  if (!event) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <p className="text-[13px] text-charcoal-muted">
          캘린더에서 일정을 선택하면 brief가 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  const meta = event.kind ? EVENT_META[event.kind] : EVENT_META.internal;
  const timing = eventTimingLabel(event);
  const prep = EVENT_PREP[event.id];
  const checklistDone = prep ? prep.checklist.filter((c) => c.done).length : 0;
  const checklistTotal = prep ? prep.checklist.length : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="border-b border-cream-light px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span
            className="rounded-pill px-1.5 py-0.5 text-[10px] font-[480] uppercase tracking-[0.06em]"
            style={{ color: meta.color, backgroundColor: meta.bg }}
          >
            {meta.label}
          </span>
          <TimingChip tone={timing.tone} label={timing.label} />
        </div>
        <p className="mt-1.5 text-[15px] font-[480] leading-[1.3] text-charcoal">
          {event.title}
        </p>
        <p className="mt-0.5 text-[12px] text-charcoal-muted">
          {event.time} · {event.duration}분{event.meta ? ` · ${event.meta}` : ""}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Brief */}
        <Section title="Brief" icon={FileText}>
          <p className="text-[13px] leading-[1.55] text-charcoal">
            {prep?.brief ??
              "Atlas가 아직 brief를 만들지 않았습니다. 미팅이 가까워지면 자동으로 채워집니다."}
          </p>
          <button
            type="button"
            onClick={() => onAskAtlas(`${event.title} brief 보여줘`)}
            className="mt-2 inline-flex items-center gap-1 text-[11.5px] text-charcoal-muted underline-offset-4 transition hover:text-charcoal hover:underline"
          >
            <MessageSquare className="h-3 w-3" strokeWidth={1.6} />
            Atlas에 더 묻기
          </button>
        </Section>

        {/* Checklist */}
        {prep && prep.checklist.length > 0 && (
          <Section
            title="Prep checklist"
            icon={CheckCircle2}
            count={`${checklistDone}/${checklistTotal}`}
          >
            <ul className="flex flex-col gap-1.5">
              {prep.checklist.map((c) => (
                <li
                  key={c.id}
                  className={cn(
                    "flex items-start gap-2 text-[13px]",
                    c.done ? "text-charcoal-muted line-through" : "text-charcoal"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-sm border",
                      c.done
                        ? "border-success bg-success text-cream"
                        : "border-charcoal/30 bg-cream"
                    )}
                  >
                    {c.done && (
                      <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                    )}
                  </span>
                  <span className="leading-[1.4]">{c.label}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Prep tasks (delegatable) */}
        {prep && prep.tasks.length > 0 && (
          <Section title="Prep tasks" icon={ListChecks}>
            <ul className="flex flex-col gap-2">
              {prep.tasks.map((t) => (
                <PrepTaskRow
                  key={t.id}
                  task={t}
                  eventTitle={event.title}
                  onAskAtlas={onAskAtlas}
                />
              ))}
            </ul>
          </Section>
        )}

        {!prep && (
          <div className="mt-2 rounded-md border border-dashed border-cream-light p-3 text-[12.5px] text-charcoal-muted">
            이 일정에는 아직 prep 데이터가 없습니다.{" "}
            <button
              type="button"
              onClick={() =>
                onAskAtlas(`${event.title} 준비할 체크리스트와 prep task 뽑아줘`)
              }
              className="text-charcoal underline-offset-4 hover:underline"
            >
              Atlas에 만들기 요청
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: IconType;
  count?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-charcoal-muted" strokeWidth={1.8} />
        <p className="text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
          {title}
        </p>
        {count && (
          <span className="ml-auto rounded-pill border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] text-charcoal-muted">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function TimingChip({
  tone,
  label,
}: {
  tone: "now" | "soon" | "later" | "past";
  label: string;
}) {
  const cfg: Record<typeof tone, { bg: string; color: string }> = {
    now: { bg: "rgba(184,68,58,0.10)", color: "#b8443a" },
    soon: { bg: "rgba(200,146,17,0.12)", color: "#c89211" },
    later: { bg: "rgba(28,28,28,0.05)", color: "#5f5f5d" },
    past: { bg: "rgba(28,28,28,0.04)", color: "#8a8a87" },
  };
  const c = cfg[tone];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-pill px-1.5 py-0.5 text-[10.5px] font-[480]"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {tone === "now" && (
        <span className="relative grid h-1.5 w-1.5 place-items-center">
          <span
            className="absolute inset-0 animate-ping rounded-full opacity-60"
            style={{ backgroundColor: c.color }}
          />
          <span
            className="relative h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: c.color }}
          />
        </span>
      )}
      {label}
    </span>
  );
}

function PrepTaskRow({
  task,
  eventTitle,
  onAskAtlas,
}: {
  task: PrepTask;
  eventTitle: string;
  onAskAtlas: (prompt: string) => void;
}) {
  const AgentIcon = AGENT_ICONS[task.suggestedAgent] ?? Bot;
  return (
    <li className="group rounded-md border border-cream-light bg-cream px-3 py-2 transition hover:border-charcoal/15">
      <p className="text-[13px] leading-[1.4] text-charcoal">{task.title}</p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[11.5px] text-charcoal-muted">
          <AgentIcon className="h-3 w-3" strokeWidth={1.6} />
          {task.suggestedAgent}
        </span>
        {task.delegated ? (
          <span className="inline-flex items-center gap-1 rounded-pill border border-success/25 bg-success/[0.08] px-1.5 py-0.5 text-[10.5px] font-[480] text-success">
            <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={1.8} />
            Delegated
          </span>
        ) : (
          <button
            type="button"
            onClick={() =>
              onAskAtlas(
                `"${eventTitle}" 준비를 위해 ${task.suggestedAgent}에게 위임해줘: ${task.title}`
              )
            }
            className="inline-flex items-center gap-1 rounded-md border border-cream-light bg-cream px-2 py-0.5 text-[11px] text-charcoal transition hover:bg-charcoal/[0.04]"
          >
            Delegate
            <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
          </button>
        )}
      </div>
    </li>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Log pane
// ──────────────────────────────────────────────────────────────────────────

function LogPane({
  log,
  sampleData,
  onAsk,
  onLoadSamples,
}: {
  log: MeetingLogItem[];
  sampleData: boolean;
  onAsk: (m: MeetingLogItem) => void;
  onLoadSamples: () => void;
}) {
  if (!sampleData) {
    return (
      <AtlasEmpty
        title="아직 기록된 미팅이 없습니다"
        body="샘플 데이터를 켜면 Atlas가 자동 기록한 미팅과 follow-up 액션이 표시됩니다."
        onLoadSamples={onLoadSamples}
      />
    );
  }
  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      <p className="mb-4 text-[12.5px] text-charcoal-muted">
        Atlas가 미팅마다 자동 기록하고 후속 액션을 뽑아냅니다.
      </p>
      <ul className="space-y-4">
        {log.map((m) => (
          <li key={m.id} className="card overflow-hidden">
            <div className="border-b border-cream-light px-4 py-2.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="text-[14px] font-[480] text-charcoal">
                  {m.title}
                </p>
                <p className="text-[11.5px] text-charcoal-muted">· {m.when}</p>
                <p className="text-[11.5px] text-charcoal-muted">· {m.with}</p>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-[13.5px] leading-[1.55] text-charcoal">
                {m.summary}
              </p>
            </div>

            {m.actions.length > 0 && (
              <div className="border-t border-cream-light bg-charcoal/[0.015]">
                <div className="flex items-center justify-between gap-2 px-4 py-2">
                  <p className="text-[11px] font-[480] uppercase tracking-[0.08em] text-charcoal-muted">
                    Follow-up actions · {m.actions.length}
                  </p>
                  <button
                    type="button"
                    onClick={() => onAsk(m)}
                    className="inline-flex items-center gap-1 text-[11.5px] text-charcoal-muted underline-offset-4 transition hover:text-charcoal hover:underline"
                  >
                    <MessageSquare className="h-3 w-3" strokeWidth={1.6} />
                    Atlas에 묻기
                  </button>
                </div>
                <ul className="divide-y divide-cream-light">
                  {m.actions.map((a) => (
                    <ActionRow key={a.id} action={a} />
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActionRow({ action }: { action: MeetingAction }) {
  const kind = ACTION_KIND_META[action.kind];
  const status = ACTION_STATUS_META[action.status];
  const KindIcon = kind.icon;
  const StatusIcon = status.icon;
  const ownerIsAgent = action.owner.toLowerCase().includes("agent");
  return (
    <li className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-2.5 transition hover:bg-charcoal/[0.025]">
      <span
        aria-label={kind.label}
        title={kind.label}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-cream-light bg-cream"
        style={{ color: kind.color }}
      >
        <KindIcon className="h-4 w-4" strokeWidth={1.6} />
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-pill px-1.5 py-0.5 text-[10.5px] font-[480] uppercase tracking-[0.06em]"
            style={{
              color: kind.color,
              backgroundColor: `${kind.color}14`,
              border: `1px solid ${kind.color}33`,
            }}
          >
            {kind.label}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-pill border border-cream-light bg-cream px-1.5 py-0.5 text-[10.5px] text-charcoal"
            title={ownerIsAgent ? "Agent owner" : "Human owner"}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                ownerIsAgent ? "bg-info" : "bg-charcoal/60"
              )}
            />
            {action.owner}
          </span>
          {action.due && (
            <span className="inline-flex items-center gap-1 text-[11px] text-charcoal-muted">
              <Clock className="h-3 w-3" strokeWidth={1.6} />
              {action.due}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 text-[11px]"
            style={{ color: status.color }}
          >
            <StatusIcon className="h-3 w-3" strokeWidth={1.8} />
            {status.label}
          </span>
        </div>
        <p className="mt-1 truncate text-[13.5px] leading-[1.35] text-charcoal">
          {action.title}
        </p>
      </div>

      <button
        type="button"
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-cream-light bg-cream px-2 text-[12px] text-charcoal opacity-0 transition hover:bg-charcoal/[0.04] group-hover:opacity-100"
      >
        Plan
        <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
      </button>
    </li>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Chat pane
// ──────────────────────────────────────────────────────────────────────────

function ChatPane({
  chatRef,
  messages,
  input,
  setInput,
  onSend,
  onNavigate,
}: {
  chatRef: React.RefObject<HTMLDivElement | null>;
  messages: ChatMsg[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="border-b border-cream-light px-5 py-3">
        <div className="flex items-center gap-2 text-[12.5px] text-charcoal-muted">
          <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span className="font-[480] text-charcoal">Ask Atlas</span>
          <span>질문 · 위임 · 회의 후속 액션 — 무엇이든</span>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((m) => (
          <Bubble key={m.id} from={m.from}>
            {m.text}
          </Bubble>
        ))}

        <QuickActions
          onPick={(p) => setInput(p)}
          onNavigate={onNavigate}
        />
      </div>

      <Composer input={input} setInput={setInput} onSend={onSend} />
    </div>
  );
}

function Bubble({
  from,
  children,
}: {
  from: "atlas" | "you";
  children: ReactNode;
}) {
  const isYou = from === "you";
  return (
    <div className={cn("flex gap-2", isYou && "flex-row-reverse")}>
      {isYou ? (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-pill bg-charcoal text-[10.5px] font-[480] text-charcoal-offwhite shadow-inset-dark">
          JH
        </span>
      ) : (
        <AtlasAvatar size="sm" />
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-card px-3 py-2 text-[13.5px] leading-[1.55]",
          isYou
            ? "bg-charcoal text-charcoal-offwhite"
            : "border border-cream-light bg-cream text-charcoal"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function QuickActions({
  onPick,
  onNavigate,
}: {
  onPick: (prompt: string) => void;
  onNavigate: (href: string) => void;
}) {
  const items: { label: string; icon: IconType; action: () => void }[] = [
    {
      label: "오늘 일정 정리",
      icon: CalendarDays,
      action: () => onPick("오늘 일정 다시 정리해서 요약해줘"),
    },
    {
      label: "이메일 초안",
      icon: Mail,
      action: () => onPick("Acme에게 follow-up 메일 초안 작성해줘"),
    },
    {
      label: "회의 후속 액션",
      icon: FileText,
      action: () => onPick("어제 미팅 후속 액션을 한 리스트로 정리해줘"),
    },
    {
      label: "Backlog로 보내기",
      icon: ArrowUpRight,
      action: () => onNavigate("#backlogs"),
    },
    {
      label: "Routine 만들기",
      icon: Clock,
      action: () => onPick("이걸 매주 자동 처리되는 routine으로 등록해줘"),
    },
    {
      label: "방해 금지 90분",
      icon: Slash,
      action: () => onPick("앞으로 90분 동안 방해 금지로 잡아줘"),
    },
  ];
  return (
    <div className="pt-1">
      <p className="mb-1.5 text-[10.5px] uppercase tracking-[0.08em] text-charcoal-muted">
        Quick actions
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              type="button"
              onClick={it.action}
              className="inline-flex items-center gap-1.5 rounded-pill border border-cream-light bg-cream px-2.5 py-1 text-[11.5px] text-charcoal transition hover:bg-charcoal/[0.04]"
            >
              <Icon className="h-3 w-3 text-charcoal-muted" strokeWidth={1.6} />
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Composer({
  input,
  setInput,
  onSend,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="border-t border-cream-light p-3">
      <div className="flex items-end gap-2 rounded-md border border-cream-light bg-cream px-2.5 py-1.5 focus-within:shadow-focus">
        <button
          type="button"
          aria-label="Attach"
          className="inline-flex h-7 w-7 items-center justify-center rounded text-charcoal-muted transition hover:bg-charcoal/[0.04] hover:text-charcoal"
        >
          <Paperclip className="h-3.5 w-3.5" strokeWidth={1.6} />
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="질문, 위임, 회의 후속 액션 — 무엇이든…"
          rows={1}
          className="flex-1 resize-none border-0 bg-transparent py-1 text-[14px] text-charcoal placeholder:text-charcoal-muted focus:outline-none"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!input.trim()}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md bg-charcoal text-charcoal-offwhite shadow-inset-dark transition",
            !input.trim() && "opacity-40"
          )}
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-charcoal-muted">
        Atlas만 봅니다 · ⏎ 전송 · ⇧⏎ 줄바꿈
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Small bits
// ──────────────────────────────────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-pill px-2.5 text-[12.5px] transition",
        active
          ? "bg-cream text-charcoal shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(28,28,28,0.04)]"
          : "text-charcoal-muted hover:text-charcoal"
      )}
    >
      {icon}
      {label}
      {typeof badge === "number" && badge > 0 && (
        <span
          className={cn(
            "rounded-pill px-1 text-[10.5px]",
            active
              ? "bg-charcoal/[0.06] text-charcoal-muted"
              : "bg-cream text-charcoal-muted"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function ViewSeg({ active, label }: { active?: boolean; label: string }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-7 items-center rounded-pill px-2.5 text-[12px] transition",
        active
          ? "bg-cream text-charcoal shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(28,28,28,0.04)]"
          : "text-charcoal-muted hover:text-charcoal"
      )}
    >
      {label}
    </button>
  );
}

