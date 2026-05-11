import Link from 'next/link';
import Image from 'next/image';
import { JetBrains_Mono } from 'next/font/google';
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
    'debugger', 'executor', 'verifier', 'tracer',
  ],
  Review: ['code-reviewer', 'security-reviewer'],
  Domain: [
    'test-engineer', 'designer', 'writer',
    'qa-tester', 'scientist', 'document-specialist',
    'git-master', 'code-simplifier',
  ],
  Coordination: ['critic'],
};

const translations = {
  en: {
    heroSubtitle: 'Multi-Agent Orchestration for Claude Code',
    heroDesc: [
      'A multi-agent orchestration layer for Claude Code.',
      '19 agents and 37 skills working together.',
    ],
    metaTitle: 'Oh My ClaudeCode — Multi-Agent Orchestration for Claude Code',
    metaDescription:
      'Official documentation for oh-my-claudecode, a multi-agent orchestration layer for Claude Code.',
    getStarted: 'Get Started',
    viewDocs: 'View Docs',
    whatsDifferent: "What's Different?",
    whatsDifferentDesc:
      'A specialized agent layer that runs on top of Claude Code.',
    features: [
      {
        title: '19 Specialized Agents',
        desc: 'Agents dedicated to each role from exploration, planning, implementation, to verification and review.',
        tag: 'Agents',
      },
      {
        title: '37 Automation Skills',
        desc: 'autopilot, ralph, ultrawork — complex pipelines run with a single command.',
        tag: 'Skills',
      },
      {
        title: 'Team Orchestration',
        desc: 'Spawn multiple Claude agents simultaneously, distribute work, and merge results.',
        tag: 'Teams',
      },
      {
        title: 'Magic Keywords',
        desc: '"autopilot build me X" — start pipelines with natural language. No commands to memorize.',
        tag: 'Keywords',
      },
    ],
    pipelineTitle: 'autopilot Pipeline',
    pipelineDesc:
      'From a single idea, analysis, design, planning, execution, QA, and verification all run automatically.',
    pipelineSteps: [
      { label: 'Idea', role: 'User' },
      { label: 'Analysis', role: 'Analyst' },
      { label: 'Design', role: 'Architect' },
      { label: 'Planning', role: 'Planner' },
      { label: 'Execution', role: 'Executor' },
      { label: 'QA', role: 'UltraQA' },
      { label: 'Validation', role: 'Verifier' },
    ],
    agentsTitle: 'Specialized Agents',
    agentsDesc: '4 lanes, 19 agents. Each optimized for its role.',
    viewAllAgents: 'View all agents',
    skillsTitle: 'Key Skills',
    skillsDesc: 'Execute complex workflows with a single word.',
    skills: [
      { name: 'autopilot', desc: 'Autonomous execution from idea to working code.' },
      { name: 'ralph', desc: 'Execution loop that never stops until complete.' },
      { name: 'team', desc: 'N agents working simultaneously.' },
      { name: 'ralplan', desc: 'Iterative planning until consensus is reached.' },
    ],
    viewAllSkills: 'View all skills',
    stepsTitle: 'Get Started in 3 Steps',
    steps: [
      {
        step: '01',
        title: 'Install Plugin',
        desc: 'Install the oh-my-claudecode plugin in Claude Code.',
      },
      {
        step: '02',
        title: 'Run omc-setup',
        desc: 'Type "setup omc" to automatically configure your environment.',
      },
      {
        step: '03',
        title: 'Start autopilot',
        desc: 'Type "autopilot build me X" and agents will start working.',
      },
    ],
  },
  ko: {
    heroSubtitle: 'Claude Code를 위한 멀티 에이전트 오케스트레이션',
    heroDesc: [
      'Claude Code를 위한 멀티 에이전트 오케스트레이션 레이어.',
      '19개 에이전트와 37개 스킬이 협업합니다.',
    ],
    metaTitle: 'Oh My ClaudeCode — Claude Code 멀티 에이전트 오케스트레이션',
    metaDescription:
      'oh-my-claudecode 공식 문서. Claude Code를 위한 멀티 에이전트 오케스트레이션 플러그인.',
    getStarted: '시작하기',
    viewDocs: '문서 보기',
    whatsDifferent: '무엇이 다른가요?',
    whatsDifferentDesc:
      'Claude Code 위에서 동작하는 전문 에이전트 레이어입니다.',
    features: [
      {
        title: '19개 전문 에이전트',
        desc: '탐색, 계획, 구현, 검증, 리뷰까지 각 역할에 특화된 에이전트가 분담합니다.',
        tag: 'Agents',
      },
      {
        title: '37개 자동화 스킬',
        desc: 'autopilot, ralph, ultrawork -- 한 마디면 복잡한 파이프라인이 실행됩니다.',
        tag: 'Skills',
      },
      {
        title: '팀 오케스트레이션',
        desc: '여러 Claude 에이전트를 동시에 생성하고, 작업을 분배하고, 결과를 합칩니다.',
        tag: 'Teams',
      },
      {
        title: '매직 키워드',
        desc: '"autopilot build me X" -- 자연어로 파이프라인을 시작합니다. 명령어를 외울 필요가 없습니다.',
        tag: 'Keywords',
      },
    ],
    pipelineTitle: 'autopilot 파이프라인',
    pipelineDesc:
      '아이디어 하나로 분석, 설계, 계획, 실행, QA, 검증까지 자동으로 진행됩니다.',
    pipelineSteps: [
      { label: '아이디어', role: 'User' },
      { label: '분석', role: 'Analyst' },
      { label: '설계', role: 'Architect' },
      { label: '계획', role: 'Planner' },
      { label: '실행', role: 'Executor' },
      { label: 'QA', role: 'UltraQA' },
      { label: '검증', role: 'Verifier' },
    ],
    agentsTitle: '전문 에이전트',
    agentsDesc: '4개 레인, 19개 에이전트. 각자의 역할에 최적화되어 있습니다.',
    viewAllAgents: '전체 에이전트 보기',
    skillsTitle: '주요 스킬',
    skillsDesc: '복잡한 워크플로우를 한 단어로 실행합니다.',
    skills: [
      { name: 'autopilot', desc: '아이디어에서 코드까지, 자율 실행합니다.' },
      { name: 'ralph', desc: '완료될 때까지 멈추지 않는 실행 루프입니다.' },
      { name: 'team', desc: 'N개 에이전트가 동시에 작업합니다.' },
      { name: 'ralplan', desc: '합의에 도달할 때까지 반복하는 계획입니다.' },
    ],
    viewAllSkills: '전체 스킬 보기',
    stepsTitle: '3단계로 시작합니다',
    steps: [
      {
        step: '01',
        title: 'Plugin 설치',
        desc: 'Claude Code에 oh-my-claudecode 플러그인을 설치합니다.',
      },
      {
        step: '02',
        title: 'omc-setup 실행',
        desc: '"setup omc"를 입력하면 자동으로 환경이 구성됩니다.',
      },
      {
        step: '03',
        title: 'autopilot 시작',
        desc: '"autopilot build me X"를 입력하면 에이전트들이 일을 시작합니다.',
      },
    ],
  },
  zh: {
    heroSubtitle: 'Claude Code 的多智能体编排系统',
    heroDesc: [
      'Claude Code 的多智能体编排层。',
      '19 个智能体和 37 个技能协同工作。',
    ],
    metaTitle: 'Oh My ClaudeCode — Claude Code 多智能体编排',
    metaDescription:
      'oh-my-claudecode 官方文档。Claude Code 的多智能体编排插件。',
    getStarted: '开始使用',
    viewDocs: '查看文档',
    whatsDifferent: '有何不同？',
    whatsDifferentDesc:
      '运行在 Claude Code 之上的专业智能体层。',
    features: [
      {
        title: '19 个专业智能体',
        desc: '从探索、规划、实施到验证与审核，每个角色都由专门的智能体负责。',
        tag: 'Agents',
      },
      {
        title: '37 个自动化技能',
        desc: 'autopilot、ralph、ultrawork -- 一句话运行复杂流水线。',
        tag: 'Skills',
      },
      {
        title: '团队编排',
        desc: '同时启动多个 Claude 智能体，分发任务并合并结果。',
        tag: 'Teams',
      },
      {
        title: '魔法关键词',
        desc: '"autopilot build me X" -- 用自然语言启动流水线。无需记忆命令。',
        tag: 'Keywords',
      },
    ],
    pipelineTitle: 'autopilot 流水线',
    pipelineDesc:
      '从一个想法出发，分析、设计、规划、执行、QA、验证全程自动化。',
    pipelineSteps: [
      { label: '想法', role: 'User' },
      { label: '分析', role: 'Analyst' },
      { label: '设计', role: 'Architect' },
      { label: '规划', role: 'Planner' },
      { label: '执行', role: 'Executor' },
      { label: 'QA', role: 'UltraQA' },
      { label: '验证', role: 'Verifier' },
    ],
    agentsTitle: '专业智能体',
    agentsDesc: '4 条通路，19 个智能体。各自针对角色优化。',
    viewAllAgents: '查看全部智能体',
    skillsTitle: '核心技能',
    skillsDesc: '用一个词执行复杂工作流。',
    skills: [
      { name: 'autopilot', desc: '从想法到代码的自主执行。' },
      { name: 'ralph', desc: '不完成不停止的执行循环。' },
      { name: 'team', desc: 'N 个智能体同时工作。' },
      { name: 'ralplan', desc: '迭代规划直至达成共识。' },
    ],
    viewAllSkills: '查看全部技能',
    stepsTitle: '三步开始使用',
    steps: [
      {
        step: '01',
        title: '安装插件',
        desc: '在 Claude Code 中安装 oh-my-claudecode 插件。',
      },
      {
        step: '02',
        title: '运行 omc-setup',
        desc: '输入 "setup omc"，环境将自动完成配置。',
      },
      {
        step: '03',
        title: '启动 autopilot',
        desc: '输入 "autopilot build me X"，智能体就会开始工作。',
      },
    ],
  },
  ja: {
    heroSubtitle: 'Claude Code のためのマルチエージェント・オーケストレーション',
    heroDesc: [
      'Claude Code のためのマルチエージェント・オーケストレーションレイヤー。',
      '19 個のエージェントと 37 個のスキルが協調して動作します。',
    ],
    metaTitle: 'Oh My ClaudeCode — Claude Code のマルチエージェント・オーケストレーション',
    metaDescription:
      'oh-my-claudecode の公式ドキュメント。Claude Code のためのマルチエージェント・オーケストレーションプラグイン。',
    getStarted: 'はじめる',
    viewDocs: 'ドキュメントを見る',
    whatsDifferent: '何が違うのか？',
    whatsDifferentDesc:
      'Claude Code の上で動作する専門エージェントレイヤーです。',
    features: [
      {
        title: '19 個の専門エージェント',
        desc: '探索、計画、実装、検証、レビューまで、各役割に特化したエージェントが分担します。',
        tag: 'Agents',
      },
      {
        title: '37 個の自動化スキル',
        desc: 'autopilot、ralph、ultrawork -- 一言で複雑なパイプラインを実行します。',
        tag: 'Skills',
      },
      {
        title: 'チームオーケストレーション',
        desc: '複数の Claude エージェントを同時に起動し、タスクを分配して結果をまとめます。',
        tag: 'Teams',
      },
      {
        title: 'マジックキーワード',
        desc: '"autopilot build me X" -- 自然言語でパイプラインを開始します。コマンドを覚える必要はありません。',
        tag: 'Keywords',
      },
    ],
    pipelineTitle: 'autopilot パイプライン',
    pipelineDesc:
      '一つのアイデアから、分析・設計・計画・実行・QA・検証までが自動で進行します。',
    pipelineSteps: [
      { label: 'アイデア', role: 'User' },
      { label: '分析', role: 'Analyst' },
      { label: '設計', role: 'Architect' },
      { label: '計画', role: 'Planner' },
      { label: '実行', role: 'Executor' },
      { label: 'QA', role: 'UltraQA' },
      { label: '検証', role: 'Verifier' },
    ],
    agentsTitle: '専門エージェント',
    agentsDesc: '4 レーン、19 エージェント。それぞれの役割に最適化されています。',
    viewAllAgents: 'すべてのエージェントを見る',
    skillsTitle: '主要スキル',
    skillsDesc: '一言で複雑なワークフローを実行します。',
    skills: [
      { name: 'autopilot', desc: 'アイデアから動くコードまでの自律実行。' },
      { name: 'ralph', desc: '完了するまで止まらない実行ループ。' },
      { name: 'team', desc: 'N 個のエージェントが同時に作業します。' },
      { name: 'ralplan', desc: '合意に達するまで繰り返す計画。' },
    ],
    viewAllSkills: 'すべてのスキルを見る',
    stepsTitle: '3 ステップではじめる',
    steps: [
      {
        step: '01',
        title: 'プラグインをインストール',
        desc: 'Claude Code に oh-my-claudecode プラグインをインストールします。',
      },
      {
        step: '02',
        title: 'omc-setup を実行',
        desc: '"setup omc" と入力すると、環境が自動で構成されます。',
      },
      {
        step: '03',
        title: 'autopilot を起動',
        desc: '"autopilot build me X" と入力すれば、エージェントが動き始めます。',
      },
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
              alt="OMC"
              width={28}
              height={26}
              priority
              className="shrink-0"
            />
            Oh My ClaudeCode
          </span>
        ),
        url: lp || '/',
        transparentMode: 'top' as const,
      }}
      i18n={i18n}
      githubUrl="https://github.com/Yeachan-Heo/oh-my-claudecode"
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
          ClaudeCode
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
                  /{skill.name}
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
            Oh My ClaudeCode
          </span>
          <div className="flex gap-6">
            <Link
              href={`${lp}/docs`}
              className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              Docs
            </Link>
            <a
              href="https://github.com/Yeachan-Heo/oh-my-claudecode"
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
