# Cream Prototype — Project Guide

이 프로젝트는 **좌측: 라이브 React 프로토타입 · 우측: 정책 문서**가 한 화면에 떠 있는 split-view PoC다. 화면(screen) 단위로 *정책 + 컨텍스트 + 의사결정 + 인터랙션 + state matrix*를 함께 정의하고, 우측 정책 패널이 좌측 prototype을 직접 가리키고(hover outline) 시뮬레이션한다(state controls).

새 화면을 추가하거나 기존 화면을 수정할 때 **반드시 이 문서의 컨벤션을 따른다**. 특히 **양방향 sync 룰(§ 7)** 은 모든 화면 수정의 기본 규칙이다.

---

## 1. 디렉토리 구조

```
src/
  App.tsx                       # hash → screen 라우팅 + policy panel state
  components/
    AppShell.tsx                # sidebar + topbar + main
    ScreenLayout.tsx            # 최상위 split view (prototype | policy)
    PolicyPanel.tsx             # 모드 토글, 탭 strip, 본문 라우팅
    MarkdownView.tsx
    policy-blocks/
      SectionView.tsx           # 섹션 탭 페이지 (Components/Interactions/Rules/States)
      ScenariosBlock.tsx        # GWT 카드
      UxRequirementsBlock.tsx   # 요구사항 + scenarios cross-ref
      StatusDot.tsx             # selector 검증 상태 시각화
  lib/
    policy-parsing.ts           # md → ParsedPolicy { preface, overview, sections[], crossCutting }
    policy-validation.ts        # useSelectorValidation 훅 (MutationObserver)
  screens/
    _registry.ts                # hash → { policy, enhanced } 매핑
    <screen-name>/
      Page.tsx                  # React 컴포넌트
      policy.md                 # 자유 텍스트 (Standard 모드)
      policy.enhanced.md        # 3-tier + fenced blocks (Enhanced 모드)
      index.ts                  # export { Component, policy, enhancedPolicy }
  pages/                        # 아직 screens/로 마이그레이션 안 된 페이지
```

기존 `src/pages/<Name>.tsx`를 마이그레이션할 때는 `git mv` 사용해 히스토리 보존, import 경로(`../components` → `../../components`, `../lib` → `../../lib`) 갱신.

---

## 2. 새 화면 추가 절차

1. `mkdir -p src/screens/<name>/`
2. `git mv src/pages/<Name>.tsx src/screens/<name>/Page.tsx` (기존 페이지인 경우) 또는 신규 작성
3. import 경로 2~3개 갱신 (상대 경로 한 단계 깊어짐)
4. `policy.md` 작성 (자유 md, Standard 모드용)
5. `policy.enhanced.md` 작성 (3-tier 구조, Enhanced 모드용. § 4 schema 참고)
6. `index.ts`:
   ```ts
   export { <Name> } from "./Page";
   export { default as policy } from "./policy.md?raw";
   export { default as enhancedPolicy } from "./policy.enhanced.md?raw";
   ```
7. `_registry.ts`에 등록:
   ```ts
   import { policy as <name>Policy, enhancedPolicy as <name>EnhancedPolicy } from "./<name>";
   SCREEN_POLICIES["#<hash>"] = { policy: <name>Policy, enhanced: <name>EnhancedPolicy };
   ```
8. `App.tsx`의 hash 분기에 새 컴포넌트 라우팅 추가
9. **Page.tsx에 selector 마킹**: § 5 컨벤션에 따라 `data-zone`, `data-action` 부여

---

## 3. 정책 작성 컨벤션 — 3-tier 구조

`policy.enhanced.md`의 골격:

```markdown
> **목적 한 줄.** [TL;DR — Why this screen exists.]

## Overview
### Audience
[자유 텍스트 — 주 사용자 / 페르소나]

### Scenarios
```scenarios
[GWT 시나리오 array — § 4.1 schema]
```

### UX Requirements
```ux-requirements
[요구사항 array, scenarios cross-ref — § 4.2 schema]
```

### Entry Points
[markdown table 또는 list — 진입 경로]

## Sections
[각 zone마다 ```section``` fenced block 하나 — § 4.3 schema]

## Cross-cutting
### Data & State
### Empty States
### Global Rules
### Future Work
### Related Screens
### Open Questions
```

