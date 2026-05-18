// Connector data model and seed catalog.
// Each connector exposes "capabilities" — signals it can emit and task actions
// an agent can perform on it. Routines (scheduled flows) are a *separate* entity
// living in lib/routines.ts; they reference connectors by id via requiredConnectors.

export type ConnectorStatus = "connected" | "available" | "error" | "syncing";
export type CapabilityKind = "signal" | "task";
export type ConnectorCategory =
  | "knowledge"
  | "comms"
  | "code"
  | "ops"
  | "sales"
  | "marketing"
  | "data"
  | "compliance";

export type Capability = {
  id: string;
  kind: CapabilityKind;
  label: string;
  description: string;
  enabled: boolean;
  schedule?: string;
};

export type Connector = {
  id: string;
  name: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  description: string;
  brandColor: string;
  badge: string; // 1-2 letter abbreviation rendered on the colored tile
  workspace?: string;
  scopes?: string[];
  lastSync?: string;
  errorReason?: string;
  capabilities: Capability[];
};

export const CATEGORY_LABEL: Record<ConnectorCategory, string> = {
  knowledge: "Knowledge",
  comms: "Comms",
  code: "Code",
  ops: "Ops",
  sales: "Sales & CS",
  marketing: "Marketing",
  data: "Data",
  compliance: "Compliance",
};

