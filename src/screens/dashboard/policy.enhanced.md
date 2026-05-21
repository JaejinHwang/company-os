> **목적 한 줄.** 워크스페이스에 들어온 사람이 *오늘 무엇이 일어났고, 무엇부터 손대야 하는지* 한 화면에서 파악하게 한다. Dashboard는 "수동 탐색의 시작점"이 아니라 **요약된 상황실**이다.

## Overview

### Audience

워크스페이스에 매일 한두 번 들어와 *"현황 파악 → 우선순위 결정 → 액션"* 을 하는 운영자/리더 페르소나가 주 사용자다.

### Scenarios

```scenarios
[
  {
    "id": "morning-check-in",
    "name": "Morning check-in",
    "given": "운영자가 출근 직후 워크스페이스에 처음 들어옴",
    "when": "Dashboard에 도착함",
    "then": "어제~오늘 사이 발생한 hot signal · urgent backlog · 실패한 routine 카운트가 즉시 보이고, 30초 안에 가장 시급한 항목 1개로 분기할 수 있음"
  },
  {
    "id": "re-entry",
    "name": "Re-entry after meeting",
    "given": "회의·외근 후 복귀한 사용자가 자리 비운 동안 누락된 알림이 있는지 알고 싶음",
    "when": "Dashboard 재진입",
    "then": "Pulse card 4종의 카운트 증감을 한눈에 인지하고, 변화가 있는 도메인으로 즉시 진입"
  },
  {
    "id": "triage-from-atlas",
    "name": "Triage from Atlas",
    "given": "Atlas/CEO 에이전트가 정리해준 우선순위 이슈를 가진 사용자",
    "when": "Dashboard의 hot signal 또는 backlog 항목을 클릭",
    "then": "Plan/Execute 모달로 즉시 후속 액션을 시작할 수 있음 (중간 탐색 없음)"
  }
]
```

### UX Requirements

이 화면의 시나리오들이 달성되기 위한 핵심 UX 충족 조건. 각 항목은 어떤 시나리오를 지원하는지 cross-ref.

```ux-requirements
[
  {
    "id": "scan-30s",
    "title": "Above-the-fold 카운트 스캔",
    "description": "Pulse card 4종 + Hero 카운트가 스크롤 없이 viewport에 보여야 한다. 카운트는 시각적 무게가 큰 숫자로 즉시 인지 가능해야 한다.",
    "scenarios": ["morning-check-in", "re-entry"]
  },
  {
    "id": "single-click-branch",
    "title": "단일 클릭 도메인 분기",
    "description": "Pulse card / signal 행 / backlog 행은 전체 영역이 클릭 가능해야 한다. 중간 확인 모달 없이 한 번의 클릭으로 해당 도메인 페이지/액션으로 이동.",
    "scenarios": ["morning-check-in", "triage-from-atlas"]
  },
  {
    "id": "source-color-coding",
    "title": "출처별 시각 구분",
    "description": "Hot signals stream의 각 항목은 출처(CS/Bug/Internal/Competitor/Market/Sales) 별로 일관된 색상/아이콘으로 즉시 구분 가능해야 한다. Signals 페이지와 동일 매핑.",
    "scenarios": ["morning-check-in", "re-entry"]
  },
  {
    "id": "delta-visibility",
    "title": "카운트 변화 인지성",
    "description": "Re-entry 시 직전 방문 이후의 증감을 알 수 있어야 한다 (현재는 절대값만 표시, sparkline은 future work).",
    "scenarios": ["re-entry"]
  },
  {
    "id": "atlas-handoff",
    "title": "Atlas와의 끊김 없는 인계",
    "description": "ChiefOfStaff modal에서 본 우선순위 이슈가 Dashboard에서도 동일한 표시(출처·우선순위·라벨)로 인지될 수 있어야 한다.",
    "scenarios": ["triage-from-atlas"]
  }
]
```

### Entry Points

| 진입 | 기본 동작 |
|---|---|
| 사이드바 `Dashboard` 클릭 | 항상 도착하는 홈 화면. 첫 로그인 시에도 기본. |
| 로고 클릭 | Dashboard로 복귀. |
| `cream.onboarded`가 비어있음 | Onboarding으로 우회된 뒤, 완료 시 `#backlogs`로 이동 (Dashboard 우회). |

## Sections

상단부터 순서대로. 각 카드를 펼치면 그 섹션의 **구성 컴포넌트 · 인터랙션 · 룰**을 한 곳에서 확인할 수 있습니다.

