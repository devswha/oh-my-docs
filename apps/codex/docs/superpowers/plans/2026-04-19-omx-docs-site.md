# OMX Docs Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the OMC docs site (Next.js 16 + Fumadocs 16, 4-language i18n) into `/home/devswha/workspace/oh-my-codex-docs/` as a standalone OMX (Oh My CodeX) docs site, replacing OMC-specific content with OMX-accurate data, and deploy to `omx.vibetip.help`.

**Architecture:** Clone OMC's Fumadocs scaffold selectively, inject OMX landing data (33 agent prompts, 37 skills, `$`-prefixed skill invocations), author content MDX trees in 4 languages via porting + generator scripts, validate with `next build` + a term-replacement grep gate, then deploy on Vercel.

**Tech Stack:** Next.js 16, React 19, Fumadocs 16 (`fumadocs-core` / `fumadocs-ui` / `fumadocs-mdx`), Tailwind v4, Mermaid, `@vercel/analytics`, TypeScript 5.7.

**Reference Spec:** `docs/superpowers/specs/2026-04-19-omx-docs-site-design.md`

**Upstream sources** (reference only — not cloned into this repo):
- OMC template: `github.com/Yeachan-Heo/oh-my-claudecode-website` (local: `/home/devswha/workspace/oh-my-claudecode-website`)
- OMX upstream: `github.com/Yeachan-Heo/oh-my-codex` (local shallow clone: `/tmp/omx-scan`)

---

## Conventions Used in This Plan

- **Absolute paths.** Every file reference is rooted at `/home/devswha/workspace/oh-my-codex-docs/` unless noted.
- **OMC source paths** are rooted at `/home/devswha/workspace/oh-my-claudecode-website/`.
- **Commit messages** use conventional commits with scope `docs-site` (e.g., `feat(docs-site): add landing page`).
- **Each commit is narrow** — one task = one commit unless explicitly batched.
- **Testing**: for this project, the primary "test" is `npm run build` completing without error and the acceptance grep/HTTP checks in Task 30.
- **Never run destructive git commands.** If a step fails, fix forward.

---

## File Structure (Final State)

```
oh-my-codex-docs/
├─ package.json                              # name: "oh-my-codex-docs"
├─ package-lock.json
├─ tsconfig.json
├─ eslint.config.mjs
├─ postcss.config.mjs
├─ next.config.mjs
├─ next-env.d.ts
├─ source.config.ts
├─ .gitignore
├─ README.md
├─ scripts/
│  └─ inject-omx-version.mjs                 # writes src/lib/version.ts from upstream
├─ src/
│  ├─ middleware.ts
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ global.css
│  │  ├─ api/search/route.ts
│  │  └─ [lang]/
│  │     ├─ layout.tsx
│  │     ├─ page.tsx                         # landing (OMX-specific)
│  │     └─ docs/
│  │        ├─ layout.tsx                    # uses OMX_VERSION
│  │        └─ [[...slug]]/page.tsx
│  ├─ components/
│  │  ├─ copy-install.tsx                    # "npm i -g oh-my-codex"
│  │  └─ mermaid.tsx
│  └─ lib/
│     ├─ i18n.ts
│     ├─ source.ts
│     └─ version.ts                          # generated, checked in
├─ content/docs/
│  ├─ index.{en,ko,zh,ja}.mdx
│  ├─ meta.{json,ko.json,zh.json,ja.json}
│  ├─ getting-started/
│  ├─ concepts/
│  ├─ guides/
│  ├─ agents/
│  │  ├─ build-analysis/
│  │  ├─ review/
│  │  ├─ domain/
│  │  └─ coordination/
│  ├─ skills/
│  │  ├─ workflow/
│  │  └─ utility/
│  ├─ hooks/
│  ├─ tools/
│  ├─ integrations/
│  └─ reference/
├─ public/
│  ├─ images/
│  └─ favicon.ico
└─ docs/superpowers/
   ├─ specs/2026-04-19-omx-docs-site-design.md
   └─ plans/2026-04-19-omx-docs-site.md
```

---

## Phase 1 — Repo Scaffold

### Task 1: Initialize package.json and install deps

**Files:**
- Create: `/home/devswha/workspace/oh-my-codex-docs/package.json`
- Create: `/home/devswha/workspace/oh-my-codex-docs/.gitignore`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "oh-my-codex-docs",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "prebuild": "node scripts/inject-omx-version.mjs",
    "dev": "node scripts/inject-omx-version.mjs && next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@tailwindcss/postcss": "^4.2.1",
    "@types/dompurify": "^3.0.5",
    "@types/mdx": "^2.0.0",
    "@vercel/analytics": "^2.0.1",
    "dompurify": "^3.3.3",
    "fumadocs-core": "^16.6.0",
    "fumadocs-mdx": "^14.2.0",
    "fumadocs-ui": "^16.6.0",
    "mermaid": "^11.13.0",
    "next": "^16.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.5",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.0",
    "eslint-config-next": "^16.2.0",
    "postcss": "^8.5.0",
    "tailwindcss": "^4.2.1",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Write .gitignore**

Copy verbatim from `/home/devswha/workspace/oh-my-claudecode-website/.gitignore` (`node_modules/`, `.next/`, `.vercel/`, `.source/`, `.DS_Store`, `*.tsbuildinfo`, `next-env.d.ts`, `.env*`).

- [ ] **Step 3: Install dependencies**

```bash
cd /home/devswha/workspace/oh-my-codex-docs && npm install
```
Expected: `added N packages` with no errors. Creates `package-lock.json` and `node_modules/`.

- [ ] **Step 4: Commit**

```bash
cd /home/devswha/workspace/oh-my-codex-docs
git add package.json package-lock.json .gitignore
git commit -m "feat(docs-site): initialize oh-my-codex-docs Next.js scaffold"
```

---

### Task 2: Copy build configs from OMC

**Files:**
- Create: `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `eslint.config.mjs`, `source.config.ts`, `next-env.d.ts`

- [ ] **Step 1: Copy configs verbatim**

```bash
cd /home/devswha/workspace/oh-my-codex-docs
cp /home/devswha/workspace/oh-my-claudecode-website/tsconfig.json .
cp /home/devswha/workspace/oh-my-claudecode-website/next.config.mjs .
cp /home/devswha/workspace/oh-my-claudecode-website/postcss.config.mjs .
cp /home/devswha/workspace/oh-my-claudecode-website/eslint.config.mjs .
cp /home/devswha/workspace/oh-my-claudecode-website/source.config.ts .
cp /home/devswha/workspace/oh-my-claudecode-website/next-env.d.ts .
```

- [ ] **Step 2: Verify source.config.ts**

Run: `cat source.config.ts`
Expected:
```ts
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig();
```
If not matching, edit to this exact content.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json next.config.mjs postcss.config.mjs eslint.config.mjs source.config.ts next-env.d.ts
git commit -m "feat(docs-site): copy build configs from omc"
```

---

### Task 3: Create directory skeleton

**Files:**
- Create (empty dirs): `src/app/api/search`, `src/app/[lang]/docs/[[...slug]]`, `src/components`, `src/lib`, `content/docs/{getting-started,concepts,guides,hooks,tools,integrations,reference}`, `content/docs/agents/{build-analysis,review,domain,coordination}`, `content/docs/skills/{workflow,utility}`, `public/images`, `scripts`

- [ ] **Step 1: Create directories**

```bash
cd /home/devswha/workspace/oh-my-codex-docs
mkdir -p src/app/api/search \
         "src/app/[lang]/docs/[[...slug]]" \
         src/components src/lib \
         content/docs/{getting-started,concepts,guides,hooks,tools,integrations,reference} \
         content/docs/agents/{build-analysis,review,domain,coordination} \
         content/docs/skills/{workflow,utility} \
         public/images \
         scripts
```

