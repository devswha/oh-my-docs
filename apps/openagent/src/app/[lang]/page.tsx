import Link from 'next/link';
import Image from 'next/image';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { CopyInstallCommand } from '@/components/copy-install';
import { i18n } from '@/lib/i18n';
import type { Metadata } from 'next';

type Lang = 'en' | 'ko' | 'zh' | 'ja';

const translations = {
  en: {
    metaTitle: 'Oh My OpenAgent - Multi-Model Orchestration for OpenCode',
    metaDescription: 'Official docs for Oh My OpenAgent, a batteries-included OpenCode plugin for multi-model agent orchestration.',
    subtitle: 'Multi-Model Orchestration for OpenCode',
    desc: ['A batteries-included OpenCode harness.', 'Sisyphus plans, specialists execute, tools verify.'],
    getStarted: 'Get Started', docs: 'View Docs', different: 'What OmO Adds',
    features: [
      ['Discipline Agents', 'Sisyphus, Hephaestus, Prometheus, Atlas, Oracle, Librarian, Explore, Metis, Momus, and Sisyphus-Junior each have a job.'],
      ['Ultrawork', 'Type ultrawork or ulw. The system explores, delegates, implements, verifies, and keeps going until the work is done.'],
      ['Category Routing', 'Delegate by work type: visual-engineering, ultrabrain, deep, quick, writing, and more. The harness picks the model.'],
      ['Agent-Grade Tools', 'LSP diagnostics, AST-grep, background agents, tmux, MCP search, hashline edits, and browser/multimodal surfaces.'],
    ],
    pipeline: 'The Working Loop', pipelineDesc: 'A request is classified, routed, delegated, checked, and driven through the surface.',
    steps: [['Intent Gate', 'Read the real intent'], ['Sisyphus', 'Plan and delegate'], ['Specialists', 'Research and implement'], ['Verification', 'Diagnostics, build, tests, QA']],
    agents: 'Core Agents', agentsDesc: 'A coordinated development team inside OpenCode.',
    skills: 'Start in 3 Steps', install: 'Install command', stepList: [['01', 'Install OpenCode', 'Install and authenticate OpenCode first.'], ['02', 'Install OmO', 'Run bunx oh-my-openagent install and follow provider prompts.'], ['03', 'Work', 'Run bunx oh-my-openagent doctor, then type ultrawork.']],
  },
  ko: {
    metaTitle: 'Oh My OpenAgent - OpenCode 멀티 모델 오케스트레이션',
    metaDescription: 'Oh My OpenAgent 공식 문서. OpenCode에 멀티 모델 에이전트 오케스트레이션을 얹는 플러그인입니다.',
    subtitle: 'OpenCode를 위한 멀티 모델 오케스트레이션',
    desc: ['설치하면 바로 OpenCode에서 팀처럼 움직입니다.', 'Sisyphus가 계획하고, 전문가가 실행하고, 도구가 확인합니다.'],
    getStarted: '시작하기', docs: '문서 보기', different: 'OmO가 더하는 것',
    features: [
      ['기강 잡힌 에이전트', 'Sisyphus, Hephaestus, Prometheus, Atlas, Oracle, Librarian, Explore, Metis, Momus, Sisyphus-Junior가 각자 맡은 일을 합니다.'],
      ['ultrawork', 'ultrawork 또는 ulw만 입력하세요. 탐색, 위임, 구현, 검증을 끝날 때까지 이어갑니다.'],
      ['카테고리 라우팅', 'visual-engineering, ultrabrain, deep, quick, writing처럼 작업 종류를 고르면 OmO가 모델을 고릅니다.'],
      ['에이전트용 도구', 'LSP 진단, AST-grep, background agent, tmux, MCP 검색, hashline edit, browser QA를 묶어 씁니다.'],
    ],
    pipeline: '작동 흐름', pipelineDesc: '요청을 분류하고, 라우팅하고, 위임한 뒤 실제 표면에서 확인합니다.',
    steps: [['Intent Gate', '진짜 의도 파악'], ['Sisyphus', '계획과 위임'], ['전문가', '리서치와 구현'], ['검증', '진단, 빌드, 테스트, QA']],
    agents: '핵심 에이전트', agentsDesc: 'OpenCode 안에 들어온 작은 개발팀입니다.',
    skills: '3단계로 시작', install: '설치 명령', stepList: [['01', 'OpenCode 설치', '먼저 OpenCode를 설치하고 인증합니다.'], ['02', 'OmO 설치', 'bunx oh-my-openagent install을 실행하고 provider 질문에 답합니다.'], ['03', '작업 시작', 'bunx oh-my-openagent doctor로 확인한 뒤 ultrawork를 입력합니다.']],
  },
  zh: {
    metaTitle: 'Oh My OpenAgent - OpenCode 多模型编排',
    metaDescription: 'Oh My OpenAgent 官方文档，为 OpenCode 提供多模型智能体编排。',
    subtitle: 'OpenCode 的多模型智能体编排', desc: ['开箱即用的 OpenCode harness。', 'Sisyphus 规划，专家执行，工具验证。'],
    getStarted: '开始使用', docs: '查看文档', different: 'OmO 提供什么',
    features: [['纪律智能体', 'Sisyphus、Hephaestus、Prometheus、Atlas、Oracle、Librarian、Explore 等各司其职。'], ['Ultrawork', '输入 ultrawork 或 ulw，系统会持续探索、委派、实现并验证。'], ['分类路由', '按任务类型委派，模型选择交给 harness。'], ['工程工具', 'LSP、AST-grep、后台智能体、tmux、MCP、hashline 编辑和浏览器/多模态工具。']],
    pipeline: '工作循环', pipelineDesc: '请求会被分类、路由、委派、验证，并在真实使用界面检查。',
    steps: [['Intent Gate', '理解真实意图'], ['Sisyphus', '规划和委派'], ['Specialists', '研究和实现'], ['Verification', '诊断、构建、测试、QA']],
    agents: '核心智能体', agentsDesc: 'OpenCode 内部的协作开发团队。', skills: '三步开始', install: '安装命令',
    stepList: [['01', '安装 OpenCode', '先安装并认证 OpenCode。'], ['02', '安装 OmO', '运行 bunx oh-my-openagent install。'], ['03', '开始工作', '运行 doctor 后输入 ultrawork。']],
  },
  ja: {
    metaTitle: 'Oh My OpenAgent - OpenCode のマルチモデル編成',
    metaDescription: 'Oh My OpenAgent の公式ドキュメント。OpenCode にマルチモデルエージェント編成を追加します。',
    subtitle: 'OpenCode のためのマルチモデル・オーケストレーション', desc: ['すぐ使える OpenCode harness。', 'Sisyphus が計画し、専門家が実装し、ツールが検証します。'],
    getStarted: 'はじめる', docs: 'ドキュメント', different: 'OmO が追加するもの',
    features: [['規律あるエージェント', 'Sisyphus、Hephaestus、Prometheus、Atlas、Oracle、Librarian、Explore などが役割ごとに動きます。'], ['Ultrawork', 'ultrawork または ulw と入力すると、探索、委任、実装、検証を最後まで続けます。'], ['カテゴリルーティング', '作業タイプで委任し、モデル選択は harness に任せます。'], ['エージェント用ツール', 'LSP、AST-grep、背景エージェント、tmux、MCP、hashline 編集、ブラウザ/マルチモーダルツール。']],
    pipeline: 'ワークループ', pipelineDesc: '要求を分類し、ルーティングし、委任し、検証し、実際の表面で確認します。',
    steps: [['Intent Gate', '本当の意図を読む'], ['Sisyphus', '計画と委任'], ['Specialists', '調査と実装'], ['Verification', '診断、ビルド、テスト、QA']],
    agents: 'コアエージェント', agentsDesc: 'OpenCode 内の小さな開発チームです。', skills: '3 ステップで開始', install: 'インストールコマンド',
    stepList: [['01', 'OpenCode をインストール', '先に OpenCode を認証します。'], ['02', 'OmO をインストール', 'bunx oh-my-openagent install を実行します。'], ['03', '作業開始', 'doctor の後に ultrawork と入力します。']],
  },
} as const;

