# Detailed Diff Report — `oh-my-claudecode-docs` vs `oh-my-codex-docs`

- Date: 2026-04-20
- OMC reference: `/home/devswha/workspace/oh-my-claudecode-docs`
- OMX target: `/home/devswha/workspace/oh-my-codex-docs`

## 비교 전제

두 레포는 목적은 비슷하지만 저장소 성격은 다르다.

### OMC reference repo
- content-only docs repo
- 루트에 MDX/메타가 직접 존재
- 사이트 렌더링 shell은 별도 site-shell repo가 담당

### OMX target repo
- Next.js/Fumadocs site shell + docs content를 함께 포함
- 실제 문서는 `content/docs/**` 아래 존재
- 따라서 **문서 구조 비교**는 OMC 루트 ↔ OMX `content/docs/` 기준으로 보는 것이 정확하다

---

## 1. 섹션/페이지 수 비교

### Canonical English page count
- OMC: **82**
- OMX: **105**

### Directory-level count

| Section | OMC | OMX | Notes |
|---|---:|---:|---|
| `.` | 1 | 1 | docs landing |
| `agents` | 1 | 1 | lane index |
| `agents/build-analysis` | 8 | 8 | same count |
| `agents/coordination` | 1 | 5 | OMX가 훨씬 넓음 |
| `agents/domain` | 8 | 14 | OMX specialist 확장 |
| `agents/review` | 2 | 6 | OMX review prompts 확장 |
| `concepts` | 1 | 1 | parity |
| `getting-started` | 1 | 1 | parity |
| `guides` | 1 | 1 | parity |
| `hooks` | 5 | 6 | OMX `codex-native-hooks` 추가 |
| `integrations` | 0 | 5 | OMX 전용 |
| `reference` | 7 | 9 | OMX `contracts`, `.omx directory` 추가 |
| `skills` | 1 | 1 | parity |
| `skills/utility` | 22 | 18 | 세부 구성이 다름 |
| `skills/workflow` | 15 | 19 | OMX workflow 확장 |
| `support` | 1 | 1 | parity |
| `tools` | 7 | 8 | tool taxonomy 다름 |

---

## 2. OMC에는 없고 OMX에만 있는 대표 페이지

### Agents / prompts
- `agents/build-analysis/explore-harness`
- `agents/coordination/quality-strategist`
- `agents/coordination/sisyphus-lite`
- `agents/coordination/team-executor`
- `agents/coordination/team-orchestrator`
- `agents/domain/build-fixer`
- `agents/domain/dependency-expert`
- `agents/domain/information-architect`
- `agents/domain/product-analyst`
- `agents/domain/product-manager`
- `agents/domain/researcher`
- `agents/domain/ux-researcher`
- `agents/domain/vision`
- `agents/review/api-reviewer`
- `agents/review/performance-reviewer`
- `agents/review/quality-reviewer`
- `agents/review/style-reviewer`

### Hooks / reference / integrations
- `hooks/codex-native-hooks`
- `integrations/openclaw`
- `integrations/clawhip`
- `integrations/mcp`
- `integrations/cli-bridges`
- `integrations/index`
- `reference/contracts`
- `reference/omx-directory`

### Skills / tools
- utility: `analyze`, `ask-claude`, `ask-gemini`, `build-fix`, `code-review`, `doctor`, `ecomode`, `git-master`, `help`, `note`, `omx-setup`, `review`, `security-review`
- workflow: `deepsearch`, `frontend-ui-ux`, `pipeline`, `ralph-init`, `swarm`, `tdd`, `trace`, `visual-verdict`, `web-clone`, `wiki`, `worker`
- tools: `ask-claude`, `ask-gemini`, `catalog`, `hud`, `visual`, `wiki`

### 해석
이 차이들은 대부분 “누락”이 아니라 **OMX 자체 surface가 OMC보다 더 넓거나 다르게 분화되어 있기 때문**이다.

---

## 3. OMC에는 있지만 OMX에는 없는 대표 페이지

### Agents
- `agents/build-analysis/tracer`
- `agents/domain/document-specialist`
- `agents/domain/scientist`