export const INITIAL_CONNECTORS: Connector[] = [
  {
    id: "notion",
    name: "Notion",
    category: "knowledge",
    status: "connected",
    description:
      "워크스페이스 문서를 인덱싱해 에이전트가 컨텍스트로 사용합니다.",
    brandColor: "#1c1c1c",
    badge: "N",
    workspace: "sprint-org · 142 pages",
    scopes: ["read.pages", "read.databases", "comment"],
    lastSync: "3분 전",
    capabilities: [
      {
        id: "notion-sig-1",
        kind: "signal",
        label: "OKR 키워드 멘션",
        description:
          "Notion 문서에서 OKR/KR 키워드가 언급되면 시그널로 수집합니다.",
        enabled: true,
      },
      {
        id: "notion-sig-2",
        kind: "signal",
        label: "Research DB 신규 항목",
        description:
          "Research DB에 신규 항목이 추가되면 ICP 키워드와 매칭해 알립니다.",
        enabled: true,
      },
      {
        id: "notion-task-1",
        kind: "task",
        label: "Save spec to Notion",
        description:
          "에이전트가 결정한 스펙/디시전을 자동으로 페이지로 저장합니다.",
        enabled: true,
      },
      {
        id: "notion-task-2",
        kind: "task",
        label: "Search Notion context",
        description: "태스크 실행 시 관련 문서를 컨텍스트로 자동 첨부합니다.",
        enabled: true,
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    category: "comms",
    status: "connected",
    description: "팀 채널의 신호를 흘려보내고 에이전트가 직접 응답합니다.",
    brandColor: "#4a154b",
    badge: "S",
    workspace: "sprint-org · 24 channels",
    scopes: ["channels:read", "chat:write", "im:write"],
    lastSync: "방금 전",
    capabilities: [
      {
        id: "slack-sig-1",
        kind: "signal",
        label: "@atlas 멘션",
        description: "어디서든 @atlas 멘션이 발생하면 시그널로 큐잉합니다.",
        enabled: true,
      },
      {
        id: "slack-sig-2",
        kind: "signal",
        label: "#intel-competitor 키워드",
        description: "경쟁사 관련 채널의 키워드 매치를 감지합니다.",
        enabled: true,
      },
      {
        id: "slack-sig-3",
        kind: "signal",
        label: "On-call escalation",
        description: "#oncall 채널의 P0/P1 키워드를 hot 시그널로 승격합니다.",
        enabled: true,
      },
      {
        id: "slack-task-1",
        kind: "task",
        label: "Send thread reply",
        description: "에이전트가 직접 스레드에 답글을 남길 수 있습니다.",
        enabled: true,
      },
      {
        id: "slack-task-2",
        kind: "task",
        label: "Notify channel on done",
        description: "태스크 완료 시 출처 채널에 자동으로 보고합니다.",
        enabled: true,
      },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    category: "code",
    status: "connected",
    description:
      "코드 활동을 신호로 흘려보내고 에이전트가 PR을 직접 운용합니다.",
    brandColor: "#1c1c1c",
    badge: "G",
    workspace: "sprint-org · 18 repos",
    scopes: ["repo", "pull_requests:write", "actions:read"],
    lastSync: "1분 전",
    capabilities: [
      {
        id: "gh-sig-1",
        kind: "signal",
        label: "Stale PR (>3d)",
        description: "리뷰 정체된 PR을 트리아지 시그널로 승격합니다.",
        enabled: true,
      },
      {
        id: "gh-sig-2",
        kind: "signal",
        label: "CI failure on main",
        description: "main 브랜치 CI 실패를 hot 시그널로 분류합니다.",
        enabled: true,
      },
      {
        id: "gh-sig-3",
        kind: "signal",
        label: "Issue with label bug",
        description: "신규 bug 라벨 이슈를 Bug 시그널로 수집합니다.",
        enabled: true,
      },
      {
        id: "gh-task-1",
        kind: "task",
        label: "Open PR",
        description: "에이전트가 직접 PR을 생성하고 리뷰어를 지정합니다.",
        enabled: true,
      },
      {
        id: "gh-task-2",
        kind: "task",
        label: "Comment on diff",
        description: "코드 리뷰 코멘트를 자동 작성합니다.",
        enabled: true,
      },
      {
        id: "gh-task-3",
        kind: "task",
        label: "Dispatch workflow",
        description: "사전 정의된 GitHub Actions workflow를 실행합니다.",
        enabled: false,
      },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    category: "code",
    status: "available",
    description: "Linear 이슈를 OKR · 백로그와 양방향으로 동기화합니다.",
    brandColor: "#5e6ad2",
    badge: "L",
    capabilities: [
      {
        id: "linear-sig-1",
        kind: "signal",
        label: "신규 P0/P1 이슈",
        description: "Priority가 높은 신규 이슈를 시그널로 흘려보냅니다.",
        enabled: false,
      },
      {
        id: "linear-task-1",
        kind: "task",
        label: "Create Linear issue",
        description: "백로그를 Linear 이슈로 흘려보냅니다.",
        enabled: false,
      },
    ],
  },
  {
    id: "sentry",
    name: "Sentry",
    category: "ops",
    status: "connected",
    description:
      "에러 시그널을 수집하고 회귀 의심 이슈를 자동으로 백로그화합니다.",
    brandColor: "#362d59",
    badge: "Sn",
    workspace: "sprint-org · 3 projects",
    scopes: ["event:read", "issue:write"],
    lastSync: "4분 전",
    capabilities: [
      {
        id: "sentry-sig-1",
        kind: "signal",
        label: "신규 high-volume error",
        description:
          "신규 이슈가 시간당 50건 이상이면 hot 시그널로 승격합니다.",
        enabled: true,
      },
      {
        id: "sentry-sig-2",
        kind: "signal",
        label: "Regression detected",
        description: "resolved 이슈가 다시 발생하면 회귀 시그널을 띄웁니다.",
        enabled: true,
      },
      {
        id: "sentry-task-1",
        kind: "task",
        label: "Resolve / Assign issue",
        description: "에이전트가 직접 이슈를 resolve하거나 담당자를 지정합니다.",
        enabled: true,
      },
    ],
  },
  {
    id: "grafana",
    name: "Grafana",
    category: "ops",
    status: "error",
    description:
      "메트릭/로그 anomaly를 자동으로 감지합니다. 토큰을 다시 발급해 주세요.",
    brandColor: "#f46800",
    badge: "Gf",
    workspace: "sprint-org · 12 dashboards",
    lastSync: "12시간 전 (실패)",
    errorReason: "OAuth token expired · 마지막 동기화 시도 12시간 전",
    capabilities: [
      {
        id: "grafana-sig-1",
        kind: "signal",
        label: "Latency anomaly",
        description: "p95 latency가 baseline 대비 2σ 초과 시 시그널을 생성합니다.",
        enabled: true,
      },
      {
        id: "grafana-sig-2",
        kind: "signal",
        label: "SLO burn",
        description: "오류 예산을 시간당 5% 이상 소모 시 hot 시그널로 띄웁니다.",
        enabled: true,
      },
      {
        id: "grafana-task-1",
        kind: "task",
        label: "Query dashboard",
        description: "에이전트가 PromQL 쿼리를 직접 실행합니다.",
        enabled: true,
      },
    ],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    category: "sales",
    status: "connected",
    description: "CS 티켓을 시그널로 흘려보내고 트리아지·응답을 자동화합니다.",
    brandColor: "#03363d",
    badge: "Z",
    workspace: "sprint-org · 4 brands",
    scopes: ["tickets:read", "tickets:write"],
    lastSync: "2분 전",
    capabilities: [
      {
        id: "zen-sig-1",
        kind: "signal",
        label: "Negative sentiment 급증",
        description:
          "negative 티켓 비율이 24h baseline 대비 +30% 시 시그널을 생성합니다.",
        enabled: true,
      },
      {
        id: "zen-sig-2",
        kind: "signal",
        label: "Same issue · 12+ tickets",
        description: "동일 키워드 티켓이 24h에 12건 이상 모이면 시그널로 띄웁니다.",
        enabled: true,
      },
      {
        id: "zen-task-1",
        kind: "task",
        label: "Reply to ticket",
        description: "에이전트가 첫 응답을 자동으로 작성합니다.",
        enabled: true,
      },
      {
        id: "zen-task-2",
        kind: "task",
        label: "Tag & route",
        description: "팀/카테고리를 자동으로 태깅합니다.",
        enabled: true,
      },
    ],
  },
  {
    id: "intercom",
    name: "Intercom",
    category: "sales",
    status: "available",
    description: "실시간 채팅 컨텍스트와 사용자 세그먼트를 가져옵니다.",
    brandColor: "#1f8ded",
    badge: "I",
    capabilities: [
      {
        id: "ic-sig-1",
        kind: "signal",
        label: "Feature request mentions",
        description: "8건 이상 멘션된 기능 요청을 시그널로 흘려보냅니다.",
        enabled: false,
      },
      {
        id: "ic-task-1",
        kind: "task",
        label: "Send reply",
        description: "Intercom 대화에 자동으로 응답합니다.",
        enabled: false,
      },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "sales",
    status: "connected",
    description: "결제·구독 데이터로 매출 신호와 재무 루틴을 구동합니다.",
    brandColor: "#635bff",
    badge: "St",
    workspace: "live · sprint-org",
    scopes: ["charges:read", "subscriptions:read", "customers:write"],
    lastSync: "1분 전",
    capabilities: [
      {
        id: "st-sig-1",
        kind: "signal",
        label: "ko-KR payment failed spike",
        description: "ko-KR 로케일 결제 실패 spike를 감지합니다.",
        enabled: true,
      },
      {
        id: "st-sig-2",
        kind: "signal",
        label: "Churn risk",
        description:
          "최근 30일 이용이 -50% 또는 cancel preview 클릭이 감지된 계정을 시그널화합니다.",
        enabled: true,
      },
      {
        id: "st-task-1",
        kind: "task",
        label: "Issue refund",
        description: "에이전트 권한 내에서 환불을 처리합니다.",
        enabled: false,
      },
    ],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "sales",
    status: "connected",
    description: "딜·파이프라인을 신호화하고 영업 운영 루틴을 자동화합니다.",
    brandColor: "#00a1e0",
    badge: "Sf",
    workspace: "sprint-org · production",
    scopes: ["opportunity:read", "lead:write"],
    lastSync: "8분 전",
    capabilities: [
      {
        id: "sf-sig-1",
        kind: "signal",
        label: "Deal stage drop",
        description: "Stage 3 이상에서 단계 후퇴한 딜을 시그널로 띄웁니다.",
        enabled: true,
      },
      {
        id: "sf-sig-2",
        kind: "signal",
        label: "Lost reason · pricing",
        description: "Lost reason이 가격인 딜의 패턴을 감지합니다.",
        enabled: true,
      },
      {
        id: "sf-task-1",
        kind: "task",
        label: "Update lead status",
        description: "Lead 단계를 자동으로 업데이트합니다.",
        enabled: false,
      },
    ],
  },
  {
    id: "amplitude",
    name: "Amplitude",
    category: "marketing",
    status: "connected",
    description: "프로덕트 분석 펀널·리텐션 anomaly를 자동으로 감지합니다.",
    brandColor: "#1e61f0",
    badge: "A",
    workspace: "sprint-org · 1 project",
    scopes: ["events:read", "cohorts:read"],
    lastSync: "30분 전",
    capabilities: [
      {
        id: "amp-sig-1",
        kind: "signal",
        label: "Funnel step drop",
        description:
          "주요 펀널 단계 drop이 baseline 대비 ±20% 변동 시 시그널을 생성합니다.",
        enabled: true,
      },
      {
        id: "amp-sig-2",
        kind: "signal",
        label: "Retention cliff",
        description: "코호트 retention이 D7에서 cliff가 발생하면 알립니다.",
        enabled: true,
      },
      {
        id: "amp-task-1",
        kind: "task",
        label: "Run cohort analysis",
        description: "에이전트가 직접 코호트를 정의하고 조회합니다.",
        enabled: true,
      },
    ],
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    category: "marketing",
    status: "connected",
    description:
      "광고 계정 성과를 마트로 수집하고 일일 캠페인 리포트를 작성합니다.",
    brandColor: "#0866ff",
    badge: "Me",
    workspace: "sprint-org · 3 ad accounts",
    scopes: ["ads_read", "ads_management"],
    lastSync: "1시간 전",
    capabilities: [
      {
        id: "meta-sig-1",
        kind: "signal",
        label: "CPA spike",
        description: "캠페인 CPA가 7일 평균 대비 +25% 시 시그널을 생성합니다.",
        enabled: true,
      },
      {
        id: "meta-sig-2",
        kind: "signal",
        label: "Creative fatigue",
        description: "frequency > 4 + CTR -30% 시 광고 피로를 감지합니다.",
        enabled: true,
      },
      {
        id: "meta-task-1",
        kind: "task",
        label: "Pause underperforming ad",
        description: "사전 정의 임계값 위반 시 광고를 자동으로 일시정지합니다.",
        enabled: false,
      },
    ],
  },
  {
    id: "google-ads",
    name: "Google Ads",
    category: "marketing",
    status: "available",
    description: "검색·디스플레이 캠페인 성과를 분석합니다.",
    brandColor: "#fbbc04",
    badge: "Ga",
    capabilities: [
      {
        id: "gads-sig-1",
        kind: "signal",
        label: "Quality score drop",
        description: "키워드 quality score가 3 이하로 떨어지면 시그널을 띄웁니다.",
        enabled: false,
      },
    ],
  },
  {
    id: "bigquery",
    name: "BigQuery",
    category: "data",
    status: "connected",
    description: "워크스페이스 마트 데이터를 에이전트가 직접 쿼리합니다.",
    brandColor: "#4285f4",
    badge: "Bq",
    workspace: "sprint-prod · 4 datasets",
    scopes: ["bigquery.tables.read", "bigquery.jobs.create"],
    lastSync: "5분 전",
    capabilities: [
      {
        id: "bq-sig-1",
        kind: "signal",
        label: "Cost anomaly (slot/storage)",
        description: "전일 대비 slot 사용량 anomaly를 시그널화합니다.",
        enabled: true,
      },
      {
        id: "bq-sig-2",
        kind: "signal",
        label: "Schema drift",
        description: "주요 마트 테이블 스키마 변경을 감지합니다.",
        enabled: true,
      },
      {
        id: "bq-task-1",
        kind: "task",
        label: "Run analysis query",
        description: "에이전트가 SQL을 작성·실행하고 결과를 첨부합니다.",
        enabled: true,
      },
      {
        id: "bq-task-2",
        kind: "task",
        label: "Create scheduled query",
        description: "재사용 가능한 쿼리를 schedule로 등록합니다.",
        enabled: false,
      },
    ],
  },
  {
    id: "vanta",
    name: "Vanta",
    category: "compliance",
    status: "connected",
    description: "SOC2 컨트롤 evidence를 자동으로 수집하고 검증합니다.",
    brandColor: "#3434c0",
    badge: "Vn",
    workspace: "sprint-org · SOC2 Type II",
    scopes: ["controls:read", "evidence:read"],
    lastSync: "1시간 전",
    capabilities: [
      {
        id: "vt-sig-1",
        kind: "signal",
        label: "Failing control",
        description: "컨트롤이 실패하면 즉시 시그널로 띄웁니다.",
        enabled: true,
      },
    ],
  },
];