- [ ] **Step 2: Add .gitkeep to empty dirs** (git can't track empties)

```bash
find content public src scripts -type d -empty -exec touch {}/.gitkeep \;
```

- [ ] **Step 3: Commit**

```bash
git add content public src scripts
git commit -m "feat(docs-site): create directory skeleton"
```

---

## Phase 2 — Port OMC Framework Code

### Task 4: Port i18n, source, middleware (no edits)

**Files:**
- Create: `src/lib/i18n.ts`, `src/lib/source.ts`, `src/middleware.ts`

- [ ] **Step 1: Copy three files verbatim**

```bash
cd /home/devswha/workspace/oh-my-codex-docs
cp /home/devswha/workspace/oh-my-claudecode-website/src/lib/i18n.ts src/lib/i18n.ts
cp /home/devswha/workspace/oh-my-claudecode-website/src/lib/source.ts src/lib/source.ts
cp /home/devswha/workspace/oh-my-claudecode-website/src/middleware.ts src/middleware.ts
```

- [ ] **Step 2: Verify i18n.ts content**

Run: `cat src/lib/i18n.ts`
Expected: exports `i18n` with `defaultLanguage: 'en'`, `languages: ['en', 'ko', 'zh', 'ja']`, `hideLocale: 'default-locale'`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/i18n.ts src/lib/source.ts src/middleware.ts
git commit -m "feat(docs-site): port i18n, source loader, middleware"
```

---

### Task 5: Port root app shell

**Files:**
- Create: `src/app/layout.tsx`, `src/app/global.css`

- [ ] **Step 1: Copy `global.css` verbatim**

```bash
cp /home/devswha/workspace/oh-my-claudecode-website/src/app/global.css src/app/global.css
```

- [ ] **Step 2: Copy `layout.tsx` and rewrite title**

Copy, then edit `src/app/layout.tsx`:

```tsx
import 'fumadocs-ui/style.css';
import './global.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Oh My CodeX — Docs',
  description:
    'Official documentation for oh-my-codex, a multi-agent orchestration layer for OpenAI Codex CLI.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/global.css
git commit -m "feat(docs-site): port root app shell with omx metadata"
```

---

### Task 6: Port [lang]/layout.tsx and [lang]/docs/[[...slug]]/page.tsx (verbatim)

**Files:**
- Create: `src/app/[lang]/layout.tsx`
- Create: `src/app/[lang]/docs/[[...slug]]/page.tsx`

- [ ] **Step 1: Copy verbatim**

```bash
cp /home/devswha/workspace/oh-my-claudecode-website/src/app/\[lang\]/layout.tsx "src/app/[lang]/layout.tsx"
cp /home/devswha/workspace/oh-my-claudecode-website/src/app/\[lang\]/docs/\[\[...slug\]\]/page.tsx "src/app/[lang]/docs/[[...slug]]/page.tsx"
```

- [ ] **Step 2: Sanity-check imports**

Run: `grep -n "from '@/" "src/app/[lang]/layout.tsx" "src/app/[lang]/docs/[[...slug]]/page.tsx"`
Expected: imports reference `@/lib/i18n`, `@/lib/source`, `@/components/mermaid` — all will resolve after Task 7 and Task 8.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[lang]"
git commit -m "feat(docs-site): port lang layout and docs slug renderer"
```

---

### Task 7: Port mermaid component verbatim

**Files:**
- Create: `src/components/mermaid.tsx`

- [ ] **Step 1: Copy**

```bash
cp /home/devswha/workspace/oh-my-claudecode-website/src/components/mermaid.tsx src/components/mermaid.tsx
```

- [ ] **Step 2: Commit**

```bash
git add src/components/mermaid.tsx
git commit -m "feat(docs-site): port mermaid component"
```

---

### Task 8: Customize CopyInstallCommand for OMX

**Files:**
- Create: `src/components/copy-install.tsx`

- [ ] **Step 1: Copy from OMC and edit install command**

```bash
cp /home/devswha/workspace/oh-my-claudecode-website/src/components/copy-install.tsx src/components/copy-install.tsx
```

- [ ] **Step 2: Edit to use `oh-my-codex`**

Open `src/components/copy-install.tsx` and replace the install command string. It currently shows OMC's slash-command install flow. Replace the displayed/copied command with:

```
npm i -g oh-my-codex
```

Keep the rest of the component (button, copy-to-clipboard behavior, DOMPurify usage) identical. If OMC's copy-install shows two slash commands (`/plugin marketplace add ...` and `/plugin install oh-my-codex`), replace the entire visible snippet block with the single npm command above.

- [ ] **Step 3: Commit**

```bash
git add src/components/copy-install.tsx
git commit -m "feat(docs-site): customize install command for omx"
```

---

## Phase 3 — Version Injection

### Task 9: Write inject-omx-version.mjs

**Files:**
- Create: `scripts/inject-omx-version.mjs`
- Create: `src/lib/version.ts`

- [ ] **Step 1: Write the injector script**

Write `scripts/inject-omx-version.mjs`:

```js
#!/usr/bin/env node
// Fetches the current upstream oh-my-codex version and writes it to src/lib/version.ts.
// Strategy: try GitHub raw package.json over HTTPS; on failure, keep existing version.ts.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'src', 'lib', 'version.ts');
const RAW_URL =
  'https://raw.githubusercontent.com/Yeachan-Heo/oh-my-codex/main/package.json';

async function fetchUpstreamVersion() {
  const res = await fetch(RAW_URL, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const pkg = await res.json();
  if (!pkg.version || typeof pkg.version !== 'string') {
    throw new Error('package.json missing version field');
  }
  return pkg.version;
}

function writeVersionFile(version) {
  const content = `// Auto-generated by scripts/inject-omx-version.mjs. Do not edit by hand.\nexport const OMX_VERSION = ${JSON.stringify(version)};\n`;
  writeFileSync(outPath, content, 'utf8');
}

try {
  const v = await fetchUpstreamVersion();
  writeVersionFile(v);
  console.log(`[inject-omx-version] OMX_VERSION=${v}`);
} catch (err) {
  if (existsSync(outPath)) {
    const existing = readFileSync(outPath, 'utf8');
    console.warn(
      `[inject-omx-version] fetch failed (${err.message}); keeping existing version.ts`,
    );
    process.stdout.write(existing);
  } else {
    const fallback = '0.13.2';
    writeVersionFile(fallback);
    console.warn(
      `[inject-omx-version] fetch failed (${err.message}); wrote fallback ${fallback}`,
    );
  }
}
```

- [ ] **Step 2: Run the injector to seed version.ts**

```bash
cd /home/devswha/workspace/oh-my-codex-docs
node scripts/inject-omx-version.mjs
cat src/lib/version.ts
```
Expected: prints a single export line like `export const OMX_VERSION = "0.13.2";`.

- [ ] **Step 3: Commit**

```bash
git add scripts/inject-omx-version.mjs src/lib/version.ts
git commit -m "feat(docs-site): add upstream version injector script"
```

---

### Task 10: Wire version badge into docs layout

**Files:**
- Create: `src/app/[lang]/docs/layout.tsx`

- [ ] **Step 1: Start from OMC version and swap the hardcoded v4.12.0 for OMX_VERSION**

Write `src/app/[lang]/docs/layout.tsx`:

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { i18n } from '@/lib/i18n';
import { OMX_VERSION } from '@/lib/version';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      nav={{
        title: (
          <div className="flex flex-col">
            <span>Oh My CodeX</span>
            <span className="text-xs text-fd-muted-foreground">v{OMX_VERSION}</span>
          </div>
        ),
        url: lang === i18n.defaultLanguage ? '/docs' : `/${lang}/docs`,
      }}
      sidebar={{ defaultOpenLevel: 1 }}
      i18n={i18n}
      links={[
        {
          text: 'GitHub',
          url: 'https://github.com/Yeachan-Heo/oh-my-codex',
          external: true,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/[lang]/docs/layout.tsx"
git commit -m "feat(docs-site): wire version badge from upstream injector"
```

---

### Task 11: Port search API route

**Files:**
- Create: `src/app/api/search/route.ts`

- [ ] **Step 1: Copy verbatim from OMC**

```bash
cp /home/devswha/workspace/oh-my-claudecode-website/src/app/api/search/route.ts src/app/api/search/route.ts
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/search/route.ts
git commit -m "feat(docs-site): port fumadocs search api route"
```

---

## Phase 4 — Landing Page

### Task 12: Write landing page skeleton with en translations

**Files:**
- Create: `src/app/[lang]/page.tsx`

- [ ] **Step 1: Write file with layout + en-only translation object**

Create `src/app/[lang]/page.tsx` using OMC's structure. Base the JSX scaffold exactly on `/home/devswha/workspace/oh-my-claudecode-website/src/app/[lang]/page.tsx` (HomeLayout + Hero + Features + Pipeline + Agents + Skills + Steps + Footer). Replace these constants and the `translations.en` object:

```ts
const AGENTS = {
  'Build & Analysis': [
    'explore', 'analyst', 'planner', 'architect',
    'debugger', 'executor', 'verifier', 'explore-harness',
  ],
  Review: [
    'code-reviewer', 'security-reviewer', 'quality-reviewer',
    'style-reviewer', 'api-reviewer', 'performance-reviewer',
  ],
  Domain: [
    'test-engineer', 'qa-tester', 'writer', 'designer',
    'researcher', 'ux-researcher', 'information-architect',
    'product-analyst', 'product-manager', 'dependency-expert',
    'git-master', 'build-fixer', 'code-simplifier', 'vision',
  ],
  Coordination: [
    'critic', 'quality-strategist', 'team-orchestrator',
    'team-executor', 'sisyphus-lite',
  ],
};
```

