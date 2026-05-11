# PR-Ready Summary — OMC 구조 정렬 + OMX 사실 기반 보정

- Date: 2026-04-20
- Workspace: `/home/devswha/workspace/oh-my-codex-docs`
- Reference repo: `/home/devswha/workspace/oh-my-claudecode-docs`
- Goal: OMC docs의 정보 구조와 문서 흐름을 참고하되, 내용은 OMX 실제 surface에 맞게 유지하면서 현재 사이트의 링크/지원/검증 버그를 수정

## 제안 PR 제목

```text
Align OMX docs flow with OMC reference and fix docs/report/build mismatches
```

## 한 줄 요약

OMC docs 레포의 상위 문서 흐름과 섹션 개요 패턴을 OMX 사이트에 맞게 이식하고, 문서 편집 링크·support/vote 계약·Next.js 16 proxy 전환·team worktree lint/build 문제를 함께 정리했다.

## 왜 이 변경이 필요한가

현재 레포는 이미 OMC의 큰 IA를 따르고 있었지만, 다음 문제가 남아 있었다.

1. 상위 인덱스 페이지들이 placeholder 성격이 강해서 OMC만큼 좋은 문서 진입점을 제공하지 못함
2. `Edit this page` 링크가 실제 문서 소스 경로와 어긋남
3. support/vote 경로가 client/server 계약상 불일치 (`turnstileToken: 'n/a'` 전송)
4. Next.js 16 기준 `middleware.ts` deprecation 경고가 존재함
5. OMX `$team` 사용 후 `.omx/` worker worktree 때문에 lint가 오염될 수 있음
6. nested team worktree에서 `next build` 검증이 Turbopack root 해석에 민감함

## 핵심 변경 사항

### 1) 문서 진입 페이지를 OMC처럼 구조화
다음 페이지를 placeholder 설명에서 “섹션 개요 + 탐색 가이드 + 진입점” 형태로 확장했다.

- `content/docs/index.mdx`
- `content/docs/agents/index.mdx`
- `content/docs/skills/index.mdx`
- `content/docs/hooks/index.mdx`
- `content/docs/tools/index.mdx`
- `content/docs/reference/index.mdx`
- `content/docs/integrations/index.mdx`
- `content/docs/integrations/index.ko.mdx`
- `content/docs/integrations/index.ja.mdx`
- `content/docs/integrations/index.zh.mdx`
- `README.md`

### 2) 문서 편집 링크를 실제 소스 위치로 수정
- `src/app/[lang]/docs/[[...slug]]/page.tsx`
- 기존: upstream repo 기준 경로 계산
- 수정: 실제 docs source 위치인 `devswha/oh-my-codex-docs/content/docs/...`로 링크

### 3) vote/report 계약 정리
- `src/lib/report-schema.ts`
- `src/app/api/report/route.ts`
- `src/components/page-footer.tsx`
- `src/components/report-form.tsx`

정리 결과:
- `vote`는 더 이상 fake Turnstile token에 의존하지 않음
- `report`는 Turnstile/GitHub issue flow 유지
- support form disabled 메시지는 4개 언어 모두 지역화됨

### 4) support 문구 정리
- `content/docs/support/index.mdx`
- `content/docs/support/index.ko.mdx`
- `content/docs/support/index.ja.mdx`
- `content/docs/support/index.zh.mdx`

정리 결과:
- site issue tracker를 더 명확하게 표시
- upstream project 링크를 분리해서 정보 혼선을 줄임

### 5) Next.js 16 / team worktree 검증 안정화
- `next.config.mjs`
- `src/proxy.ts` (`src/middleware.ts` → `src/proxy.ts`)
- `eslint.config.mjs`

정리 결과:
- nested team worktree에서도 `next build`가 안정적으로 동작하도록 `turbopack.root`를 nearest ancestor `node_modules/next` 기준으로 계산
- Next.js 16의 middleware deprecation 제거
- `.omx/` runtime/worktree 산출물을 lint 범위 밖으로 제외

## 변경 파일 그룹

### Docs / content
- `README.md`
- `content/docs/index.mdx`
- `content/docs/agents/index.mdx`
- `content/docs/skills/index.mdx`
- `content/docs/hooks/index.mdx`
- `content/docs/tools/index.mdx`
- `content/docs/reference/index.mdx`
- `content/docs/integrations/index.mdx`
- `content/docs/integrations/index.ko.mdx`
- `content/docs/integrations/index.ja.mdx`
- `content/docs/integrations/index.zh.mdx`
- `content/docs/support/index.mdx`
- `content/docs/support/index.ko.mdx`
- `content/docs/support/index.ja.mdx`
- `content/docs/support/index.zh.mdx`

### App / runtime / validation
- `src/app/[lang]/docs/[[...slug]]/page.tsx`
- `src/app/api/report/route.ts`
- `src/components/page-footer.tsx`
- `src/components/report-form.tsx`
- `src/lib/report-schema.ts`
- `next.config.mjs`
- `src/proxy.ts`
- `eslint.config.mjs`
- `src/lib/version.ts` (prebuild 반영)

## 의도적 차이점

이번 변경은 OMC를 “그대로 복사”한 것이 아니다. 다음은 의도적으로 유지한 OMX 차이점이다.

- `content/docs/integrations/**` 섹션 유지
- `content/docs/reference/contracts.mdx`, `content/docs/reference/omx-directory.mdx` 유지
- OMC에 없는 더 넓은 agent/skill surface 유지
- OMC의 content-only repo 구조를 따르지 않고, 이 repo가 site shell + docs content를 함께 가진 구조라는 점을 `README`에 명시

## 검증 결과

실행한 검증:

```text
npm run lint          ✅
npx tsc --noEmit      ✅
npm run build         ✅
```

추가 증거:
- team worker verification lane에서 nested worktree build/lint/typecheck 성공
- worker-1 lane에서 live `POST /api/report` vote payload → `HTTP 200 {"ok":true}` 확인
- team runtime `compare-home-devswha-workspace`는 `completed=3, failed=0` 상태 후 정상 shutdown 완료

## 사용자 영향

- docs landing / section index에서 필요한 문서를 더 빨리 찾을 수 있음
- edit link가 실제 수정 가능한 경로를 가리킴
- vote 요청이 더 이상 서버와 계약 불일치로 깨지지 않음
- Next.js 16 경고와 team-based build/lint 오염이 줄어듦

## 남은 리스크

1. `src/lib/version.ts`는 prebuild에서 갱신되므로 버전 churn 가능성은 남음
2. `report` 경로는 여전히 Turnstile/GitHub env가 정확히 설정되어야 실제 이슈 생성까지 정상 동작함
3. team auto-checkpoint/merge 기반 작업이라 commit history는 다소 거칠 수 있음

## PR 본문 초안

```md
## Summary
- align top-level docs/index flows with the OMC reference structure while keeping OMX-specific sections intact
- fix docs edit-link path, support/vote contract mismatches, and localized support-form disabled copy
- stabilize Next.js 16 verification by switching middleware -> proxy, resolving Turbopack root for nested team worktrees, and excluding `.omx/` runtime artifacts from lint

## Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- verified vote POST path returns 200 after contract fix
```
