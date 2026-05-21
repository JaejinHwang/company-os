> **목적 한 줄.** 워크스페이스에 들어온 사람이 *오늘 무엇이 일어났고, 무엇부터 손대야 하는지* 한 화면에서 파악하게 한다. Dashboard는 "수동 탐색의 시작점"이 아니라 **요약된 상황실**이다.

## Audience & Scenarios

- **주 사용자:** 워크스페이스에 매일 한두 번 들어와 "현황 파악 → 우선순위 결정 → 액션"을 하는 운영자/리더 페르소나.
- **시나리오 1 (Morning check-in):** 출근 직후 어제~오늘 사이 발생한 hot signal, urgent backlog, 실패한 routine을 30초 안에 스캔하고, 가장 시급한 항목 1개를 클릭으로 분기.
- **시나리오 2 (Re-entry):** 회의·외근 후 복귀해 누락된 알림이 있는지 확인. Pulse card 4종이 "건수 증가" 시그널 역할.
- **시나리오 3 (Triage from Atlas):** Atlas/CEO 에이전트가 정리해준 핵심 이슈를 받아 Plan/Execute로 후속 액션 시작.

## Entry Points

| 진입 | 기본 동작 |
|---|---|
| 사이드바 `Dashboard` 클릭 | 항상 도착하는 홈 화면. 첫 로그인 시에도 기본. |
| 로고 클릭 | Dashboard로 복귀. |
| `cream.onboarded`가 비어있음 | Onboarding으로 우회된 뒤, 완료 시 `#backlogs`로 이동 (Dashboard 우회). |

## Layout & Zones

상단부터 순서대로:

1. **Hero** — 오늘 날짜 + 워크스페이스명 + 핵심 카운트 요약 + `+ New Issue` 버튼.
2. **Pulse cards (4)** — Hot signals · Backlogs urgent · Routines 실패 · Agents 활성. 각 카드는 해당 도메인 페이지로 이동.
3. **Hot signals stream** — 새로 들어온 raw signal 출처별 정렬. 행마다 `+ Plan` 버튼 → `NewIssueModal`을 seed와 함께 오픈.
4. **Agents card** — 에이전트별 현재 상태/점유 프로젝트.
5. **Projects strip** — 진행 중 프로젝트 카드 횡스크롤.
6. **Active backlogs card** — `in_progress` + urgent 항목. 행마다 `Execute` 버튼.
7. **Routine runs** — 최근 24h 실행 결과 요약.

> **레이아웃 컨테이너.** `mx-auto max-w-[1200px]` 로 가운데 정렬. 폭이 더 넓은 viewport에서는 좌우 여백이 생기는 게 정상 (가독성 우선).

## Data & State

- **카운트 산식:** 모든 위젯 숫자는 props로 받은 배열의 길이/필터 결과 — 캐시된 숫자, 서버 집계 값 모두 금지.
  - hot signals 카운트 = `signals.filter(s => s.source === 'hot').length`
  - urgent backlogs 카운트 = `backlogs.filter(b => b.priority === 'urgent').length`
  - failed routines 카운트 = `routineRuns.filter(r => r.status === 'failed').length`
- **단일 소스:** 동일 카운트가 두 zone에서 다르게 계산되지 않도록, 같은 source 배열을 통과시켜야 한다.
- **로딩/에러:** 실데이터 연결 시 zone별 skeleton + per-zone retry 정책 필요.

## Interactions

| Trigger | 결과 | 책임 분리 |
|---|---|---|
| `+ New Issue` (Hero) | `setIssueSeed(undefined)` → 빈 모달 오픈 | 라우팅 X, 모달만 |
| Pulse card 클릭 | 해당 도메인으로 `onNavigate` | Hot→`#signals`, Backlogs→`#backlogs`, Routines→`#routines`, Agents→`#ceo` 등 |
| 시그널 행 `+ Plan` | `onPlan(seed)` → `NewIssueModal` seed 주입 | 라우팅 X, modal에서 사용자 확인 후 backlog 생성 |
| 시그널 출처 라벨 클릭 | `#signals?source=...` (예정) | 현재 미구현 — backlog 항목으로 추적 |
| Backlog 행 `Execute` | `onExecute(id)` → `status='in_progress'` | 실제 실행은 에이전트가 비동기 처리한다고 가정 |
| Agents 카드의 에이전트 클릭 | `onNavigate(agent.href)` → AgentDetail | — |
| Projects strip의 카드 클릭 | `onNavigate(project.href)` → ProjectDetail | — |
| `Routines · 실패` 행 클릭 | `#routines` 이동 후 해당 routine 하이라이트 (예정) | 현재는 단순 이동만 |

## Empty States

- **워크스페이스 신규 (백로그/시그널/루틴 모두 0):** 시작 단계용 카피와 "첫 작업 만들기" CTA 노출.
- **일부 zone 데이터 없음** (예: hot signals 0건, agents 미배정): 해당 zone만 빈 상태 카드로 placeholder. 다른 zone은 정상 표시.
- **카운트 0건:** Pulse card는 숨기지 않고 회색 톤으로 유지 (위치 일관성 우선).

## Edge Cases & Guarantees

- **변경 금지 영역**
  - Pulse card 4종의 *상단 고정 위치* — 사용자 학습 비용이 큰 컴포넌트.
  - Hot signals 출처별 색상 매핑 — `Signals` 페이지와 시각 일관성 유지 필요.
  - Hero의 `+ New Issue` 버튼은 우상단 고정.
- **금지 패턴**
  - Plan 버튼이 직접 라우팅하지 말 것 (반드시 modal → 사용자 확인 → backlog 생성).
  - 동일 카운트가 두 zone에 다르게 표시되지 말 것 (단일 source).
  - Dashboard 내부에서 backlog/signal/routine을 수정하지 말 것 — 모두 콜백으로 부모(App)에 위임.

## Future Work

- Pulse card에 sparkline (지난 7일 추이) 표기.
- Hot signals stream의 출처 칩 클릭 시 `Signals` 페이지로 필터 query string 전달.
- Routine runs zone에 실패 사유 1줄 요약 추가.
- 실데이터 연결 시 zone별 skeleton + 5s 후 재시도 옵션.

## Related Screens

- [Signals](#signals) — Hot signals stream의 원본 모니터링 뷰.
- [Backlogs](#backlogs) — Active backlogs card에서 이어지는 트리아지 뷰.
- [Routines](#routines) — Routine runs zone이 가리키는 스케줄 페이지.
- `AgentDetail` — Agents card에서 진입.
- `ProjectDetail` — Projects strip에서 진입.
- `Atlas` (ChiefOfStaff modal) — Dashboard와 동일 데이터로 더 narrative한 요약 제공.

## Open Questions

- `Routines · 실패` 0건일 때 카드를 숨길지, 회색으로 유지할지? — 현재는 회색 유지(상태 일관성 우선).
- Hero에 워크스페이스 vision (`firstAgent`)을 같이 노출할지? — 현재 onboarding에서만 수집, Dashboard 노출은 미정.
