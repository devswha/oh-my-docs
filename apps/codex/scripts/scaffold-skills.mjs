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