And the `en` entry inside `translations`:

```ts
en: {
  heroSubtitle: 'Multi-Agent Orchestration for Codex CLI',
  heroDesc: [
    'A workflow layer for OpenAI Codex CLI.',
    '33 agent prompts and 37 skills working together.',
  ],
  metaTitle: 'Oh My CodeX — Multi-Agent Orchestration for Codex CLI',
  metaDescription:
    'Official documentation for oh-my-codex, a multi-agent orchestration layer for OpenAI Codex CLI.',
  getStarted: 'Get Started',
  viewDocs: 'View Docs',
  whatsDifferent: "What's Different?",
  whatsDifferentDesc:
    'A specialized agent layer that runs on top of OpenAI Codex CLI.',
  features: [
    { title: '33 Specialized Agent Prompts',
      desc: 'Prompts dedicated to each role from exploration and planning to verification and review.',
      tag: 'Agents' },
    { title: '37 Automation Skills',
      desc: '$autopilot, $ralph, $ultrawork — complex pipelines run with a single invocation.',
      tag: 'Skills' },
    { title: 'Codex-Native Hooks',
      desc: 'Lifecycle, context, and magic-keyword hooks wired directly into Codex CLI.',
      tag: 'Hooks' },
    { title: 'Cross-CLI Integrations',
      desc: 'OpenClaw bridges Codex and Claude; MCP and $ask-claude / $ask-gemini bring external tools in.',
      tag: 'Integrations' },
  ],
  pipelineTitle: '$autopilot Pipeline',
  pipelineDesc:
    'From a single idea, analysis, design, planning, execution, QA, and verification all run automatically.',
  pipelineSteps: [
    { label: 'Idea',       role: 'User'     },
    { label: 'Analysis',   role: 'Analyst'  },
    { label: 'Design',     role: 'Architect'},
    { label: 'Planning',   role: 'Planner'  },
    { label: 'Execution',  role: 'Executor' },
    { label: 'QA',         role: 'UltraQA'  },
    { label: 'Validation', role: 'Verifier' },
  ],
  agentsTitle: 'Specialized Agent Prompts',
  agentsDesc: '4 lanes, 33 prompts. Each optimized for its role.',
  viewAllAgents: 'View all agents',
  skillsTitle: 'Key Skills',
  skillsDesc: 'Execute complex workflows with a single invocation.',
  skills: [
    { name: 'deep-interview',
      desc: 'Socratic requirements crystallization before execution.' },
    { name: 'ralplan',
      desc: 'Iterative consensus planning until planner, architect, and critic agree.' },
    { name: 'team',
      desc: 'N coordinated agents on a shared task list.' },
    { name: 'ralph',
      desc: 'Self-referential loop that never stops until complete.' },
  ],
  viewAllSkills: 'View all skills',
  stepsTitle: 'Get Started in 3 Steps',
  steps: [
    { step: '01', title: 'Install Codex CLI',
      desc: 'Run "npm i -g @openai/codex".' },
    { step: '02', title: 'Install OMX',
      desc: 'Run "npm i -g oh-my-codex", then "omx setup".' },
    { step: '03', title: 'Start $autopilot',
      desc: 'Type "autopilot build me X" and agents will start working.' },
  ],
},
```

Also swap in the landing skills list — note the `$` prefix is the OMX convention and is already included by the JSX: the template in OMC prefixes with `/`. Edit that one line in the JSX block from `/{skill.name}` to `${skill.name}`. Every other JSX element stays exactly as OMC had it. For the nav title and footer, replace "Oh My ClaudeCode" with "Oh My CodeX" and the GitHub URL with `https://github.com/Yeachan-Heo/oh-my-codex`.

- [ ] **Step 2: Leave ko/zh/ja placeholders in `translations` for now**

For `ko`, `zh`, `ja` keys of `translations`, duplicate the exact `en` object as a placeholder. They will be fully translated in Task 13. This keeps TypeScript type inference happy and the landing page rendering on all locales in the meantime.

- [ ] **Step 3: Run dev build to verify landing compiles**