### Skills
- utility: `ask`, `debug`, `learner`, `mcp-setup`, `omc-doctor`, `omc-reference`, `omc-setup`, `project-session-manager`, `release`, `remember`, `setup`, `skillify`, `trace`, `verify`, `visual-verdict`, `wiki`, `writer-memory`
- workflow: `ccg`, `deep-dive`, `deepinit`, `external-context`, `omc-teams`, `sciomc`, `self-improve`

### Tools
- `tools/ast-grep`
- `tools/lsp`
- `tools/notepad`
- `tools/project-memory`
- `tools/python-repl`

### 해석
이 차이도 대부분 “빠진 문서”라기보다 **OMC 전용 기능/명명 체계**이다. 그대로 맞추는 것이 아니라, OMX에서 실제 존재하는 surface만 남기는 것이 맞다.

---

## 4. 이번 작업에서 바뀐 파일 vs OMC 대응 관계

아래 표는 이번 변경 파일을 중심으로, OMC에서의 대응 파일과 정렬 방향을 정리한 것이다.

| OMX 파일 | OMC 대응 | 상태 | 이번 판단 |
|---|---|---|---|
| `README.md` | `README.md` | 구조 유사, 저장소 역할 다름 | OMC처럼 구조/기여 맥락을 보강하되, OMX는 site shell 포함 repo라는 점을 명시 |
| `content/docs/index.mdx` | `index.mdx` | 직접 대응 | OMC처럼 section map/next steps를 강화 |
| `content/docs/agents/index.mdx` | `agents/index.mdx` | 직접 대응 | placeholder → lane 설명 + usage guide |
| `content/docs/skills/index.mdx` | `skills/index.mdx` | 직접 대응 | workflow/utility lane 설명 강화 |
| `content/docs/hooks/index.mdx` | `hooks/index.mdx` | 직접 대응 | hook topics와 실전 역할 설명 강화 |
| `content/docs/tools/index.mdx` | `tools/index.mdx` | 직접 대응 | tool vs skill 역할 구분을 명확화 |
| `content/docs/reference/index.mdx` | `reference/index.mdx` | 직접 대응 | reference table과 lookup intent 강화 |
| `content/docs/integrations/index*.mdx` | 없음 | OMX 전용 | OMC의 상위 index 서술 패턴을 차용해 OMX 전용 섹션을 구조화 |
| `content/docs/support/index*.mdx` | `support/index*.mdx` | 직접 대응 | issue tracker 설명을 더 명확히 하고 upstream 링크 분리 |
| `src/app/[lang]/docs/[[...slug]]/page.tsx` | 없음 | site-shell 고유 | OMC content 구조와 실제 편집 경로를 반영하도록 edit link 수정 |
| `src/app/api/report/route.ts` | 없음 | site-shell 고유 | OMC support flow를 참고하되 OMX site의 vote/report contract를 실제 동작하게 수정 |
| `src/components/page-footer.tsx` | 없음 | site-shell 고유 | fake Turnstile token 제거 |
| `src/components/report-form.tsx` | 없음 | site-shell 고유 | disabled 문구 다국어화 |
| `next.config.mjs` | 없음 | site-shell 고유 | nested team worktree build 안정화 |
| `src/proxy.ts` | 없음 | site-shell 고유 | Next.js 16 convention 정렬 |
| `eslint.config.mjs` | 없음 | site-shell 고유 | `.omx/` runtime 산출물 lint 제외 |

---

## 5. 실제로 수정한 “정렬 대상”과 “의도적 비정렬” 구분

### A. 정렬한 것

#### 문서 흐름 / 진입 UX
OMC의 장점은 상위 인덱스가 단순 소개글이 아니라 “어디로 들어가야 하는지”를 알려준다는 점이다.
이번에 OMX도 이 점을 따라가도록 정리했다.

- 상위 섹션 index를 가이드형 문서로 보강
- README에 구조/콘텐츠 규칙 명시
- support 페이지 링크 문구 정리

#### 검증/운영 관점의 일관성
OMC content repo에는 없지만, OMX site repo에는 필요한 운영 레이어를 정리했다.

- edit link가 실제 편집 경로를 가리키도록 수정
- vote/report contract mismatch 제거
- Next.js 16 proxy convention 반영
- team worktree lint/build 안정화

### B. 의도적으로 맞추지 않은 것

#### 저장소 구조 자체
- OMC: content-only repo
- OMX: site shell + content 혼합 repo

