# Cream Prototype — Project Guide

이 프로젝트는 **좌측: 라이브 React 프로토타입 · 우측: 정책 문서**가 한 화면에 떠 있는 split-view PoC다. 화면(screen) 단위로 *정책 + 컨텍스트 + 의사결정 + 인터랙션 + state matrix*를 함께 정의하고, 우측 정책 패널이 좌측 prototype을 직접 가리키고(hover outline) 시뮬레이션한다(state controls).

화면당 **단일 source** (`policy.md`)에서 모든 정책이 정의되며, fenced JSON 블록(```` ```scenarios `, ` ```ux-requirements `, ` ```section ```` 등)을 통해 시각화/연동 정보가 함께 들어간다. drift 위험이 없는 단일 진실원 구조.

새 화면을 추가하거나 기존 화면을 수정할 때 **반드시 이 문서의 컨벤션을 따른다**. 특히 **양방향 sync 룰(§ 7)** 은 모든 화면 수정의 기본 규칙이다.

---

## 1. 디렉토리 구조

```
src/
  App.tsx                       # hash → screen 라우팅 + policy panel state
  components/
    AppShell.tsx                # sidebar + topbar + main
    ScreenLayout.tsx            # 최상위 split view (prototype | policy), 폭 drag-resizable + localStorage 영속화
    PolicyPanel.tsx             # 탭 strip + 본문 라우팅 + 검증 dot
    MarkdownView.tsx
    policy-blocks/
      SectionView.tsx           # 섹션 탭 페이지 (Components/Interactions/Rules/States)
      ScenariosBlock.tsx        # GWT 카드 (User Stories)
      UxRequirementsBlock.tsx   # 요구사항 카드
      StateControl.tsx          # 단일 state control UI (재사용 단위)
      ScreenStatesBlock.tsx     # screen-level fenced `states` 처리
      StatusDot.tsx             # selector 검증 상태 시각화
  lib/
    policy-parsing.ts           # md → ParsedPolicy { preface, overview, sections[], crossCutting }
    policy-validation.ts        # useSelectorValidation 훅 (MutationObserver)
  screens/
    _registry.ts                # hash → policy 매핑
    <screen-name>/
      Page.tsx                  # React 컴포넌트
      policy.md                 # 단일 정책 문서 (3-tier + fenced blocks)
      index.ts                  # export { Component, policy }
  pages/                        # 아직 screens/로 마이그레이션 안 된 페이지
```

기존 `src/pages/<Name>.tsx`를 마이그레이션할 때는 `git mv` 사용해 히스토리 보존, import 경로(`../components` → `../../components`, `../lib` → `../../lib`) 갱신.

---

## 2. 새 화면 추가 절차

1. `mkdir -p src/screens/<name>/`
2. `git mv src/pages/<Name>.tsx src/screens/<name>/Page.tsx` (기존 페이지인 경우) 또는 신규 작성
3. import 경로 2~3개 갱신 (상대 경로 한 단계 깊어짐)
4. **`docs/policy.template.md`** 를 복사해 `src/screens/<name>/policy.md`로 → 빈 골격 채우기 (3-tier 구조 + fenced block. § 3, § 4 schema 참고)
5. `index.ts`:
   ```ts
   export { <Name> } from "./Page";
   export { default as policy } from "./policy.md?raw";
   ```
6. `_registry.ts`에 등록:
   ```ts
   import { policy as <name>Policy } from "./<name>";
   SCREEN_POLICIES["#<hash>"] = <name>Policy;
   ```
7. `App.tsx`의 hash 분기에 새 컴포넌트 라우팅 추가
8. **Page.tsx에 selector 마킹**: § 5 컨벤션에 따라 `data-zone`, `data-action` 부여

---

## 3. 정책 작성 컨벤션 — 3-tier 구조

`policy.md`의 골격. fenced block들은 작성자가 선택적으로 채우며, 부족한 경우 일반 markdown으로 자유 작성해도 동작 (탭 안 그려지고 단일 페이지로 렌더):

```markdown
> [한 줄. 이 화면이 왜 존재하는가. prefix / 부연 설명 없이 핵심만.]

## Overview
### Audience
[자유 텍스트 — 주 사용자 / 페르소나]

### User Stories
```scenarios
[GWT 시나리오 array — § 4.1 schema]
```

### UX Requirements
```ux-requirements
[요구사항 array — § 4.2 schema]
```

### Entry Points
[markdown table 또는 list — 진입 경로]

## Sections
[각 zone마다 ```section``` fenced block 하나 — § 4.3 schema]

## Cross-cutting
### Screen States
```states
[화면-전체 차원의 state controls — § 4.4 schema]
```

### Global Rules
### Future Work
### Related Screens
### Open Questions
```

- **Overview**와 **Cross-cutting**은 PolicyPanel에서 같은 "Overview" 탭에 합쳐 렌더된다 (사이에 divider).
- 각 `## Sections` 안 fenced `section` block은 독립 탭으로 분리된다.
- Overview 탭 본문에는 작성자가 따로 안 적어도 **`SectionsOverview` 카드 리스트**가 자동 렌더된다 — 모든 sections를 한눈에 볼 수 있는 inventory + 클릭 시 그 탭으로 navigate.
- 작성자는 두 H2를 명시적으로 분리해서 적어 *외부 시점(Audience/Entry/Stories/Requirements)* 과 *내부 정책(States/Rules/Future)* 의 의미를 구분한다.
- 콜아웃 한 줄은 **prefix (예: `**목적 한 줄.**`) 없이** 진짜 한 문장만 쓴다.

---

## 4. Fenced Block Schema

모든 fenced block은 **JSON** 본문. parser는 invalid JSON 시 일반 코드블록으로 fallback (silent). 항상 `\"` escape 주의.

### 4.1 `scenarios`

```json
[
  {
    "id": "morning-check-in",
    "name": "Morning check-in",
    "given": "사용자 컨텍스트/사전 조건",
    "when": "트리거되는 이벤트/행동",
    "then": "기대되는 결과 (UX requirements가 충족되어야 가능)"
  }
]
```

### 4.2 `ux-requirements`

```json
[
  {
    "id": "scan-30s",
    "title": "Above-the-fold 카운트 스캔",
    "description": "이 요구사항이 충족되어야 하는 이유와 구체적 기준",
    "scenarios": ["morning-check-in", "re-entry"]
  }
]
```

`scenarios` 배열의 값은 같은 화면 `scenarios` 블록의 `id`와 정확히 일치한다 — 현 시점 UI에는 cross-ref pill이 렌더되지 않지만 schema는 추후 traceability 확장(예: trace matrix, coverage check)을 위해 유지한다.

### 4.3 `section`

```json
{
  "id": "hero",
  "name": "Hero",
  "selector": "[data-zone=\"hero\"]",
  "summary": "한 줄 요약",
  "components": [
    { "name": "DateLabel", "description": "오늘 날짜" }
  ],
  "interactions": [
    {
      "trigger": "+ New Issue",
      "result": "빈 모달 오픈",
      "selector": "[data-action=\"new-issue\"]"
    }
  ],
  "rules": [
    { "kind": "must", "text": "...우측 고정 위치 유지..." },
    { "kind": "must-not", "text": "...직접 라우팅 금지..." }
  ],
  "states": [
    {
      "id": "load-state",
      "label": "Load",
      "binding": {
        "kind": "real",
        "valueMap": {
          "idle": { "loading": false, "error": null },
          "loading": { "loading": true, "error": null },
          "empty": { "loading": false, "data": [] },
          "error": { "loading": false, "error": "fetch failed" }
        },
        "note": "App.tsx의 Hot signals fetcher 상태와 직결"
      },
      "options": [
        { "value": "idle", "label": "정상", "description": "..." },
        { "value": "loading", "label": "로딩", "description": "..." }
      ],
      "default": "idle"
    }
  ]
}
```

- `selector`: 좌측 prototype의 outer 영역. hover 시 outline 표시 + state controls 적용 대상.
- `interactions[].selector`: 좌측 element. **클릭은 실행하지 않고** hover로만 위치 표시 (정책-구현 매핑 확인 용도).
- `rules[].kind`: `must`(✓ emerald) | `must-not`(✗ red). 카드 시각 구분.
- `states[]`: § 6 state controls 참고.
- `states[].binding`: § 6.5 real binding 참고. **default는 "real"** — 각 화면이 정책에서 정의된 variation을 실제로 렌더해야 함.
- **UI 표시 정책**: `selector` 문자열·`id` 식별자는 schema에 보존하지만 패널 UI에는 노출하지 않는다 (StatusDot의 색만 검증 시그널 제공). 사용자가 의도적 디버깅 모드를 도입하면 그때 같이 표시.

### 4.4 `states` (screen-level)

`section.states[]`와 동일한 schema지만 *Overview / Cross-cutting* md 본문에 단독 fenced 블록으로 들어가 화면 전체에 적용된다.

```json
[
  {
    "id": "workspace-state",
    "label": "Workspace",
    "selectorTarget": "[aria-label=\"Prototype\"]",
    "options": [
      { "value": "active", "label": "운영 중", "description": "..." },
      { "value": "fresh", "label": "신규 워크스페이스", "description": "..." }
    ],
    "default": "active"
  }
]
```

- **`selectorTarget` 필수**: section-level과 달리 fallback이 없으므로 어디에 attribute를 부여할지 명시해야 한다. `[aria-label="Prototype"]`(전체) 또는 `[data-zone]`(모든 zone) 등 broad scope 권장.
- 같은 schema이므로 `ScreenStatesBlock`은 내부에서 `StateControl`을 그대로 재사용한다.

---

## 5. Prototype 마킹 컨벤션

Page.tsx에 selector를 부여해 정책 패널과 양방향으로 연결한다. **추가 attribute만**이고 기존 동작/시각 영향 없음.

| 마킹 | 위치 | 용도 |
|---|---|---|
| `data-zone="<id>"` | 섹션 outer div | 섹션 hover outline + state controls 적용 대상 |
| `data-action="<id>"` | 클릭 가능 요소 (button/link) | interaction trigger hover outline |

예:
```tsx
<section data-zone="hero" className="...">
  <button data-action="new-issue" onClick={onNewIssue}>...</button>
</section>
```

selector 컨벤션:
- zone: `[data-zone="hero"]`
- action: `[data-action="new-issue"]`
- 더 정밀한 위치: `[data-zone="pulse"] button:nth-child(2)` 같이 child selector 조합

**selector 문자열은 schema에만 존재**한다. 패널 UI에서는 selector 텍스트를 노출하지 않고 StatusDot 색으로만 검증 시그널을 제공한다 (작성자 디버깅이 필요하면 코드/DevTools로 확인).

---

## 6. State Controls

좌측 prototype을 다른 state로 시뮬레이션하는 UI. 두 레벨 지원:

| 레벨 | 정의 위치 | 적용 범위 | 렌더 위치 |
|---|---|---|---|
| **Section-level** | `section.states[]` (§ 4.3) | section.selector (default) | 해당 섹션 탭 헤더 아래 |
| **Screen-level** | fenced ```states``` 블록 (§ 4.4) | `selectorTarget` 명시 (전체 prototype 또는 다중 zone) | Overview 탭 본문 |

**동작 (공통)**: state option 선택 시 좌측 DOM에 `data-<state.id>="<value>"` attribute 부여. CSS attribute selector로 visual 효과(overlay, skeleton 등) 시뮬레이션. `default` 값일 땐 attribute 제거.

**컴포넌트 모듈**:
- `StateControl.tsx`: 단일 state 카드 (재사용 단위)
- `ScreenStatesBlock.tsx`: fenced ```states``` 가로채 StateControl을 다중 렌더 (screen-level)
- `SectionView.tsx`: `section.states[]`를 StateControl로 렌더 (section-level)

**작성 룰**:
- `options[].description`은 *반드시* 작성. 단순 loading뿐 아니라 user role / permission / A-B variant / workspace mode 등 의미가 복잡한 분기에서는 description 없이는 의미 분기를 잃는다.
- 새 state 종류면 `src/index.css`에 해당 attribute selector + visual 효과 추가:
  ```css
  [data-<state.id>="<value>"]::after {
    content: "...";
    /* overlay style */
  }
  ```
- state 변경은 React state 시스템과 격리되어 있다 (DOM attribute만). 실제 컴포넌트 분기(props 변경)가 필요하면 store 도입 별도 협의.

**cleanup**: 탭 전환 / 패널 close 시 attribute 자동 제거. side-effect 누수 없음.

**Highlight overlay 패턴 (참고)**: 좌측 element를 하이라이트할 때는 element에 `background-color`를 직접 부여하지 않고 **`::before` pseudo-element overlay**로 덮는다 (`policy-zone-highlight` 등). 검정 버튼 같은 강한 색 element가 덧칠로 변색되는 사고를 막기 위함.

### 6.5 Real binding (default) — state ↔ 실제 prop 연결

**모든 state는 실제 화면 변이를 일으키는 것을 목표로 한다.** 단순 CSS overlay 시뮬레이션은 정책-구현 정합을 보장하지 못하므로, 가능한 모든 state에 `binding`을 명시한다.

**Schema** (`StateBinding` — § 4.3 schema 안 `binding` 필드):

```json
{
  "id": "workspace-state",
  "binding": {
    "kind": "real",
    "valueMap": {
      "active": { "sampleData": true },
      "fresh":  { "sampleData": false, "backlogs": [] }
    },
    "note": "App.tsx의 sampleData/backlogs와 직결"
  },
  "options": [...],
  "default": "active"
}
```

- `kind: "real"` (default if `valueMap` present): 옵션 선택 시 `valueMap[value]` 의 props가 화면 컴포넌트로 실제 전달됨
- `kind: "visual"`: 폴백. binding이 아직 구현 안 됐을 때만 사용. UI에 회색 "VISUAL" 뱃지가 떠 작성자에게 미구현 시그널을 줌
- `valueMap`은 정책-구현 sync의 single source — App.tsx (또는 화면 부모)가 이 patch를 읽어 prop으로 merge

**런타임 모델** (`src/lib/screen-state.ts`):
- `setScreenState(hash, stateId, value)`: 정책 패널의 `StateControl`이 옵션 선택 시 호출
- `useScreenStateProps(hash, allStates)`: 화면 부모(App.tsx)가 호출 — 모든 real-binding의 valueMap을 활성 옵션 기준으로 merge한 props patch를 반환
- 화면 컴포넌트는 그 patch를 default props에 spread해 분기 렌더

**App.tsx 패턴**:
```tsx
const parsed = useMemo(() => policyForHash(hash) ? parsePolicy(policyForHash(hash)!) : null, [hash]);
const allStates = useMemo(() => parsed ? collectStates(parsed) : [], [parsed]);
const patch = useScreenStateProps(hash, allStates);

const dashboardSampleData = typeof patch.sampleData === "boolean" ? patch.sampleData : sampleData;
// ... <Dashboard sampleData={dashboardSampleData} ... />
```

**작성 룰**:
- 새 state 추가 시 *우선* real binding으로 가는 길을 검토한다. 어떤 props/render 분기를 일으키는지 명시 가능하면 `valueMap`을 작성.
- valueMap에는 화면 컴포넌트가 받는 *현재 prop key*들을 사용 (예: `sampleData`, `backlogs`, `loading`). prop name이 바뀌면 양방향 sync 룰(§ 7) 발동 — valueMap도 같이 수정.
- 화면이 아직 해당 분기를 구현하지 않았으면 일단 `"kind": "visual"`로 두고 description에 "real binding 미구현" 명시 → 후속 작업 시 real로 승격.
- 정책 작성자가 valueMap을 적었는데 화면 코드가 그 prop을 안 받으면 → 화면이 무시. 양방향 sync 룰(§ 7)에 따라 화면 컴포넌트가 그 prop을 받도록 코드를 수정한다.

---

## 7. 양방향 Sync 룰 (가장 중요)

화면을 수정할 때 **코드와 정책 둘 중 하나만 고치는 것을 금지한다.** 사용자가 한쪽만 수정해달라고 명시하지 않는 한, AI는 양쪽을 함께 sync 유지한다.

### 7.1 코드 → 정책 sync

Page.tsx 수정 시 다음 항목들을 정책에 반영:

| 코드 변경 | 정책에 반영할 곳 |
|---|---|
| 새 컴포넌트/zone 추가 | `policy.md` Sections에 새 `section` block + Page.tsx에 `data-zone` 마킹 |
| 새 버튼/링크/액션 추가 | 해당 section의 `interactions[]` 추가 + Page.tsx에 `data-action` 마킹 |
| props/콜백 signature 변경 | 영향받은 section의 `interactions[].result` 갱신 |
| 새 상태 분기 (예: loading/error 추가) | 해당 section의 `states[]` 추가 + **`binding.valueMap`에 prop patch 명시** (real binding) + CSS overlay는 옵션 |
| 컴포넌트 props signature 변경 | 영향받는 `binding.valueMap`의 key 갱신 (예: `sampleData` → `mode`) — valueMap이 stale하면 정책 토글이 무시되므로 즉시 sync |
| 룰/제약 변경 (예: 강제 정렬, 금지 패턴) | 해당 section의 `rules[]` 갱신 + Cross-cutting의 Global Rules 검토 |
| 진입 경로 변경 (라우팅, deeplink) | Overview의 Entry Points 갱신 |
| 새 시나리오 발생 (예: 신규 페르소나) | Overview의 Scenarios 추가 (GWT) + 관련 UX Requirements 검토 |

### 7.2 정책 → 코드 sync

`policy.md` 수정 시 다음 항목들을 코드에 반영:

| 정책 변경 | 코드에 반영할 곳 |
|---|---|
| 새 section 추가 | Page.tsx의 해당 위치에 `data-zone` 마킹 + (필요 시) 새 컴포넌트 구현 |
| 새 interaction 추가 | 해당 element에 `data-action` 마킹 + 콜백 구현 |
| `rules[]`에 must/must-not 추가 | 코드가 그 룰을 위반하지 않는지 확인 → 위반 시 수정 |
| 새 state + `binding.kind: "real"` + `valueMap` | 화면 컴포넌트가 valueMap의 prop key를 받도록 코드 확장 + App.tsx가 patch를 spread하도록 update |
| 기존 state에 `binding` 신설 (visual → real 승격) | 화면 컴포넌트의 분기 렌더 구현 (예: `if (!sampleData) <FreshDashboard />`) + App.tsx patch 적용 |
| selector 변경 | Page.tsx의 마킹 attribute 값과 일치하는지 확인 → StatusDot이 amber 뜨면 즉시 수정 |

### 7.3 검증 도구

- **StatusDot**: 우측 정책 패널의 모든 selector를 자동 검증. 노란/빨간 dot이 보이면 **즉시 sync 깨진 것** — 수정 전 PR 머지 금지.
- **MutationObserver**: 좌측 DOM 변경을 감지해 검증 재실행. 코드 hot reload 후에도 자동 갱신.
- 화면 작업 완료 후 dev server에서 모든 탭의 dot 색을 한 번 훑어보고 emerald 외 색이 없는지 확인.

---

## 8. Prototype 수정 가이드 (디자인 시스템)

새 컴포넌트/스타일을 추가하거나 기존 화면을 수정할 때는 다음 자원을 참조한다. **직접 hex 색상 작성, 임의 spacing 값 사용 금지.**

### 8.1 `DESIGN.md` — 시각 톤·원칙

레포 루트의 `DESIGN.md`가 디자인 시스템의 single source of truth. 새 컴포넌트 만들기 전 *반드시* 다음을 확인:
- Visual theme & atmosphere
- 색상 사용 의도 (cream/charcoal의 역할)
- typography 규칙
- spacing/density 가이드라인

### 8.2 `tailwind.config.js` — 토큰 팔레트

다음 토큰만 사용. 임의 값 금지.

**색상**:
- `cream` / `cream-surface` / `cream-light` (배경 톤)
- `charcoal` / `charcoal-muted` / `charcoal-offwhite` (텍스트/UI 톤)
- opacity modifier (`/40`, `/60`, `/80` 등) — Tailwind 기본 scale (5, 10, 20, 25, ... 100)만 사용. 임의 값(`/8`, `/85`)은 빌드는 통과해도 일관성 깨짐 → `/10`, `/80`으로 정규화.

**borderRadius**: `pill` · `card` · `container` · `xl`(rounded-xl 권장)

**boxShadow**: `inset-dark` · `focus` (기본 `shadow-sm`은 split-view 카드용)

**fontSize**: `display` · `section` · `sub` (Hero 등 큰 제목)

### 8.3 `src/index.css` — Utility 클래스

@layer components로 정의된 utility는 직접 사용:
- `btn-primary` · `btn-ghost` · `btn-surface` · `btn-pill`
- `card` (rounded-card + border + bg)
- `input-base`

직접 `bg-charcoal px-4 py-2 rounded-md ...`로 쓰지 말고 `btn-primary` 같은 utility 활용.

### 8.4 새 시각 패턴 도입 시

새 카드/버튼/입력 패턴이 필요하면:
1. 먼저 `DESIGN.md`와 `tailwind.config.js`에 있는지 확인
2. 없으면 `@layer components`에 utility로 추가 (한 번 정의, 여러 곳 재사용)
3. tailwind config 확장이 필요하면 토큰 이름까지 의미 있게 (`bg-warning` 같은 의미적 이름)

### 8.5 색상 직접 사용이 허용되는 예외

정책 패널의 시각화 컴포넌트에서 의도적으로 외부 톤(`#2563eb` 파랑, `emerald-600` 등)을 쓰는 경우는 OK — 이건 prototype의 일부가 아니라 *정책 도구*의 visual language이고, 일반 product UI와 명확히 분리되어야 한다.

---

## 9. 빠른 체크리스트 (화면 작업 마무리 전)

- [ ] `npm run build` 통과 (tsc + vite)
- [ ] dev server에서 콘솔 에러 0
- [ ] 정책 패널의 모든 StatusDot이 emerald (또는 의도된 sky/회색)
- [ ] State controls 적용 시 좌측 visual이 의도대로 (overlay 정상)
- [ ] 양방향 sync 완료 — 코드와 정책 둘 다 같이 수정되었는가?
- [ ] DESIGN.md / tailwind 토큰 외 임의 값 없는가?