```bash
cd /home/devswha/workspace/oh-my-codex-docs
npm run build 2>&1 | tail -40
```
Expected: no TypeScript errors, build emits `/`, `/ko`, `/zh`, `/ja`. Ignore warnings about missing `content/docs` pages — those arrive in Phase 5.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[lang]/page.tsx"
git commit -m "feat(docs-site): add landing page with en translations"
```

---

### Task 13: Translate landing to ko, zh, ja

**Files:**
- Modify: `src/app/[lang]/page.tsx`

- [ ] **Step 1: Replace the `ko` object**

Overwrite the `ko:` entry in `translations` with:

```ts
ko: {
  heroSubtitle: 'Codex CLI를 위한 멀티 에이전트 오케스트레이션',
  heroDesc: [
    'OpenAI Codex CLI를 위한 워크플로우 레이어.',
    '33개 에이전트 프롬프트와 37개 스킬이 협업합니다.',
  ],
  metaTitle: 'Oh My CodeX — Codex CLI 멀티 에이전트 오케스트레이션',
  metaDescription:
    'oh-my-codex 공식 문서. OpenAI Codex CLI를 위한 멀티 에이전트 오케스트레이션.',
  getStarted: '시작하기',
  viewDocs: '문서 보기',
  whatsDifferent: '무엇이 다른가요?',
  whatsDifferentDesc:
    'OpenAI Codex CLI 위에서 동작하는 전문 에이전트 레이어입니다.',
  features: [
    { title: '33개 전문 에이전트 프롬프트',
      desc: '탐색, 계획, 구현, 검증, 리뷰까지 각 역할에 특화된 프롬프트가 분담합니다.',
      tag: 'Agents' },
    { title: '37개 자동화 스킬',
      desc: '$autopilot, $ralph, $ultrawork -- 한 번의 호출로 복잡한 파이프라인이 실행됩니다.',
      tag: 'Skills' },
    { title: 'Codex 네이티브 훅',
      desc: '생명주기, 컨텍스트, 매직 키워드 훅을 Codex CLI에 직접 연결합니다.',
      tag: 'Hooks' },
    { title: '크로스 CLI 통합',
      desc: 'OpenClaw가 Codex와 Claude를 잇고, MCP와 $ask-claude / $ask-gemini가 외부 도구를 연결합니다.',
      tag: 'Integrations' },
  ],
  pipelineTitle: '$autopilot 파이프라인',
  pipelineDesc:
    '아이디어 하나로 분석, 설계, 계획, 실행, QA, 검증까지 자동으로 진행됩니다.',
  pipelineSteps: [
    { label: '아이디어', role: 'User' },
    { label: '분석',     role: 'Analyst' },
    { label: '설계',     role: 'Architect' },
    { label: '계획',     role: 'Planner' },
    { label: '실행',     role: 'Executor' },
    { label: 'QA',       role: 'UltraQA' },
    { label: '검증',     role: 'Verifier' },
  ],
  agentsTitle: '전문 에이전트 프롬프트',
  agentsDesc: '4개 레인, 33개 프롬프트. 각자의 역할에 최적화되어 있습니다.',
  viewAllAgents: '전체 에이전트 보기',
  skillsTitle: '주요 스킬',
  skillsDesc: '한 번의 호출로 복잡한 워크플로우를 실행합니다.',
  skills: [
    { name: 'deep-interview', desc: '실행 전에 소크라틱 방식으로 요구사항을 구체화합니다.' },
    { name: 'ralplan', desc: 'Planner, Architect, Critic이 합의할 때까지 반복 계획합니다.' },
    { name: 'team', desc: 'N개의 에이전트가 공유 태스크 리스트에서 협업합니다.' },
    { name: 'ralph', desc: '완료될 때까지 멈추지 않는 자기참조 루프입니다.' },
  ],
  viewAllSkills: '전체 스킬 보기',
  stepsTitle: '3단계로 시작합니다',
  steps: [
    { step: '01', title: 'Codex CLI 설치',
      desc: '"npm i -g @openai/codex"를 실행합니다.' },
    { step: '02', title: 'OMX 설치',
      desc: '"npm i -g oh-my-codex"을 실행한 뒤 "omx setup"을 실행합니다.' },
    { step: '03', title: '$autopilot 시작',
      desc: '"autopilot build me X"를 입력하면 에이전트들이 일을 시작합니다.' },
  ],
},
```

- [ ] **Step 2: Replace the `zh` object**

Overwrite the `zh:` entry with:

```ts
zh: {
  heroSubtitle: 'Codex CLI 的多智能体编排系统',
  heroDesc: [
    'OpenAI Codex CLI 的工作流层。',
    '33 个智能体提示词和 37 个技能协同工作。',
  ],
  metaTitle: 'Oh My CodeX — Codex CLI 多智能体编排',
  metaDescription:
    'oh-my-codex 官方文档。OpenAI Codex CLI 的多智能体编排插件。',
  getStarted: '开始使用',
  viewDocs: '查看文档',
  whatsDifferent: '有何不同？',
  whatsDifferentDesc:
    '运行在 OpenAI Codex CLI 之上的专业智能体层。',
  features: [
    { title: '33 个专业智能体提示词',
      desc: '从探索、规划、实施到验证与审核，每个角色都由专门的提示词负责。',
      tag: 'Agents' },
    { title: '37 个自动化技能',
      desc: '$autopilot、$ralph、$ultrawork — 一次调用即可运行复杂流水线。',
      tag: 'Skills' },
    { title: 'Codex 原生钩子',
      desc: '生命周期、上下文、魔法关键词钩子直接接入 Codex CLI。',
      tag: 'Hooks' },
    { title: '跨 CLI 集成',
      desc: 'OpenClaw 架起 Codex 与 Claude，MCP、$ask-claude、$ask-gemini 接入外部工具。',
      tag: 'Integrations' },
  ],
  pipelineTitle: '$autopilot 流水线',
  pipelineDesc:
    '从一个想法出发，分析、设计、规划、执行、QA、验证全程自动化。',
  pipelineSteps: [
    { label: '想法', role: 'User' },
    { label: '分析', role: 'Analyst' },
    { label: '设计', role: 'Architect' },
    { label: '规划', role: 'Planner' },
    { label: '执行', role: 'Executor' },
    { label: 'QA',   role: 'UltraQA' },
    { label: '验证', role: 'Verifier' },
  ],
  agentsTitle: '专业智能体提示词',
  agentsDesc: '4 条通路，33 个提示词。各自针对角色优化。',
  viewAllAgents: '查看全部智能体',
  skillsTitle: '核心技能',
  skillsDesc: '一次调用即可执行复杂工作流。',
  skills: [
    { name: 'deep-interview', desc: '执行前用苏格拉底式对话结晶化需求。' },
    { name: 'ralplan', desc: 'Planner、Architect、Critic 达成共识前反复规划。' },
    { name: 'team', desc: 'N 个智能体在共享任务列表上协作。' },
    { name: 'ralph', desc: '不完成不停止的自引用循环。' },
  ],
  viewAllSkills: '查看全部技能',
  stepsTitle: '三步开始使用',
  steps: [
    { step: '01', title: '安装 Codex CLI',
      desc: '运行 "npm i -g @openai/codex"。' },
    { step: '02', title: '安装 OMX',
      desc: '运行 "npm i -g oh-my-codex" 后执行 "omx setup"。' },
    { step: '03', title: '启动 $autopilot',
      desc: '输入 "autopilot build me X"，智能体就会开始工作。' },
  ],
},
```

- [ ] **Step 3: Replace the `ja` object**

Overwrite the `ja:` entry with:

```ts
ja: {
  heroSubtitle: 'Codex CLI のためのマルチエージェント・オーケストレーション',
  heroDesc: [
    'OpenAI Codex CLI のためのワークフローレイヤー。',
    '33 個のエージェントプロンプトと 37 個のスキルが協調して動作します。',
  ],
  metaTitle: 'Oh My CodeX — Codex CLI のマルチエージェント・オーケストレーション',
  metaDescription:
    'oh-my-codex の公式ドキュメント。OpenAI Codex CLI のためのマルチエージェント・オーケストレーション。',
  getStarted: 'はじめる',
  viewDocs: 'ドキュメントを見る',
  whatsDifferent: '何が違うのか？',
  whatsDifferentDesc:
    'OpenAI Codex CLI の上で動作する専門エージェントレイヤーです。',
  features: [
    { title: '33 個の専門エージェントプロンプト',
      desc: '探索、計画、実装、検証、レビューまで、各役割に特化したプロンプトが分担します。',
      tag: 'Agents' },
    { title: '37 個の自動化スキル',
      desc: '$autopilot、$ralph、$ultrawork -- 一度の呼び出しで複雑なパイプラインを実行します。',
      tag: 'Skills' },
    { title: 'Codex ネイティブフック',
      desc: 'ライフサイクル、コンテキスト、マジックキーワードのフックが Codex CLI に直接接続します。',
      tag: 'Hooks' },
    { title: 'クロス CLI 統合',
      desc: 'OpenClaw が Codex と Claude を橋渡しし、MCP や $ask-claude / $ask-gemini が外部ツールを繋ぎます。',
      tag: 'Integrations' },
  ],
  pipelineTitle: '$autopilot パイプライン',
  pipelineDesc:
    '一つのアイデアから、分析・設計・計画・実行・QA・検証までが自動で進行します。',
  pipelineSteps: [
    { label: 'アイデア', role: 'User' },
    { label: '分析',     role: 'Analyst' },
    { label: '設計',     role: 'Architect' },
    { label: '計画',     role: 'Planner' },
    { label: '実行',     role: 'Executor' },
    { label: 'QA',       role: 'UltraQA' },
    { label: '検証',     role: 'Verifier' },
  ],
  agentsTitle: '専門エージェントプロンプト',
  agentsDesc: '4 レーン、33 プロンプト。それぞれの役割に最適化されています。',
  viewAllAgents: 'すべてのエージェントを見る',
  skillsTitle: '主要スキル',
  skillsDesc: '一度の呼び出しで複雑なワークフローを実行します。',
  skills: [
    { name: 'deep-interview', desc: '実行前にソクラテス式対話で要件を結晶化します。' },
    { name: 'ralplan', desc: 'Planner・Architect・Critic が合意するまで繰り返し計画します。' },
    { name: 'team', desc: 'N 個のエージェントが共有タスクリストで協調します。' },
    { name: 'ralph', desc: '完了するまで止まらない自己参照ループ。' },
  ],
  viewAllSkills: 'すべてのスキルを見る',
  stepsTitle: '3 ステップではじめる',
  steps: [
    { step: '01', title: 'Codex CLI をインストール',
      desc: '"npm i -g @openai/codex" を実行します。' },
    { step: '02', title: 'OMX をインストール',
      desc: '"npm i -g oh-my-codex" を実行後、"omx setup" を実行します。' },
    { step: '03', title: '$autopilot を起動',
      desc: '"autopilot build me X" と入力すれば、エージェントが動き始めます。' },
  ],
},
```

- [ ] **Step 4: Rebuild and verify all four landings**

```bash
npm run build 2>&1 | tail -20
```
Expected: 4 locale home pages emitted.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[lang]/page.tsx"
git commit -m "feat(docs-site): translate landing to ko/zh/ja"
```

---

## Phase 5 — Content Scaffolding

### Task 14: Root index + root meta files

**Files:**
- Create: `content/docs/index.mdx`, `content/docs/index.ko.mdx`, `content/docs/index.zh.mdx`, `content/docs/index.ja.mdx`
- Create: `content/docs/meta.json`, `content/docs/meta.ko.json`, `content/docs/meta.zh.json`, `content/docs/meta.ja.json`

- [ ] **Step 1: Write identical meta.json across the 4 languages**

Write `content/docs/meta.json` (and copies to `.ko.json`, `.zh.json`, `.ja.json` with only the `title` localized):

```json
{
  "title": "OMX Docs",
  "pages": ["index", "getting-started", "concepts", "guides",
            "agents", "skills", "hooks", "tools",
            "integrations", "reference"]
}
```

Write equivalent for each locale, changing only `title`:
- `meta.ko.json`: `"title": "OMX 문서"`
- `meta.zh.json`: `"title": "OMX 文档"`
- `meta.ja.json`: `"title": "OMX ドキュメント"`

- [ ] **Step 2: Write index.mdx (en)**

Create `content/docs/index.mdx`:

```mdx
---
title: Oh My CodeX
description: Multi-agent orchestration for OpenAI Codex CLI. Zero learning curve.
---

**Multi-agent orchestration for OpenAI Codex CLI. Zero learning curve.**

_Don't learn Codex prompts. Just use OMX._

Oh My CodeX (OMX) is a workflow layer that runs on top of OpenAI Codex CLI. With a single invocation it coordinates specialized agent prompts to automate complex development tasks end-to-end.

## Quick Start

### Step 1 — Install Codex CLI

```bash
npm i -g @openai/codex
```

### Step 2 — Install OMX

```bash
npm i -g oh-my-codex
```

### Step 3 — Setup

```bash
omx setup
```

### Step 4 — Try $autopilot

In a Codex CLI session, type:

```
autopilot build me a todo app in next.js
```

## What's Next

- [Getting Started](./getting-started) — full installation and first run
- [Core Concepts](./concepts) — agents, skills, hooks, teams
- [Agents](./agents) — the 33 agent prompts
- [Skills](./skills) — the 37 automation skills
- [Integrations](./integrations) — OpenClaw, MCP, cross-CLI bridges
```

