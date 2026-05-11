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

const esc = (s) => s.replace(/"/g, '\\"');

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
    const idxName = lang === 'en' ? 'index.mdx' : `index.${lang}.mdx`;
    const sectionIntros = {
      hooks: {
        en: 'Hooks that plug into Codex CLI lifecycle events. Five subtopics: lifecycle events, core hooks, context hooks, magic keywords, and Codex-native hooks.',
        ko: 'Codex CLI 생명주기 이벤트에 연결되는 훅들. 5가지 주제: 생명주기 이벤트, 코어 훅, 컨텍스트 훅, 매직 키워드, Codex 네이티브 훅.',
        zh: '接入 Codex CLI 生命周期事件的钩子。五个子主题：生命周期事件、核心钩子、上下文钩子、魔法关键词、Codex 原生钩子。',
        ja: 'Codex CLI のライフサイクルイベントに接続するフック。5 つのサブトピック：ライフサイクルイベント、コアフック、コンテキストフック、マジックキーワード、Codex ネイティブフック。',
      },
      tools: {
        en: 'OMX tools available to skills and hooks: state, HUD, wiki, catalog, visual verdict, ask-claude, ask-gemini.',
        ko: '스킬과 훅에서 사용 가능한 OMX 도구: state, HUD, wiki, catalog, visual verdict, ask-claude, ask-gemini.',
        zh: '供技能和钩子使用的 OMX 工具：state、HUD、wiki、catalog、visual verdict、ask-claude、ask-gemini。',
        ja: 'スキルとフックから利用できる OMX ツール：state、HUD、wiki、catalog、visual verdict、ask-claude、ask-gemini。',
      },
      integrations: {
        en: 'OMX integrations with external ecosystems: OpenClaw (Codex↔Claude bridge), Clawhip event contract, MCP servers, and CLI bridges.',
        ko: '외부 생태계와의 OMX 통합: OpenClaw (Codex↔Claude 브릿지), Clawhip 이벤트 계약, MCP 서버, CLI 브릿지.',
        zh: 'OMX 与外部生态系统的集成：OpenClaw（Codex↔Claude 桥）、Clawhip 事件契约、MCP 服务器、CLI 桥。',
        ja: '外部エコシステムとの OMX 統合：OpenClaw (Codex↔Claude ブリッジ)、Clawhip イベントコントラクト、MCP サーバー、CLI ブリッジ。',
      },
      reference: {
        en: 'OMX reference: configuration, environment, migration, changelog, quick commands, CJK IME, contracts, and the .omx directory layout.',
        ko: 'OMX 레퍼런스: 설정, 환경 변수, 마이그레이션, 변경 로그, 퀵 커맨드, CJK IME, 계약, .omx 디렉터리 구조.',
        zh: 'OMX 参考：配置、环境变量、迁移、更新日志、快速命令、CJK IME、契约、.omx 目录结构。',
        ja: 'OMX リファレンス：設定、環境変数、マイグレーション、チェンジログ、クイックコマンド、CJK IME、コントラクト、.omx ディレクトリ構造。',
      },
    };
    const intro = sectionIntros[s.slug][lang];
    writeFileSync(
      join(dir, idxName),
      `---\ntitle: "${esc(s.titles[lang])}"\ndescription: "${esc(intro)}"\n---\n\n${intro}\n`,
      'utf8',
    );
    for (const p of s.pages) {
      const mdxName = lang === 'en' ? `${p.slug}.mdx` : `${p.slug}.${lang}.mdx`;
      const suffix = lang === 'en' ? '' : TRANSLATIONS[lang].pageSuffix;
      writeFileSync(
        join(dir, mdxName),
        `---\ntitle: "${esc(p.title + suffix)}"\ndescription: "${esc(p.body)}"\n---\n\n${p.body}\n`,
        'utf8',
      );
    }
  }
}

console.log(
  `[scaffold-flat-sections] wrote ${SECTIONS.length} sections, ${SECTIONS.reduce((a, s) => a + s.pages.length, 0)} pages × ${LANGS.length} langs`,
);