- **Overview**와 **Cross-cutting**은 PolicyPanel에서 같은 "Overview" 탭에 합쳐 렌더된다 (사이에 divider).
- 각 `## Sections` 안 fenced `section` block은 독립 탭으로 분리된다.
- 작성자는 두 H2를 명시적으로 분리해서 적어 *외부 시점(Audience/Entry)* 과 *내부 정책(Data/Rules/Future)* 의 의미를 구분한다.

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

`scenarios` 배열의 값은 같은 화면 `scenarios` 블록의 `id`와 정확히 일치해야 한다 (pill hover → 위 시나리오 카드 양방향 outline).

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

---

## 6. State Controls

좌측 prototype을 다른 state로 시뮬레이션하는 UI. SectionView 헤더 아래 primary block으로 렌더.

**동작**: state option 선택 시 좌측 DOM에 `data-<state.id>="<value>"` attribute가 부여된다. CSS attribute selector로 visual 효과 (overlay, skeleton 등) 시뮬레이션. `default` 값일 땐 attribute 제거.

**작성 룰**:
- `options[].description`은 *반드시* 작성. 단순 loading뿐 아니라 user role/permission/A-B variant 등 분기 의미가 복잡한 경우 description으로 명확히 한다.
- 새 state 종류면 `src/index.css`에 해당 attribute selector 추가:
  ```css
  [data-<state.id>="<value>"]::after {
    content: "...";
    /* overlay style */
  }
  ```
- state 변경은 React state 시스템과 격리되어 있다 (DOM attribute만). 실제 컴포넌트 분기 (props 변경)가 필요하면 별도 협의.

**cleanup**: 탭 전환/패널 close 시 attribute 자동 제거. side-effect 누수 없음.

---

## 7. 양방향 Sync 룰 (가장 중요)

화면을 수정할 때 **코드와 정책 둘 중 하나만 고치는 것을 금지한다.** 사용자가 한쪽만 수정해달라고 명시하지 않는 한, AI는 양쪽을 함께 sync 유지한다.

### 7.1 코드 → 정책 sync

Page.tsx 수정 시 다음 항목들을 정책에 반영:

| 코드 변경 | 정책에 반영할 곳 |
|---|---|
| 새 컴포넌트/zone 추가 | `policy.enhanced.md` Sections에 새 `section` block + Page.tsx에 `data-zone` 마킹 |
| 새 버튼/링크/액션 추가 | 해당 section의 `interactions[]` 추가 + Page.tsx에 `data-action` 마킹 |
| props/콜백 signature 변경 | 영향받은 section의 `interactions[].result` 갱신 |
| 새 상태 분기 (예: loading/error 추가) | 해당 section의 `states[]` 추가 (description 포함) + CSS overlay 추가 |
| 룰/제약 변경 (예: 강제 정렬, 금지 패턴) | 해당 section의 `rules[]` 갱신 + Cross-cutting의 Global Rules 검토 |
| 진입 경로 변경 (라우팅, deeplink) | Overview의 Entry Points 갱신 |
| 새 시나리오 발생 (예: 신규 페르소나) | Overview의 Scenarios 추가 (GWT) + 관련 UX Requirements 검토 |

### 7.2 정책 → 코드 sync

`policy.enhanced.md` 수정 시 다음 항목들을 코드에 반영:

| 정책 변경 | 코드에 반영할 곳 |
|---|---|
| 새 section 추가 | Page.tsx의 해당 위치에 `data-zone` 마킹 + (필요 시) 새 컴포넌트 구현 |
| 새 interaction 추가 | 해당 element에 `data-action` 마킹 + 콜백 구현 |
| `rules[]`에 must/must-not 추가 | 코드가 그 룰을 위반하지 않는지 확인 → 위반 시 수정 |
| 새 state 추가 | CSS overlay 추가 + (필요 시) 컴포넌트 분기 |
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