- [ ] **Step 3: Write ko/zh/ja variants**

Duplicate `index.mdx` as `index.ko.mdx`, `index.zh.mdx`, `index.ja.mdx`. Translate the prose; keep install commands, code fences, and links unchanged. Use the four-language copy style established in Task 13.

- [ ] **Step 4: Commit**

```bash
git add content/docs/index.mdx content/docs/index.ko.mdx content/docs/index.zh.mdx content/docs/index.ja.mdx content/docs/meta.json content/docs/meta.ko.json content/docs/meta.zh.json content/docs/meta.ja.json
git commit -m "docs(docs-site): add root index and meta in 4 languages"
```

---

### Task 15: Generator script for simple single-page sections

Goal: automate creating `getting-started/`, `concepts/`, `guides/` directories — each has exactly one `index.mdx` page × 4 languages + 1 `meta.json` × 4 languages.

**Files:**
- Create: `scripts/scaffold-sections.mjs`

- [ ] **Step 1: Write the scaffolder**

```js
#!/usr/bin/env node
// Scaffolds fumadocs sections that contain only an index page, one per language.
// Run: node scripts/scaffold-sections.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SECTIONS = [
  {
    slug: 'getting-started',
    titles: {
      en: 'Getting Started',
      ko: '시작하기',
      zh: '快速开始',
      ja: 'クイックスタート',
    },
    body: {
      en: 'Install Codex CLI, install oh-my-codex, run `omx setup`, and invoke `$autopilot`.',
      ko: 'Codex CLI를 설치하고, oh-my-codex를 설치한 뒤 `omx setup`을 실행하고 `$autopilot`을 호출합니다.',
      zh: '安装 Codex CLI，安装 oh-my-codex，运行 `omx setup`，然后调用 `$autopilot`。',
      ja: 'Codex CLI をインストールし、oh-my-codex をインストールした後、`omx setup` を実行し `$autopilot` を呼び出します。',
    },
  },
  {
    slug: 'concepts',
    titles: {
      en: 'Core Concepts',
      ko: '주요 개념',
      zh: '核心概念',
      ja: 'コアコンセプト',
    },
    body: {
      en: 'OMX concepts: agent prompts, skills, Codex-native hooks, team orchestration, the `.omx/` state directory.',
      ko: 'OMX 핵심 개념: 에이전트 프롬프트, 스킬, Codex 네이티브 훅, 팀 오케스트레이션, `.omx/` 상태 디렉터리.',
      zh: 'OMX 核心概念：智能体提示词、技能、Codex 原生钩子、团队编排、`.omx/` 状态目录。',
      ja: 'OMX コアコンセプト：エージェントプロンプト、スキル、Codex ネイティブフック、チームオーケストレーション、`.omx/` ステートディレクトリ。',
    },
  },
  {
    slug: 'guides',
    titles: {
      en: 'Guides',
      ko: '가이드',
      zh: '指南',
      ja: 'ガイド',
    },
    body: {
      en: 'Task-oriented walkthroughs for common OMX workflows.',
      ko: 'OMX의 대표 워크플로우를 작업 중심으로 안내합니다.',
      zh: '以任务为中心的 OMX 常用工作流导览。',
      ja: 'タスク中心で OMX の代表的なワークフローを案内します。',
    },
  },
];
const LANGS = ['en', 'ko', 'zh', 'ja'];

for (const s of SECTIONS) {
  const dir = join(ROOT, 'content', 'docs', s.slug);
  mkdirSync(dir, { recursive: true });
  for (const lang of LANGS) {
    const metaName = lang === 'en' ? 'meta.json' : `meta.${lang}.json`;
    const mdxName = lang === 'en' ? 'index.mdx' : `index.${lang}.mdx`;
    writeFileSync(
      join(dir, metaName),
      JSON.stringify({ title: s.titles[lang], pages: ['index'] }, null, 2) + '\n',
      'utf8',
    );
    writeFileSync(
      join(dir, mdxName),
      `---\ntitle: ${s.titles[lang]}\ndescription: ${s.body[lang]}\n---\n\n${s.body[lang]}\n`,
      'utf8',
    );
  }
}

console.log(`[scaffold-sections] wrote ${SECTIONS.length} sections × ${LANGS.length} langs`);
```

- [ ] **Step 2: Run the scaffolder**

```bash
node scripts/scaffold-sections.mjs
```
Expected: `wrote 3 sections × 4 langs`.

- [ ] **Step 3: Verify tree**

```bash
ls content/docs/getting-started content/docs/concepts content/docs/guides
```
Expected: each directory contains `index.mdx index.ja.mdx index.ko.mdx index.zh.mdx meta.ja.json meta.json meta.ko.json meta.zh.json`.

- [ ] **Step 4: Commit**

```bash
git add scripts/scaffold-sections.mjs content/docs/getting-started content/docs/concepts content/docs/guides
git commit -m "docs(docs-site): scaffold getting-started, concepts, guides"
```

---

### Task 16: Generator for multi-page flat sections (hooks, tools, integrations, reference)

**Files:**
- Create: `scripts/scaffold-flat-sections.mjs`

- [ ] **Step 1: Write the scaffolder**

```js
#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LANGS = ['en', 'ko', 'zh', 'ja'];

const SECTIONS = [
  {
    slug: 'hooks',
    titles: { en: 'Hooks', ko: '훅', zh: '钩子', ja: 'フック' },
    pages: [
      { slug: 'lifecycle-events', title: 'Lifecycle Events', body: 'PreToolUse, PostToolUse, Stop, SessionStart, and other event phases exposed to OMX hooks.' },
      { slug: 'core-hooks', title: 'Core Hooks', body: 'The built-in OMX hooks shipped with oh-my-codex.' },
      { slug: 'context-hooks', title: 'Context Hooks', body: 'Hooks that inject context (memory, directives, reminders) into Codex prompts.' },
      { slug: 'magic-keywords', title: 'Magic Keywords', body: 'Phrases detected by OMX hooks that route work to skills ("autopilot", "ralph", "team", ...).' },
      { slug: 'codex-native-hooks', title: 'Codex-Native Hooks', body: 'Hooks wired directly into Codex CLI events, not emulated in a shell wrapper.' },
    ],
  },
  {
    slug: 'tools',
    titles: { en: 'Tools', ko: '도구', zh: '工具', ja: 'ツール' },
    pages: [
      { slug: 'state', title: 'State', body: 'Read/write OMX mode state at `.omx/state/`. Key operations and schema.' },
      { slug: 'hud', title: 'HUD', body: 'Heads-up display for OMX runs: layout, presets, display elements.' },
      { slug: 'wiki', title: 'Wiki', body: 'Persistent markdown knowledge base that compounds across sessions.' },
      { slug: 'catalog', title: 'Catalog', body: 'OMX agent/skill catalog manifest and how it is generated.' },
      { slug: 'visual', title: 'Visual', body: 'Screenshot-to-reference visual QA verdict workflow.' },
      { slug: 'ask-claude', title: '$ask-claude', body: 'Delegate a sub-question to Claude via the ask-claude CLI bridge.' },
      { slug: 'ask-gemini', title: '$ask-gemini', body: 'Delegate a sub-question to Gemini via the ask-gemini CLI bridge.' },
    ],
  },
  {
    slug: 'integrations',
    titles: { en: 'Integrations', ko: '통합', zh: '集成', ja: '統合' },
    pages: [
      { slug: 'openclaw', title: 'OpenClaw', body: 'Bridge that connects Codex CLI with Claude Code, sharing state and tool calls.' },
      { slug: 'clawhip', title: 'Clawhip', body: 'Event-contract layer used by OpenClaw to multiplex OMC and OMX.' },
      { slug: 'mcp', title: 'MCP', body: 'Model Context Protocol servers OMX can invoke from skills and hooks.' },
      { slug: 'cli-bridges', title: 'CLI Bridges', body: '`$ask-claude` and `$ask-gemini` and the tri-model (ccg-style) workflow.' },
    ],
  },
  {
    slug: 'reference',
    titles: { en: 'Reference', ko: '참조', zh: '参考', ja: 'リファレンス' },
    pages: [
      { slug: 'configuration', title: 'Configuration', body: 'OMX configuration files, env vars, and CLI flags.' },
      { slug: 'environment', title: 'Environment', body: 'Required and optional environment variables for OMX.' },
      { slug: 'migration', title: 'Migration', body: 'Migration notes when moving between OMX versions.' },
      { slug: 'changelog', title: 'Changelog', body: 'OMX release notes, mirrored from upstream `CHANGELOG.md`.' },
      { slug: 'quick-commands', title: 'Quick Commands', body: 'Frequently used OMX commands and shortcuts.' },
      { slug: 'cjk-ime', title: 'CJK IME', body: 'Korean/Chinese/Japanese IME handling in Codex CLI.' },
      { slug: 'contracts', title: 'Contracts', body: 'Prompt guidance, team mutation, and OpenClaw event contracts.' },
      { slug: 'omx-directory', title: '.omx Directory', body: 'Layout and contents of the per-project `.omx/` state directory.' },
    ],
  },
];

const TRANSLATIONS = {
  ko: { pageSuffix: ' (번역 초안)' },
  zh: { pageSuffix: '（翻译草稿）' },
  ja: { pageSuffix: '（翻訳ドラフト）' },
};

for (const s of SECTIONS) {
  const dir = join(ROOT, 'content', 'docs', s.slug);
  mkdirSync(dir, { recursive: true });
  for (const lang of LANGS) {
    const metaName = lang === 'en' ? 'meta.json' : `meta.${lang}.json`;
    writeFileSync(
      join(dir, metaName),
      JSON.stringify(
        { title: s.titles[lang], pages: s.pages.map((p) => p.slug) },
        null,
        2,
      ) + '\n',
      'utf8',
    );
    for (const p of s.pages) {
      const mdxName = lang === 'en' ? `${p.slug}.mdx` : `${p.slug}.${lang}.mdx`;
      const suffix = lang === 'en' ? '' : TRANSLATIONS[lang].pageSuffix;
      writeFileSync(
        join(dir, mdxName),
        `---\ntitle: ${p.title}${suffix}\ndescription: ${p.body}\n---\n\n${p.body}\n`,
        'utf8',
      );
    }
  }
}

console.log(
  `[scaffold-flat-sections] wrote ${SECTIONS.length} sections, ${SECTIONS.reduce((a, s) => a + s.pages.length, 0)} pages × ${LANGS.length} langs`,
);
```

