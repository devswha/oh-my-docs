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