```section
{
  "id": "hero",
  "name": "Hero",
  "selector": "[data-zone=\"hero\"]",
  "summary": "오늘 날짜 · Dashboard 타이틀 · 핵심 카운트 요약 · New Issue 버튼이 모이는 화면 상단 영역",
  "components": [
    { "name": "DateLabel", "description": "오늘 날짜 (uppercase tracking)" },
    { "name": "Title", "description": "h2 'Dashboard'" },
    { "name": "PulseSummary", "description": "hot signal · urgent · failed routine 3개 카운트 인라인" },
    { "name": "+ New Issue button", "description": "빈 NewIssueModal 오픈" }
  ],
  "interactions": [
    {
      "trigger": "+ New Issue",
      "result": "setIssueSeed(undefined) → 빈 NewIssueModal 오픈",
      "selector": "[data-action=\"new-issue\"]"
    }
  ],
  "rules": [
    { "kind": "must", "text": "+ New Issue 버튼은 Hero 우상단 고정 위치 유지" }
  ]
}
```

```section
{
  "id": "pulse",
  "name": "Pulse cards",
  "selector": "[data-zone=\"pulse\"]",
  "summary": "Hot signals · Backlogs urgent · Routines 실패 · Agents 4종 카운트 카드",
  "components": [
    { "name": "PulseCard × 4", "description": "icon · label · value · hint · accent color · onClick navigation" }
  ],
  "interactions": [
    {
      "trigger": "Pulse: Hot signals",
      "result": "onNavigate('#signals')",
      "selector": "[data-zone=\"pulse\"] button:nth-child(1)"
    },
    {
      "trigger": "Pulse: Backlogs · Urgent",
      "result": "onNavigate('#backlogs')",
      "selector": "[data-zone=\"pulse\"] button:nth-child(2)"
    },
    {
      "trigger": "Pulse: Routines · 실패",
      "result": "onNavigate('#routines')",
      "selector": "[data-zone=\"pulse\"] button:nth-child(3)"
    }
  ],
  "rules": [
    { "kind": "must", "text": "Pulse card 4종은 상단 고정 위치 (사용자 학습 비용이 큰 컴포넌트)" },
    { "kind": "must", "text": "value는 props 기반 카운트만 사용 — 캐시된 숫자/서버 집계 금지" }
  ]
}
```

```section
{
  "id": "hot-signals",
  "name": "Hot signals stream",
  "selector": "[data-zone=\"hot-signals\"]",
  "summary": "외부 소스에서 들어온 raw signal을 출처별로 정렬. 행마다 + Plan 버튼.",
  "components": [
    { "name": "CardHeader", "description": "'Signals' + All signals 링크" },
    { "name": "SignalRow × N", "description": "출처 칩 + 제목 + 메타 + + Plan 버튼" }
  ],
  "interactions": [
    {
      "trigger": "Signal row + Plan",
      "result": "onPlan(seed) → NewIssueModal seed 주입 (라우팅 X)",
      "selector": "[data-zone=\"hot-signals\"] button"
    }
  ],
  "rules": [
    { "kind": "must", "text": "출처별 색상 매핑은 Signals 페이지와 일관성 유지" },
    { "kind": "must-not", "text": "Plan 버튼이 직접 라우팅하지 말 것 — 반드시 modal → 사용자 확인 → backlog 생성" }
  ],
  "states": [
    {
      "id": "load-state",
      "label": "Load",
      "options": [
        {
          "value": "idle",
          "label": "정상",
          "description": "비동기 fetch 완료. 시그널 목록이 출처별로 정렬되어 표시되며 모든 인터랙션이 활성."
        },
        {
          "value": "loading",
          "label": "로딩",
          "description": "비동기 fetch 진행 중. 카드 위에 overlay가 떠 사용자 클릭은 차단되고 데이터 도착을 기다림. 일반적으로 3초 이내 완료 가정."
        },
        {
          "value": "empty",
          "label": "0건",
          "description": "조회 결과가 0건. '새 시그널이 들어오면 여기 표시됩니다' empty card 노출. + Plan 버튼은 비활성."
        },
        {
          "value": "error",
          "label": "에러",
          "description": "fetch 실패 (네트워크 또는 Connector 권한 만료 등). 재시도 버튼 + 에러 사유 표시. Pulse card의 hot signal 카운트는 직전 캐시값으로 stale 표시."
        }
      ],
      "default": "idle"
    }
  ]
}
```

```section
{
  "id": "agents",
  "name": "Agents card",
  "selector": "[data-zone=\"agents\"]",
  "summary": "에이전트별 현재 상태와 점유 프로젝트",
  "components": [
    { "name": "CardHeader", "description": "'Agents'" },
    { "name": "AgentRow × 5", "description": "아이콘 + 이름 + 상태 칩 + 점유 프로젝트 링크" }
  ],
  "interactions": [],
  "rules": []
}
```

