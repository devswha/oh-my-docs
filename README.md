# oh-my-docs

`oh-my-docs`는 다음 4개 문서 사이트를 한 저장소에서 함께 관리하기 위한 monorepo입니다.

- `apps/codex` — `oh-my-codex-docs`
- `apps/claudecode` — `oh-my-claudecode-docs`
- `apps/openagent` — `oh-my-openagent-docs`
- `apps/gajae-code` — `gajae-code-docs`

## 운영 원칙

- 각 앱은 기존 Next/Fumadocs 프로젝트 구조를 유지합니다.
- 루트는 공통 실행/검증 스크립트와 마이그레이션 기록을 관리합니다.
- 원본 레포 히스토리는 `git subtree` 방식으로 각 `apps/*` prefix 아래 보존합니다.
- 배포/환경 값은 앱별로 분리하고, `.env.local` 및 `.vercel` 같은 로컬 상태는 커밋하지 않습니다.

## 마이그레이션 기록

초기 import 기록과 향후 `git subtree pull/split` 절차는 [`MIGRATION.md`](./MIGRATION.md)에 정리되어 있습니다.

## Vercel 배포 관리

Vercel 프로젝트 매핑과 배포 스크립트는 [`deploy/vercel/`](./deploy/vercel/)에서 관리합니다. 먼저 `npm run vercel:sync-links`로 앱별 `.vercel/project.json`을 재생성한 뒤 preview/production 배포 스크립트를 사용합니다. 실제 Vercel 프로젝트의 monorepo Root Directory 변경은 `npm run vercel:configure:dry`로 확인하고, `VERCEL_TOKEN`이 있을 때 `npm run vercel:configure:apply`로 적용합니다.

## 자주 쓰는 명령

```bash
npm run dev:codex
npm run dev:claudecode
npm run dev:openagent
npm run dev:gajae-code
npm run build
npm run lint
```

앱별 의존성은 기존 lockfile을 유지하기 위해 필요 시 다음 명령으로 설치합니다.

```bash
npm run install:all
```