- [ ] **Step 2: Run it**

```bash
node scripts/scaffold-flat-sections.mjs
```
Expected: `wrote 4 sections, 24 pages × 4 langs` (5 hooks + 7 tools + 4 integrations + 8 reference = 24).

- [ ] **Step 3: Spot-check**

```bash
ls content/docs/hooks content/docs/tools content/docs/integrations content/docs/reference
```
Expected: each contains meta files + all page MDX × 4 langs.

- [ ] **Step 4: Commit**

```bash
git add scripts/scaffold-flat-sections.mjs content/docs/hooks content/docs/tools content/docs/integrations content/docs/reference
git commit -m "docs(docs-site): scaffold hooks, tools, integrations, reference"
```

---

### Task 17: Generator for agents (4 lanes, 33 pages)

**Files:**
- Create: `scripts/scaffold-agents.mjs`

- [ ] **Step 1: Write the scaffolder**

```js
#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LANGS = ['en', 'ko', 'zh', 'ja'];

const ROOT_TITLES = { en: 'Agents', ko: '에이전트', zh: '智能体', ja: 'エージェント' };

const LANES = [
  {
    slug: 'build-analysis',
    titles: { en: 'Build & Analysis', ko: '빌드 & 분석', zh: '构建与分析', ja: 'ビルド & 分析' },
    agents: [
      'explore', 'analyst', 'planner', 'architect',
      'executor', 'debugger', 'verifier', 'explore-harness',
    ],
  },
  {
    slug: 'review',
    titles: { en: 'Review', ko: '리뷰', zh: '审核', ja: 'レビュー' },
    agents: [
      'code-reviewer', 'security-reviewer', 'quality-reviewer',
      'style-reviewer', 'api-reviewer', 'performance-reviewer',
    ],
  },
  {
    slug: 'domain',
    titles: { en: 'Domain', ko: '도메인', zh: '领域', ja: 'ドメイン' },
    agents: [
      'test-engineer', 'qa-tester', 'writer', 'designer',
      'researcher', 'ux-researcher', 'information-architect',
      'product-analyst', 'product-manager', 'dependency-expert',
      'git-master', 'build-fixer', 'code-simplifier', 'vision',
    ],
  },
  {
    slug: 'coordination',
    titles: { en: 'Coordination', ko: '조정', zh: '协调', ja: '調整' },
    agents: [
      'critic', 'quality-strategist', 'team-orchestrator',
      'team-executor', 'sisyphus-lite',
    ],
  },
];

// Sanity: total must be 33
const total = LANES.reduce((a, l) => a + l.agents.length, 0);
if (total !== 33) {
  console.error(`[scaffold-agents] expected 33 agents, got ${total}`);
  process.exit(1);
}

const LANE_SUFFIX = {
  ko: ' (번역 초안)',
  zh: '（翻译草稿）',
  ja: '（翻訳ドラフト）',
};

const agentsRoot = join(ROOT, 'content', 'docs', 'agents');
mkdirSync(agentsRoot, { recursive: true });

// Root meta for /agents
for (const lang of LANGS) {
  const metaName = lang === 'en' ? 'meta.json' : `meta.${lang}.json`;
  writeFileSync(
    join(agentsRoot, metaName),
    JSON.stringify(
      { title: ROOT_TITLES[lang], pages: LANES.map((l) => l.slug) },
      null,
      2,
    ) + '\n',
    'utf8',
  );
}

// Index pages per lane
for (const lang of LANGS) {
  const idxName = lang === 'en' ? 'index.mdx' : `index.${lang}.mdx`;
  const intro = {
    en: 'The OMX agent catalog. 33 role-specific prompts grouped into four lanes.',
    ko: 'OMX 에이전트 카탈로그. 33개의 역할별 프롬프트를 4개 레인으로 분류했습니다.',
    zh: 'OMX 智能体目录。33 个角色特定提示词分为四条通路。',
    ja: 'OMX エージェントカタログ。33 個の役割特化プロンプトを 4 レーンに分類。',
  };
  writeFileSync(
    join(agentsRoot, idxName),
    `---\ntitle: ${ROOT_TITLES[lang]}\ndescription: ${intro[lang]}\n---\n\n${intro[lang]}\n`,
    'utf8',
  );
}

// Per-lane dirs
for (const lane of LANES) {
  const dir = join(agentsRoot, lane.slug);
  mkdirSync(dir, { recursive: true });
  for (const lang of LANGS) {
    const metaName = lang === 'en' ? 'meta.json' : `meta.${lang}.json`;
    writeFileSync(
      join(dir, metaName),
      JSON.stringify(
        { title: lane.titles[lang], pages: lane.agents },
        null,
        2,
      ) + '\n',
      'utf8',
    );
    for (const agent of lane.agents) {
      const mdxName = lang === 'en' ? `${agent}.mdx` : `${agent}.${lang}.mdx`;
      const suffix = lang === 'en' ? '' : LANE_SUFFIX[lang];
      const bodies = {
        en: `The \`${agent}\` agent prompt. Port the OMC description of this role and adjust for OMX/Codex-specific invocation.`,
        ko: `\`${agent}\` 에이전트 프롬프트. OMC 설명을 OMX/Codex 기준으로 옮겨와 조정합니다.`,
        zh: `\`${agent}\` 智能体提示词。将 OMC 描述移植并针对 OMX/Codex 调整。`,
        ja: `\`${agent}\` エージェントプロンプト。OMC の説明を OMX/Codex 向けに移植・調整します。`,
      };
      writeFileSync(
        join(dir, mdxName),
        `---\ntitle: ${agent}${suffix}\ndescription: OMX agent prompt: ${agent}\n---\n\n${bodies[lang]}\n`,
        'utf8',
      );
    }
  }
}

console.log(`[scaffold-agents] wrote 33 agents across ${LANES.length} lanes × ${LANGS.length} langs`);
```

- [ ] **Step 2: Run it**

```bash
node scripts/scaffold-agents.mjs
```
Expected: `wrote 33 agents across 4 lanes × 4 langs`. If the script prints `expected 33 agents, got N`, do not proceed — fix the `LANES` array before retrying.

- [ ] **Step 3: Verify counts**

```bash
find content/docs/agents -name "*.mdx" ! -name "index*" | wc -l
```
Expected: `132` (33 pages × 4 languages).

- [ ] **Step 4: Commit**

```bash
git add scripts/scaffold-agents.mjs content/docs/agents
git commit -m "docs(docs-site): scaffold 33 agents across 4 lanes × 4 langs"
```

---

### Task 18: Generator for skills (2 lanes, 37 pages)

**Files:**
- Create: `scripts/scaffold-skills.mjs`

- [ ] **Step 1: Write the scaffolder**

```js
#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LANGS = ['en', 'ko', 'zh', 'ja'];

const ROOT_TITLES = { en: 'Skills', ko: '스킬', zh: '技能', ja: 'スキル' };