function langPrefix(lang: Lang) { return lang === i18n.defaultLanguage ? '' : `/${lang}`; }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = translations[(lang as Lang) in translations ? (lang as Lang) : 'en'];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const key = ((lang as Lang) in translations ? lang : 'en') as Lang;
  const t = translations[key];
  const prefix = langPrefix(key);
  return (
    <HomeLayout>
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16 sm:py-24">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-fd-border bg-fd-card px-3 py-1 text-sm text-fd-muted-foreground">OpenCode plugin · OmO</div>
            <div className="space-y-5">
              <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Oh My OpenAgent</h1>
              <p className="text-2xl font-semibold text-fd-primary">{t.subtitle}</p>
              <div className="space-y-2 text-lg text-fd-muted-foreground">{t.desc.map((line) => <p key={line}>{line}</p>)}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`${prefix}/docs/getting-started`} className="rounded-full bg-fd-primary px-5 py-3 font-semibold text-fd-primary-foreground">{t.getStarted}</Link>
              <Link href={`${prefix}/docs`} className="rounded-full border border-fd-border px-5 py-3 font-semibold">{t.docs}</Link>
            </div>
            <div className="max-w-xl"><CopyInstallCommand command="bunx oh-my-openagent install" label={t.install} /></div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-fd-border bg-fd-card p-5 shadow-2xl">
            <Image src="/images/omo.png" alt="Oh My OpenAgent preview" width={960} height={600} priority className="rounded-2xl" />
          </div>
        </section>

        <section className="space-y-6">
          <div><p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.different}</p><h2 className="mt-2 text-3xl font-bold">Batteries included, not bolted on.</h2></div>
          <div className="grid gap-4 md:grid-cols-2">{t.features.map(([title, desc]) => <div key={title} className="rounded-2xl border border-fd-border bg-fd-card p-6"><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 text-fd-muted-foreground">{desc}</p></div>)}</div>
        </section>

        <section className="rounded-3xl border border-fd-border bg-fd-card p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.pipeline}</p>
          <h2 className="mt-2 text-3xl font-bold">Intent to verified change.</h2>
          <p className="mt-3 text-fd-muted-foreground">{t.pipelineDesc}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">{t.steps.map(([label, role], i) => <div key={label} className="rounded-2xl border border-fd-border p-5"><div className="text-sm text-fd-muted-foreground">0{i + 1}</div><div className="mt-2 font-bold">{label}</div><div className="mt-1 text-sm text-fd-muted-foreground">{role}</div></div>)}</div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-fd-border bg-fd-card p-8"><p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.agents}</p><h2 className="mt-2 text-3xl font-bold">Sisyphus leads the team.</h2><p className="mt-3 text-fd-muted-foreground">{t.agentsDesc}</p><div className="mt-6 flex flex-wrap gap-2">{['Sisyphus','Hephaestus','Prometheus','Atlas','Oracle','Librarian','Explore','Metis','Momus'].map((agent) => <span key={agent} className="rounded-full border border-fd-border px-3 py-1 text-sm">{agent}</span>)}</div></div>
          <div className="rounded-3xl border border-fd-border bg-fd-card p-8"><p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.skills}</p><div className="mt-6 space-y-4">{t.stepList.map(([step, title, desc]) => <div key={step} className="flex gap-4"><div className="font-mono text-fd-primary">{step}</div><div><div className="font-bold">{title}</div><div className="text-sm text-fd-muted-foreground">{desc}</div></div></div>)}</div></div>
        </section>
      </main>
    </HomeLayout>
  );
}

