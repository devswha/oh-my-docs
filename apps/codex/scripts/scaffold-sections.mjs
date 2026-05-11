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