const LANES = [
  {
    slug: 'workflow',
    titles: { en: 'Workflow', ko: '워크플로우', zh: '工作流', ja: 'ワークフロー' },
    skills: [
      'autopilot', 'ralph', 'ralph-init', 'ralplan', 'team', 'swarm', 'worker',
      'pipeline', 'ultrawork', 'ultraqa', 'deep-interview', 'plan', 'tdd',
      'trace', 'deepsearch', 'frontend-ui-ux', 'visual-verdict', 'web-clone', 'wiki',
    ],
  },
  {
    slug: 'utility',
    titles: { en: 'Utility', ko: '유틸리티', zh: '实用工具', ja: 'ユーティリティ' },
    skills: [
      'ai-slop-cleaner', 'analyze', 'ask-claude', 'ask-gemini', 'build-fix',
      'cancel', 'code-review', 'configure-notifications', 'doctor', 'ecomode',
      'git-master', 'help', 'hud', 'note', 'omx-setup', 'review',
      'security-review', 'skill',
    ],
  },
];

const total = LANES.reduce((a, l) => a + l.skills.length, 0);
if (total !== 37) {
  console.error(`[scaffold-skills] expected 37 skills, got ${total}`);
  process.exit(1);
}

const LANE_SUFFIX = {
  ko: ' (번역 초안)',
  zh: '（翻译草稿）',
  ja: '（翻訳ドラフト）',
};

const root = join(ROOT, 'content', 'docs', 'skills');
mkdirSync(root, { recursive: true });

for (const lang of LANGS) {
  const metaName = lang === 'en' ? 'meta.json' : `meta.${lang}.json`;
  writeFileSync(
    join(root, metaName),
    JSON.stringify({ title: ROOT_TITLES[lang], pages: LANES.map((l) => l.slug) }, null, 2) + '\n',
    'utf8',
  );
  const idxName = lang === 'en' ? 'index.mdx' : `index.${lang}.mdx`;
  const intro = {
    en: 'The OMX skill catalog. 37 one-shot invocations that drive complex workflows.',
    ko: 'OMX 스킬 카탈로그. 복잡한 워크플로우를 한 번의 호출로 실행하는 37개 스킬.',
    zh: 'OMX 技能目录。37 个一次性调用驱动复杂工作流。',
    ja: 'OMX スキルカタログ。複雑なワークフローを 1 回の呼び出しで実行する 37 個のスキル。',
  };
  writeFileSync(
    join(root, idxName),
    `---\ntitle: ${ROOT_TITLES[lang]}\ndescription: ${intro[lang]}\n---\n\n${intro[lang]}\n`,
    'utf8',
  );
}

for (const lane of LANES) {
  const dir = join(root, lane.slug);
  mkdirSync(dir, { recursive: true });
  for (const lang of LANGS) {
    const metaName = lang === 'en' ? 'meta.json' : `meta.${lang}.json`;
    writeFileSync(
      join(dir, metaName),
      JSON.stringify({ title: lane.titles[lang], pages: lane.skills }, null, 2) + '\n',
      'utf8',
    );
    for (const skill of lane.skills) {
      const mdxName = lang === 'en' ? `${skill}.mdx` : `${skill}.${lang}.mdx`;
      const suffix = lang === 'en' ? '' : LANE_SUFFIX[lang];
      const bodies = {
        en: `Invoke with \`$${skill}\`. Port OMC behavior and adjust for OMX/Codex semantics.`,
        ko: `\`$${skill}\`로 호출합니다. OMC 동작을 OMX/Codex 기준으로 옮기고 조정합니다.`,
        zh: `使用 \`$${skill}\` 调用。将 OMC 行为移植并针对 OMX/Codex 调整。`,
        ja: `\`$${skill}\` で呼び出します。OMC の動作を OMX/Codex 向けに移植・調整します。`,
      };
      writeFileSync(
        join(dir, mdxName),
        `---\ntitle: $${skill}${suffix}\ndescription: OMX skill: ${skill}\n---\n\n${bodies[lang]}\n`,
        'utf8',
      );
    }
  }
}

console.log(`[scaffold-skills] wrote 37 skills across ${LANES.length} lanes × ${LANGS.length} langs`);
```

- [ ] **Step 2: Run it**

```bash
node scripts/scaffold-skills.mjs
```
Expected: `wrote 37 skills across 2 lanes × 4 langs`.

- [ ] **Step 3: Verify counts**

```bash
find content/docs/skills -name "*.mdx" ! -name "index*" | wc -l
```
Expected: `148` (37 × 4).

- [ ] **Step 4: Commit**

```bash
git add scripts/scaffold-skills.mjs content/docs/skills
git commit -m "docs(docs-site): scaffold 37 skills across 2 lanes × 4 langs"
```

---

## Phase 6 — Public Assets and README

### Task 19: Minimal public assets

**Files:**
- Create: `public/favicon.ico`, `public/images/.gitkeep`

- [ ] **Step 1: Copy favicon from OMC**

```bash
cp /home/devswha/workspace/oh-my-claudecode-website/public/favicon.ico public/favicon.ico 2>/dev/null || true
```
If OMC does not ship a favicon.ico, generate a 32x32 transparent PNG placeholder:
```bash
touch public/favicon.ico
```
(A proper branded asset is a follow-up item; build does not require this file to be real.)

- [ ] **Step 2: Ensure public/images is tracked**

```bash
touch public/images/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add public
git commit -m "chore(docs-site): add public asset placeholders"
```

---

### Task 20: Repo README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

```md
# oh-my-codex-docs

Official documentation site for [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex), a multi-agent orchestration layer for OpenAI Codex CLI.

- **Live site:** https://omx.vibetip.help
- **Framework:** Next.js 16 + Fumadocs 16
- **Languages:** English (default), 한국어, 中文, 日本語

## Development

```bash
npm install
npm run dev
```

The `prebuild` script fetches the current `oh-my-codex` version from upstream and writes it to `src/lib/version.ts`.

## Content

All MDX lives under `content/docs/`. Each page ships in four languages using the `.mdx`, `.ko.mdx`, `.zh.mdx`, `.ja.mdx` suffix convention. Sidebars are defined by `meta.json` files with matching `meta.{ko,zh,ja}.json` siblings.

## Build

```bash
npm run build
```
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs(docs-site): add repo README"
```

---

## Phase 7 — Validation

### Task 21: Full production build

- [ ] **Step 1: Run production build**

```bash
cd /home/devswha/workspace/oh-my-codex-docs
npm run build 2>&1 | tee /tmp/omx-build.log | tail -60
```
Expected: `Compiled successfully`, route map printed, no TypeScript errors.

- [ ] **Step 2: Inspect the emitted route map**

```bash
grep -E "^(●|○|λ)" /tmp/omx-build.log | head -80
```
Expected: routes include `/`, `/ko`, `/zh`, `/ja`, `/docs/...` variants across all 4 locales, and each of the 33 agent pages and 37 skill pages per locale.

- [ ] **Step 3: Commit the lockfile if dirty**

```bash
git status --short
# If package-lock.json changed, commit it.
git add package-lock.json 2>/dev/null || true
git diff --cached --quiet || git commit -m "chore(docs-site): refresh package-lock after build"
```

---

### Task 22: Smoke test routes locally

- [ ] **Step 1: Start prod server in background**

```bash
cd /home/devswha/workspace/oh-my-codex-docs
(npm run start &)
sleep 4
```

- [ ] **Step 2: Hit one route per locale**

```bash
for base in "" "/ko" "/zh" "/ja"; do
  for path in "" "/docs" "/docs/agents" "/docs/skills" "/docs/hooks" "/docs/integrations"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${base}${path}")
    echo "${code}  ${base}${path}"
  done
