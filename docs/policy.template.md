<!--
  Cream Prototype — policy.md 빈 골격 템플릿

  사용법:
  1. 이 파일을 `src/screens/<screen-name>/policy.md` 로 복사
  2. 본 주석 + [TODO ...] 자리표시자를 모두 화면 내용으로 채움
  3. CLAUDE.md § 4 schema를 참고하며 fenced JSON 본문 작성
  4. Page.tsx에 `data-zone` / `data-action` 마킹을 추가 (CLAUDE.md § 5)
  5. `_registry.ts` 등록 및 `App.tsx` 라우팅 추가

  fenced block 작성 주의:
  - JSON 본문이므로 `//` 주석 사용 불가, `"` 는 `\"` escape
  - 어떤 필드든 미사용 시 빈 배열/생략 가능 (parser는 graceful fallback)
  - 모든 id 값은 화면 내 unique한 kebab-case 권장
-->

> [한 줄. 이 화면이 왜 존재하는가. prefix / 부연 설명 없이 핵심만.]

## Overview

### Audience

[TODO — 주 사용자 / 페르소나 / 어떤 직무·맥락의 사람이 들어오는가. 자유 텍스트.]

### User Stories

```scenarios
[
  {
    "id": "TODO-story-id",
    "name": "TODO 짧은 시나리오 이름",
    "given": "TODO 사용자 컨텍스트/사전 조건",
    "when": "TODO 트리거되는 이벤트/행동",
    "then": "TODO 기대 결과 (UX requirements 충족이 전제)"
  }
]
```

### UX Requirements

```ux-requirements
[
  {
    "id": "TODO-requirement-id",
    "title": "TODO 한 줄 요건 제목",
    "description": "TODO 이 요건이 충족되어야 하는 이유와 구체적 기준",
    "scenarios": ["TODO-story-id"]
  }
]
```

### Entry Points

| 진입 | 기본 동작 |
|---|---|
| [TODO 진입 경로 1] | [TODO 도착 후 동작] |
| [TODO 진입 경로 2] | [TODO 도착 후 동작] |

## Sections

상단부터 순서대로. 각 zone마다 fenced `section` 블록 하나씩.

```section
{
  "id": "TODO-section-id",
  "name": "TODO 섹션 이름",
  "selector": "[data-zone=\"TODO-section-id\"]",
  "summary": "TODO 한 줄 요약",
  "components": [
    { "name": "TODO ComponentName", "description": "TODO 짧은 설명" }
  ],
  "interactions": [
    {
      "trigger": "TODO 트리거 라벨 (예: + New Issue)",
      "result": "TODO 결과 / 후속 동작",
      "selector": "[data-action=\"TODO-action-id\"]"
    }
  ],
  "rules": [
    { "kind": "must", "text": "TODO 반드시 지켜야 할 룰" },
    { "kind": "must-not", "text": "TODO 금지 패턴" }
  ],
  "states": [
    {
      "id": "TODO-state-id",
      "label": "TODO 짧은 state 이름",
      "options": [
        {
          "value": "default",
          "label": "TODO 기본 옵션 라벨",
          "description": "TODO 이 옵션이 의미하는 화면 상태와 동작 설명"
        },
        {
          "value": "TODO-other",
          "label": "TODO 다른 옵션 라벨",
          "description": "TODO 의미 분기 설명 (단순 loading이 아닌 user role/permission/variant 같은 분기는 반드시 명확히)"
        }
      ],
      "default": "default"
    }
  ]
}
```

<!--
  필요한 만큼 위 ```section``` 블록을 반복.
  components / interactions / rules / states 는 빈 배열로 두거나 필드 자체 생략 가능.
-->

## Cross-cutting

화면-전체 차원의 정책. 특정 섹션에 묶이지 않거나 여러 섹션에 걸쳐 적용되는 항목.

### Screen States

```states
[
  {
    "id": "TODO-screen-state-id",
    "label": "TODO 화면 전체 state 이름",
    "selectorTarget": "[aria-label=\"Prototype\"]",
    "options": [
      {
        "value": "default",
        "label": "TODO 기본",
        "description": "TODO 평상 시 상태"
      },
      {
        "value": "TODO-alt",
        "label": "TODO 분기 상태",
        "description": "TODO 어떤 조건에서 이 상태가 되는지 + 화면이 어떻게 달라져야 하는지"
      }
    ],
    "default": "default"
  }
]
```

### Global Rules

- ✓ [TODO 화면 전체에 적용되는 must 룰]
- ✗ [TODO 화면 전체에 적용되는 must-not 룰]

### Future Work

- [TODO 알려진 향후 개선 사항]

### Related Screens

- [TODO 관련 화면 1] — [TODO 어떤 흐름으로 연결되는지]
- [TODO 관련 화면 2] — [TODO ...]

### Open Questions

- [TODO 미해결 의사결정 / 추후 확인 필요 사항]
