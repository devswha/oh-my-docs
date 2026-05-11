import Link from 'next/link';
import { JetBrains_Mono } from 'next/font/google';
import Image from 'next/image';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { CopyInstallCommand } from '@/components/copy-install';
import { i18n } from '@/lib/i18n';
import type { Metadata } from 'next';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-hero',
});

const AGENTS = {
  'Build & Analysis': [
    'explore', 'analyst', 'planner', 'architect',
    'executor', 'debugger', 'verifier', 'explore-harness',
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

const translations = {
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
} as const;

type Lang = keyof typeof translations;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = translations[lang as Lang] ?? translations.en;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = translations[lang as Lang] ?? translations.en;
  const lp = lang === i18n.defaultLanguage ? '' : `/${lang}`;

  return (
    <HomeLayout
      nav={{
        title: (
          <span className="inline-flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="OMX"
              width={28}
              height={28}
              priority
              className="shrink-0"
              style={{ imageRendering: 'pixelated' }}
            />
            Oh My CodeX
          </span>
        ),
        url: lp || '/',
        transparentMode: 'top' as const,
      }}
      i18n={i18n}
      githubUrl="https://github.com/Yeachan-Heo/oh-my-codex"
      links={[{ text: 'Docs', url: `${lp}/docs` }]}
    >
      {/* ── Hero ── */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 py-28 text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-grid absolute inset-0 opacity-[0.03] dark:opacity-[0.04]" />
        </div>

        <p className="mb-4 text-sm font-medium tracking-widest uppercase text-fd-muted-foreground">
          {t.heroSubtitle}
        </p>

        <h1
          className={`hero-title text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl ${jetbrainsMono.className}`}
        >
          Oh My
          <br />
          CodeX
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-fd-muted-foreground sm:text-xl">
          {t.heroDesc[0]}
          <br className="hidden sm:block" />
          {t.heroDesc[1]}
        </p>

        <CopyInstallCommand />

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`${lp}/docs/getting-started`}
            className="inline-flex h-11 items-center rounded-lg bg-fd-primary px-6 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            {t.getStarted}
          </Link>
          <Link
            href={`${lp}/docs`}
            className="inline-flex h-11 items-center rounded-lg border border-fd-border bg-fd-background px-6 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
          >
            {t.viewDocs}
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-fd-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            {t.whatsDifferent}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-fd-muted-foreground">
            {t.whatsDifferentDesc}
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {t.features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-fd-border bg-fd-card/50 p-8 transition-colors hover:bg-fd-card"
              >
                <span className="mb-4 inline-block rounded-md bg-fd-primary/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-fd-primary dark:bg-fd-primary/5">
                  {feature.tag}
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="border-t border-fd-border bg-fd-card/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            {t.pipelineTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-fd-muted-foreground">
            {t.pipelineDesc}
          </p>

          {/* Desktop: horizontal flow */}
          <div className="mt-16 hidden md:block">
            <div className="relative flex items-start justify-between">
              <div className="absolute left-[calc(theme(spacing.8))] right-[calc(theme(spacing.8))] top-8 h-px bg-fd-border" />
              {t.pipelineSteps.map((step, i) => (
                <div
                  key={step.label}
                  className="relative flex flex-col items-center"
                  style={{ width: `${100 / t.pipelineSteps.length}%` }}
                >
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-fd-border bg-fd-background text-sm font-bold transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <span className="mt-3 text-sm font-semibold">
                    {step.label}
                  </span>
                  <span className="mt-1 text-xs text-fd-muted-foreground">
                    {step.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="mt-12 md:hidden">
            <div className="relative ml-8 border-l border-fd-border pl-8">
              {t.pipelineSteps.map((step, i) => (
                <div key={step.label} className="relative pb-8 last:pb-0">
                  <div className="absolute -left-[calc(theme(spacing.8)+theme(spacing.4)+1px)] flex h-8 w-8 items-center justify-center rounded-full border border-fd-border bg-fd-background text-xs font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <span className="text-sm font-semibold">{step.label}</span>
                    <span className="ml-2 text-xs text-fd-muted-foreground">
                      {step.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Agents ── */}
      <section className="border-t border-fd-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            {t.agentsTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-fd-muted-foreground">
            {t.agentsDesc}
          </p>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {Object.entries(AGENTS).map(([lane, agents]) => (
              <div
                key={lane}
                className="rounded-xl border border-fd-border p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-base font-semibold">{lane}</h3>
                  <span className="rounded-full bg-fd-muted px-2 py-0.5 text-xs text-fd-muted-foreground">
                    {agents.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agents.map((agent) => (
                    <span
                      key={agent}
                      className="inline-block rounded-md bg-fd-muted px-2.5 py-1 font-mono text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={`${lp}/docs/agents`}
              className="text-sm font-medium text-fd-muted-foreground underline decoration-fd-border underline-offset-4 transition-colors hover:text-fd-foreground"
            >
              {t.viewAllAgents}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section className="border-t border-fd-border bg-fd-card/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            {t.skillsTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-fd-muted-foreground">
            {t.skillsDesc}
          </p>

          <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border sm:grid-cols-2">
            {t.skills.map((skill) => (
              <div
                key={skill.name}
                className="flex flex-col gap-2 bg-fd-background p-8"
              >
                <code className="w-fit rounded-md bg-fd-muted px-2.5 py-1 font-mono text-sm font-semibold">
                  {`$${skill.name}`}
                </code>
                <p className="text-sm text-fd-muted-foreground">{skill.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={`${lp}/docs/skills`}
              className="text-sm font-medium text-fd-muted-foreground underline decoration-fd-border underline-offset-4 transition-colors hover:text-fd-foreground"
            >
              {t.viewAllSkills}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Get Started ── */}
      <section className="border-t border-fd-border px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t.stepsTitle}
          </h2>

          <div className="mx-auto mt-16 grid max-w-xl gap-8 text-left">
            {t.steps.map((item) => (
              <div key={item.step} className="flex gap-6">
                <span className="flex-none font-mono text-3xl font-bold text-fd-muted-foreground/40">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-fd-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={`${lp}/docs/getting-started`}
            className="mt-12 inline-flex h-11 items-center rounded-lg bg-fd-primary px-8 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            {t.getStarted}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-fd-border px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm text-fd-muted-foreground">
            Oh My CodeX
          </span>
          <div className="flex gap-6">
            <Link
              href={`${lp}/docs`}
              className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              Docs
            </Link>
            <a
              href="https://github.com/Yeachan-Heo/oh-my-codex"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </HomeLayout>
  );
}