done
```
Expected: every line starts with `200`.

- [ ] **Step 3: Stop the server**

```bash
pkill -f "next start" || true
```

- [ ] **Step 4: No commit** (read-only verification).

---

### Task 23: Grep gate for OMC leakage

- [ ] **Step 1: Run the leakage check**

```bash
cd /home/devswha/workspace/oh-my-codex-docs
grep -rIn -E "claude-code|oh-my-claudecode|\\.omc/|\\bomc-setup\\b|\\bOMC\\b|Claude Code" content/docs/ || echo OK
```
Expected: `OK`, or only matches inside sections explicitly labelled as comparison.

- [ ] **Step 2: If matches appear, fix them**

For each match, edit the MDX and replace with the corresponding OMX term from spec §6.2. Re-run the grep.

- [ ] **Step 3: Commit fixes**

If any files changed:
```bash
git add content/docs
git commit -m "docs(docs-site): scrub stray OMC references"
```

---

### Task 24: Landing count sanity check

- [ ] **Step 1: Agent sidebar count matches landing copy**

```bash
find content/docs/agents -name "*.mdx" ! -name "index*" | awk -F. 'NF==3{print $1}' | sort -u | wc -l
```
Expected: `33`.

- [ ] **Step 2: Skill sidebar count matches landing copy**

```bash
find content/docs/skills -name "*.mdx" ! -name "index*" | awk -F. 'NF==3{print $1}' | sort -u | wc -l
```
Expected: `37`.

- [ ] **Step 3: Landing copy assertions**

```bash
grep -E "33 agent prompts|33 Specialized|33개 전문|33 个专业|33 個の専門" "src/app/[lang]/page.tsx" | wc -l
grep -E "37 skills|37 Automation|37개 자동화|37 个自动化|37 個の自動化" "src/app/[lang]/page.tsx" | wc -l
```
Expected: both return `≥ 4` (each language restates the claim).

- [ ] **Step 4: If counts diverge, fail the task and fix before continuing.**

---

### Task 25: Version badge sanity check

- [ ] **Step 1: Re-run injector and confirm version.ts content**

```bash
node scripts/inject-omx-version.mjs
cat src/lib/version.ts
```
Expected: `export const OMX_VERSION = "0.13.2";` (or whatever the upstream currently reports).

- [ ] **Step 2: Confirm docs layout renders the value**

```bash
grep -n OMX_VERSION "src/app/[lang]/docs/layout.tsx"
```
Expected: two matches — an `import` and a usage line rendering `v{OMX_VERSION}`.

- [ ] **Step 3: No commit needed** unless `version.ts` changed — if so:
```bash
git add src/lib/version.ts && git commit -m "chore(docs-site): refresh OMX_VERSION"
```

---

## Phase 8 — Deployment

### Task 26: Wire up Vercel project

- [ ] **Step 1: Login and link** (operator runs these interactively)

```bash
cd /home/devswha/workspace/oh-my-codex-docs
npx vercel@latest login
npx vercel@latest link
```

Accept prompts: framework = Next.js, root = `.`.

- [ ] **Step 2: Initial deploy to preview**

```bash
npx vercel@latest
```
Expected: preview URL printed (e.g., `https://oh-my-codex-docs-<hash>.vercel.app`).

- [ ] **Step 3: Visit preview URL and manually confirm**:
  - Landing loads in all four locales (`/`, `/ko`, `/zh`, `/ja`).
  - Sidebar renders 33 agents + 37 skills.
  - Version badge shows `v0.13.2` (or current upstream).
  - Search works for a query in each language.

- [ ] **Step 4: Deploy production**

```bash
npx vercel@latest --prod
```

- [ ] **Step 5: Commit `.vercel/project.json`**

```bash
git add .vercel/project.json
git commit -m "chore(docs-site): link vercel project"
```

Note: `.vercel/` is in `.gitignore`. Explicitly force-add only `project.json` (the harmless link reference); keep `.vercel/output/` etc. ignored:
```bash
git add -f .vercel/project.json
```

---

### Task 27: Bind domain `omx.vibetip.help`

- [ ] **Step 1: Add domain in Vercel**

```bash
npx vercel@latest domains add omx.vibetip.help
```

- [ ] **Step 2: Operator DNS change** (outside repo)

Point `omx.vibetip.help` CNAME to `cname.vercel-dns.com` (or value Vercel prints). This is a manual registrar task — do not attempt from code.

- [ ] **Step 3: Verify domain propagation**

```bash
dig +short omx.vibetip.help
curl -sI https://omx.vibetip.help | head -1
```
Expected: resolves to Vercel; HTTPS returns `200 OK` or `308` redirect.

---

## Phase 9 — Final Audit

### Task 28: Lighthouse pass

- [ ] **Step 1: Run Lighthouse against the deployed site**

```bash
npx lighthouse https://omx.vibetip.help --preset=desktop --output=json --output-path=/tmp/lh.json --chrome-flags="--headless=new"
```

- [ ] **Step 2: Assert scores ≥ thresholds** (spec §8)

```bash
node -e "const d=require('/tmp/lh.json'); const s=d.categories; const perf=Math.round(s.performance.score*100); const a11y=Math.round(s.accessibility.score*100); console.log('perf',perf,'a11y',a11y); if(perf<90||a11y<95){process.exit(1)}"
```
Expected: prints `perf <N> a11y <M>` with Perf ≥ 90 and Accessibility ≥ 95.

- [ ] **Step 3: If below threshold, file a follow-up item (do not fail the plan)**

Document in `docs/superpowers/plans/` as a follow-up the specific category that missed threshold. This plan is for launch; perf tuning is a Phase 2 concern.

---

### Task 29: Final spec acceptance walkthrough

Run through each item of spec §8 explicitly and paste evidence in commit message:

- [ ] `npm run build` passes (Task 21).
- [ ] Routes 200 across locales (Task 22).
- [ ] Sidebar counts 33 / 37 (Task 24 steps 1–2).
- [ ] Landing copy shows 33 / 37 in all languages (Task 24 step 3).
- [ ] Version badge reflects upstream (Task 25).
- [ ] Search responds in each language (Task 26 step 3 manual check).
- [ ] Grep gate clean (Task 23).
- [ ] Install flow uses `@openai/codex` + `oh-my-codex` (confirmed by `grep "@openai/codex" "src/app/[lang]/page.tsx" content/docs/getting-started` returning matches and no `/plugin` references).

- [ ] **Step 1: Run final combined check**

```bash
{
  echo "=== grep gate ==="
  grep -rIn -E "claude-code|oh-my-claudecode|\\.omc/|\\bOMC\\b|Claude Code" content/docs/ || echo OK
  echo "=== agent count ==="
  find content/docs/agents -name "*.mdx" ! -name "index*" | awk -F. 'NF==3{print $1}' | sort -u | wc -l
  echo "=== skill count ==="
  find content/docs/skills -name "*.mdx" ! -name "index*" | awk -F. 'NF==3{print $1}' | sort -u | wc -l
  echo "=== forbidden plugin wording ==="
  grep -rIn "/plugin marketplace" content/docs "src/app" || echo OK
} | tee /tmp/omx-acceptance.log
```
Expected: `OK` for both grep checks, `33` for agents, `37` for skills.

- [ ] **Step 2: Commit the acceptance evidence**

```bash
cp /tmp/omx-acceptance.log docs/superpowers/
git add docs/superpowers/omx-acceptance.log
git commit -m "docs(docs-site): record launch acceptance evidence"
```

---

### Task 30: Announce and close

- [ ] **Step 1: Verify nothing pending**

```bash
git status --short
```
Expected: empty.

- [ ] **Step 2: Print summary line for the user**

Output (not a commit; just stdout):
```
OMX docs site live: https://omx.vibetip.help
  Agents: 33 pages × 4 langs
  Skills: 37 pages × 4 langs
  Version badge: OMX v<current>
```

- [ ] **Step 3: Mark the top-level task complete** in the calling task system, if any.

---

## Self-Review (Plan vs. Spec)

Skimming spec sections against tasks:

- Spec §3 (Architecture) — Tasks 1–8, 11 cover scaffolding, configs, ports.
- Spec §4 (Content Inventory) — Tasks 14–18 cover root/index, getting-started/concepts/guides, hooks/tools/integrations/reference, agents × 33 × 4, skills × 37 × 4.
- Spec §5 (Landing Page) — Tasks 12–13 cover full JSX + 4 translations.
- Spec §5.8 (Version badge) — Tasks 9–10 + Task 25 verify.
- Spec §6 (i18n) — all `*.ko.mdx`, `*.zh.mdx`, `*.ja.mdx` produced by scaffolders in Tasks 15–18; middleware and i18n config in Task 4. Term-replacement grep gate in Task 23.
- Spec §7 (Deployment) — Tasks 26–27 cover Vercel link, deploy, domain bind.
- Spec §8 (Acceptance) — Tasks 21–25, 28–29 map 1:1.
- Spec §9 (Out of Scope) — respected: no upstream PR, no body-rewrite beyond stubs.
- Spec §10 (Risks) — grep gate (23), catalog sanity (17/18 hard-fail on wrong totals), fallback logic in injector (9), domain operator task called out (27).
- Spec §11 (Follow-up) — not implemented here by design.

Placeholder scan: no `TBD`, `implement later`, or bare "add X" steps — each task carries exact code, commands, and expected output. Generator scripts contain full working source.

Type consistency: `OMX_VERSION` imported in Task 10 matches the export generated in Task 9. Agent/skill lane slugs used in Task 17/18 align with the `AGENTS` landing constant in Task 12. Route paths used in Task 22 match the structure emitted by `next build`.

---

## Execution Options

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task with two-stage review in between. Best for this plan because each task produces a clean commit and benefits from an independent review pass.

**2. Inline Execution** — run all tasks in this session with checkpoints. Faster, less review coverage; fine if the operator will review the final diff manually.