이건 근본적으로 다르므로, 루트 구조를 OMC처럼 바꾸지 않았다.

#### OMX 고유 섹션 삭제 안 함
다음은 OMC에 없지만 OMX에 실재하므로 유지했다.

- `integrations/**`
- `reference/contracts.mdx`
- `reference/omx-directory.mdx`
- 더 넓은 agent/review/domain/coordination surface
- 더 넓은 workflow/utility skill surface

---

## 6. 이번 비교에서 확인된 실제 버그

### 수정 완료
1. **Edit this page 링크 경로 오류**
   - source docs 위치와 안 맞던 경로를 실제 `content/docs/` 기준으로 수정

2. **vote client/server contract mismatch**
   - client는 fake token, server는 Turnstile 강제 → 동작 불일치
   - vote와 report를 분리해 해결

3. **report form disabled 문구 영어 하드코딩**
   - 4개 언어 번역 추가

4. **Next.js 16 middleware deprecation**
   - `src/middleware.ts` → `src/proxy.ts`

5. **team worktree에서 Turbopack root 해석 문제**
   - nearest ancestor `node_modules/next` 탐색 로직 추가

6. **`$team` 이후 lint 오염**
   - `.omx/` runtime/worktree 산출물까지 lint가 읽던 문제 수정

### 참고만 하고 유지한 차이
1. OMC의 content-only repo 모델
2. OMC 전용 skill/tool/page taxonomy
3. OMX가 더 넓은 surface를 가진 부분들

---

## 7. 변경 크기 요약 (현재 `origin/main..HEAD` 기준)

총 changed files:
- **25 files**

주요 파일 목록:
- `README.md`
- `content/docs/agents/index.mdx`
- `content/docs/hooks/index.mdx`
- `content/docs/index.mdx`
- `content/docs/integrations/index*.mdx` (4 locale variants)
- `content/docs/reference/index.mdx`
- `content/docs/skills/index.mdx`
- `content/docs/support/index*.mdx` (4 locale variants)
- `content/docs/tools/index.mdx`
- `next.config.mjs`
- `src/app/[lang]/docs/[[...slug]]/page.tsx`
- `src/app/api/report/route.ts`
- `src/components/page-footer.tsx`
- `src/components/report-form.tsx`
- `src/lib/report-schema.ts`
- `src/proxy.ts`
- `src/lib/version.ts`
- `eslint.config.mjs`

---

## 8. 검증 상태

최종 HEAD 기준:

```text
npm run lint          PASS
npx tsc --noEmit      PASS
npm run build         PASS
```

team runtime 결과:
- team name: `compare-home-devswha-workspace`
- tasks: `completed=3`, `failed=0`
- shutdown 완료
- `.omx/state/team/compare-home-devswha-workspace` cleanup 확인

---

## 9. 리뷰 포인트 추천

PR 리뷰 시 특히 봐야 할 곳:

1. `src/app/api/report/route.ts`
   - vote/report 분리 계약이 운영 의도와 맞는지
2. `src/app/[lang]/docs/[[...slug]]/page.tsx`
   - edit 링크 대상이 실제 유지보수 플로우와 맞는지
3. `next.config.mjs`
   - worktree/Turbopack root 계산이 과도하지 않은지
4. `content/docs/*/index.mdx`
   - OMC 스타일을 따르면서도 OMX 사실관계를 잘 유지하는지
5. `content/docs/support/index*.mdx`
   - site issues vs upstream issues 구분이 충분히 명확한지

---

## 10. 결론

가장 정확한 비교 결론은 다음이다.

- **구조적으로는** OMX docs가 이미 OMC docs를 상당 부분 따르고 있었다.
- **콘텐츠 흐름 측면에서는** 상위 인덱스/README/support가 OMC보다 덜 구조화되어 있었고, 이번에 그 차이를 상당 부분 줄였다.
- **동작 측면에서는** OMC content-only repo에는 없는 site-shell 버그들(edit link, vote/report mismatch, Next 16 proxy, team worktree lint/build)가 존재했고, 이번에 실질적으로 해결했다.
- **차이점 대부분은 결함이 아니라 OMX 고유 확장**이며, 그 부분은 유지하는 것이 맞다.
