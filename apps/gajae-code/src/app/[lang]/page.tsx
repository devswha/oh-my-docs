import Link from 'next/link';
import Image from 'next/image';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { CopyInstallCommand } from '@/components/copy-install';
import { i18n } from '@/lib/i18n';
import type { Metadata } from 'next';

type Lang = 'en' | 'ko' | 'zh' | 'ja';

const INSTALL_COMMAND = 'bun install -g gajae-code';

const translations = {
  en: {
    metaTitle: 'Gajae-Code - A red-claw coding-agent harness',
    metaDescription: 'Official docs for Gajae-Code (gjc): crisp interviews, resilient plans, tmux-native execution, durable verification.',
    subtitle: 'A red-claw coding-agent harness',
    desc: ['Crisp interviews, resilient plans, tmux-native execution.', 'deep-interview plans, ralplan critiques, ultragoal verifies.'],
    getStarted: 'Get Started', docs: 'View Docs', different: 'What Gajae-Code Adds',
    features: [
      ['One useful loop', 'deep-interview → ralplan → ultragoal. A compact method, not a sprawling skill zoo.'],
      ['tmux-native execution', 'gjc --tmux runs work in a real tmux session, with optional Git worktree isolation.'],
      ['Role agents', 'executor, architect, planner, and critic each have a bounded job — read-only review where it counts.'],
      ['Durable verification', 'ultragoal tracks goals through implementation, revision, verification, and an evidence summary.'],
    ],
    pipeline: 'The Working Loop', pipelineDesc: 'Clarify intent, critique the plan, then carry the work through to verified evidence.',
    steps: [['deep-interview', 'Clarify intent'], ['ralplan', 'Critique the plan'], ['ultragoal', 'Implement & verify'], ['team', 'Optional parallel workers']],
    agents: 'Role Agents', agentsDesc: 'Four bundled agents with clear boundaries.',
    skills: 'Start in 3 Steps', install: 'Install command', stepList: [['01', 'Install', 'Run bun install -g gajae-code to get the gjc binary.'], ['02', 'Launch', 'Start the tmux-backed experience with gjc --tmux.'], ['03', 'Work', 'Use deep-interview, ralplan, and $ultragoal to drive the loop.']],
  },
  ko: {
    metaTitle: 'Gajae-Code - red-claw 코딩 에이전트 하네스',
    metaDescription: 'Gajae-Code(gjc) 공식 문서. 또렷한 인터뷰, 견고한 계획, tmux 네이티브 실행, 지속 가능한 검증.',
    subtitle: 'red-claw 코딩 에이전트 하네스',
    desc: ['또렷한 인터뷰, 견고한 계획, tmux 네이티브 실행.', 'deep-interview가 계획하고, ralplan이 비평하고, ultragoal이 검증합니다.'],
    getStarted: '시작하기', docs: '문서 보기', different: 'Gajae-Code가 더하는 것',
    features: [
      ['하나의 쓸모 있는 루프', 'deep-interview → ralplan → ultragoal. 산만한 스킬 더미가 아니라 단단한 방법 하나.'],
      ['tmux 네이티브 실행', 'gjc --tmux는 실제 tmux 세션에서 작업을 돌리고, Git worktree 격리도 선택할 수 있습니다.'],
      ['역할 에이전트', 'executor, architect, planner, critic이 각자 맡은 일을 합니다. 중요한 곳은 읽기 전용 리뷰로.'],
      ['지속 가능한 검증', 'ultragoal이 구현·수정·검증·증거 요약까지 목표를 추적합니다.'],
    ],
    pipeline: '작동 흐름', pipelineDesc: '의도를 명확히 하고, 계획을 비평한 뒤, 검증된 증거까지 끌고 갑니다.',
    steps: [['deep-interview', '의도 명확화'], ['ralplan', '계획 비평'], ['ultragoal', '구현·검증'], ['team', '선택적 병렬 워커']],
    agents: '역할 에이전트', agentsDesc: '경계가 분명한 번들 에이전트 넷.',
    skills: '3단계로 시작', install: '설치 명령', stepList: [['01', '설치', 'bun install -g gajae-code로 gjc 바이너리를 받습니다.'], ['02', '실행', 'gjc --tmux로 tmux 기반 환경을 시작합니다.'], ['03', '작업', 'deep-interview, ralplan, $ultragoal로 루프를 돌립니다.']],
  },
  zh: {
    metaTitle: 'Gajae-Code - red-claw 编码智能体 harness',
    metaDescription: 'Gajae-Code(gjc) 官方文档：清晰的访谈、稳健的计划、tmux 原生执行、持久的验证。',
    subtitle: 'red-claw 编码智能体 harness', desc: ['清晰的访谈、稳健的计划、tmux 原生执行。', 'deep-interview 规划，ralplan 评审，ultragoal 验证。'],
    getStarted: '开始使用', docs: '查看文档', different: 'Gajae-Code 提供什么',
    features: [['一个有用的循环', 'deep-interview → ralplan → ultragoal，紧凑的方法而非庞杂的 skill 堆。'], ['tmux 原生执行', 'gjc --tmux 在真实 tmux 会话中运行，可选 Git worktree 隔离。'], ['角色智能体', 'executor、architect、planner、critic 各司其职，关键处只读评审。'], ['持久验证', 'ultragoal 跟踪目标，贯穿实现、修订、验证与证据汇总。']],
    pipeline: '工作循环', pipelineDesc: '厘清意图、评审计划，再把工作推进到可验证的证据。',
    steps: [['deep-interview', '厘清意图'], ['ralplan', '评审计划'], ['ultragoal', '实现与验证'], ['team', '可选并行 worker']],
    agents: '角色智能体', agentsDesc: '四个边界清晰的内置智能体。', skills: '三步开始', install: '安装命令',
    stepList: [['01', '安装', '运行 bun install -g gajae-code 获取 gjc。'], ['02', '启动', '用 gjc --tmux 启动 tmux 体验。'], ['03', '开始工作', '用 deep-interview、ralplan、$ultragoal 驱动循环。']],
  },
  ja: {
    metaTitle: 'Gajae-Code - red-claw コーディングエージェント harness',
    metaDescription: 'Gajae-Code(gjc) の公式ドキュメント。明確なインタビュー、堅牢な計画、tmux ネイティブ実行、永続的な検証。',
    subtitle: 'red-claw コーディングエージェント harness', desc: ['明確なインタビュー、堅牢な計画、tmux ネイティブ実行。', 'deep-interview が計画し、ralplan が批評し、ultragoal が検証します。'],
    getStarted: 'はじめる', docs: 'ドキュメント', different: 'Gajae-Code が追加するもの',
    features: [['1 つの有用なループ', 'deep-interview → ralplan → ultragoal。肥大した skill 群ではなくコンパクトな方法。'], ['tmux ネイティブ実行', 'gjc --tmux は実際の tmux セッションで動作し、Git worktree 隔離も選べます。'], ['ロールエージェント', 'executor、architect、planner、critic がそれぞれ役割を持ち、重要な箇所は読み取り専用レビュー。'], ['永続的な検証', 'ultragoal が実装・改訂・検証・証拠のまとめまで目標を追跡します。']],
    pipeline: 'ワークループ', pipelineDesc: '意図を明確にし、計画を批評し、検証済みの証拠まで進めます。',
    steps: [['deep-interview', '意図を明確化'], ['ralplan', '計画を批評'], ['ultragoal', '実装と検証'], ['team', '任意の並列ワーカー']],
    agents: 'ロールエージェント', agentsDesc: '境界が明確な 4 つの組み込みエージェント。', skills: '3 ステップで開始', install: 'インストールコマンド',
    stepList: [['01', 'インストール', 'bun install -g gajae-code で gjc を取得。'], ['02', '起動', 'gjc --tmux で tmux 体験を開始。'], ['03', '作業開始', 'deep-interview、ralplan、$ultragoal でループを回す。']],
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
            <div className="inline-flex rounded-full border border-fd-border bg-fd-card px-3 py-1 text-sm text-fd-muted-foreground">Coding agent · gjc</div>
            <div className="space-y-5">
              <h1 className="text-5xl font-black tracking-tight sm:text-7xl">Gajae-Code</h1>
              <p className="text-2xl font-semibold text-fd-primary">{t.subtitle}</p>
              <div className="space-y-2 text-lg text-fd-muted-foreground">{t.desc.map((line) => <p key={line}>{line}</p>)}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`${prefix}/docs/getting-started`} className="rounded-full bg-fd-primary px-5 py-3 font-semibold text-fd-primary-foreground">{t.getStarted}</Link>
              <Link href={`${prefix}/docs`} className="rounded-full border border-fd-border px-5 py-3 font-semibold">{t.docs}</Link>
            </div>
            <div className="max-w-xl"><CopyInstallCommand command={INSTALL_COMMAND} label={t.install} /></div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-fd-border bg-fd-card p-5 shadow-2xl">
            <Image src="/images/hero.png" alt="Gajae-Code preview" width={960} height={600} priority className="rounded-2xl" />
          </div>
        </section>

        <section className="space-y-6">
          <div><p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.different}</p><h2 className="mt-2 text-3xl font-bold">A small surface over a dependable runtime.</h2></div>
          <div className="grid gap-4 md:grid-cols-2">{t.features.map(([title, desc]) => <div key={title} className="rounded-2xl border border-fd-border bg-fd-card p-6"><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 text-fd-muted-foreground">{desc}</p></div>)}</div>
        </section>

        <section className="rounded-3xl border border-fd-border bg-fd-card p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.pipeline}</p>
          <h2 className="mt-2 text-3xl font-bold">Intent to verified change.</h2>
          <p className="mt-3 text-fd-muted-foreground">{t.pipelineDesc}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">{t.steps.map(([label, role], i) => <div key={label} className="rounded-2xl border border-fd-border p-5"><div className="text-sm text-fd-muted-foreground">0{i + 1}</div><div className="mt-2 font-bold">{label}</div><div className="mt-1 text-sm text-fd-muted-foreground">{role}</div></div>)}</div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-fd-border bg-fd-card p-8"><p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.agents}</p><h2 className="mt-2 text-3xl font-bold">Bounded roles, clear jobs.</h2><p className="mt-3 text-fd-muted-foreground">{t.agentsDesc}</p><div className="mt-6 flex flex-wrap gap-2">{['executor', 'architect', 'planner', 'critic'].map((agent) => <span key={agent} className="rounded-full border border-fd-border px-3 py-1 text-sm">{agent}</span>)}</div></div>
          <div className="rounded-3xl border border-fd-border bg-fd-card p-8"><p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.skills}</p><div className="mt-6 space-y-4">{t.stepList.map(([step, title, desc]) => <div key={step} className="flex gap-4"><div className="font-mono text-fd-primary">{step}</div><div><div className="font-bold">{title}</div><div className="text-sm text-fd-muted-foreground">{desc}</div></div></div>)}</div></div>
        </section>
      </main>
    </HomeLayout>
  );
}