```section
{
  "id": "projects",
  "name": "Projects strip",
  "selector": "[data-zone=\"projects\"]",
  "summary": "진행 중 프로젝트 카드 횡스크롤. 카드 클릭 시 단계별 산출물(ProjectDetail)로 이동.",
  "components": [
    { "name": "CardHeader", "description": "'Projects' + 안내 카피" },
    { "name": "ProjectMiniCard × 5", "description": "상태 dot + 제목 + 진행 stage" }
  ],
  "interactions": [],
  "rules": []
}
```

```section
{
  "id": "backlogs",
  "name": "Active backlogs",
  "selector": "[data-zone=\"backlogs\"]",
  "summary": "in_progress + urgent + high 우선 정렬. 행마다 Execute 버튼.",
  "components": [
    { "name": "CardHeader", "description": "'Backlogs' + All backlogs 링크" },
    { "name": "BacklogRow × N", "description": "우선순위 칩 + 제목 + 상태 + Execute 버튼" }
  ],
  "interactions": [
    {
      "trigger": "Backlog row Execute",
      "result": "onExecute(id) → status: 'in_progress'. 실제 실행은 에이전트가 비동기 처리한다고 가정.",
      "selector": "[data-zone=\"backlogs\"] button"
    }
  ],
  "rules": [
    { "kind": "must-not", "text": "Execute 버튼이 backlog 상태를 직접 mutate하지 말 것 — 콜백으로 부모에 위임" }
  ]
}
```

```section
{
  "id": "routines",
  "name": "Routine runs",
  "selector": "[data-zone=\"routines\"]",
  "summary": "최근 24h routine 실행 결과 요약. 실패 항목 우선 표시.",
  "components": [
    { "name": "CardHeader", "description": "'Routines · 24h' + All routines 링크" },
    { "name": "RunRow × N", "description": "상태 dot + routine 이름 + 시간" }
  ],
  "interactions": [],
  "rules": []
}
```

## Cross-cutting

화면-전체 차원의 정책. 특정 섹션에 묶이지 않거나 여러 섹션에 걸쳐 적용되는 항목.

### Data & State

- **카운트 산식:** 모든 위젯 숫자는 props로 받은 배열의 길이/필터 결과 — 캐시된 숫자, 서버 집계 값 모두 금지.
  - hot signals 카운트 = `signals.filter(s => s.source === 'hot').length`
  - urgent backlogs 카운트 = `backlogs.filter(b => b.priority === 'urgent').length`
  - failed routines 카운트 = `routineRuns.filter(r => r.status === 'failed').length`
- **단일 소스:** 동일 카운트가 두 zone에서 다르게 계산되지 않도록, 같은 source 배열을 통과시켜야 한다.
- **로딩/에러:** 실데이터 연결 시 zone별 skeleton + per-zone retry 정책 필요.

### Empty States

- **워크스페이스 신규 (백로그/시그널/루틴 모두 0):** 시작 단계용 카피와 "첫 작업 만들기" CTA 노출.
- **일부 zone 데이터 없음** (예: hot signals 0건, agents 미배정): 해당 zone만 빈 상태 카드로 placeholder. 다른 zone은 정상 표시.
- **카운트 0건:** Pulse card는 숨기지 않고 회색 톤으로 유지 (위치 일관성 우선).

### Global Rules

- ✗ **동일 카운트가 두 zone에 다르게 표시되지 말 것** (단일 source).
- ✗ **Dashboard 내부에서 backlog/signal/routine을 직접 수정하지 말 것** — 모두 콜백으로 부모(App)에 위임.
- ✓ 레이아웃 컨테이너는 `mx-auto max-w-[1200px]`. 더 넓은 viewport에서 좌우 여백이 생기는 게 정상.

### Future Work

- Pulse card에 sparkline (지난 7일 추이) 표기.
- Hot signals stream의 출처 칩 클릭 시 `Signals` 페이지로 필터 query string 전달.
- Routine runs zone에 실패 사유 1줄 요약 추가.
- 실데이터 연결 시 zone별 skeleton + 5s 후 재시도 옵션.

### Related Screens

- [Signals](#signals) — Hot signals stream의 원본 모니터링 뷰.
- [Backlogs](#backlogs) — Active backlogs에서 이어지는 트리아지 뷰.
- [Routines](#routines) — Routine runs zone이 가리키는 스케줄 페이지.
- `AgentDetail` — Agents card에서 진입.
- `ProjectDetail` — Projects strip에서 진입.
- `Atlas` (ChiefOfStaff modal) — Dashboard와 동일 데이터로 더 narrative한 요약 제공.

### Open Questions

- `Routines · 실패` 0건일 때 카드를 숨길지, 회색으로 유지할지? — 현재는 회색 유지(상태 일관성 우선).
- Hero에 워크스페이스 vision (`firstAgent`)을 같이 노출할지? — 현재 onboarding에서만 수집, Dashboard 노출은 미정.
