import Link from 'next/link';
import Image from 'next/image';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { CopyInstallCommand } from '@/components/copy-install';
import { i18n } from '@/lib/i18n';
import type { Metadata } from 'next';

type Lang = 'en' | 'ko' | 'zh' | 'ja';

const INSTALL_COMMAND = 'npx lazycodex-ai install';

const translations = {
  en: {
    metaTitle: 'LazyCodex - The OmO agent harness for Codex',
    metaDescription: 'Official docs for LazyCodex (LZX): project memory, planning, execution, and verified completion inside Codex.',
    subtitle: 'The OmO agent harness, packaged for Codex',
    desc: ['Project memory, planning, execution, and verified completion inside Codex.', 'Think LazyVim for Codex — sensible defaults, override when you want.'],
    getStarted: 'Get Started', different: 'What you get',
    features: [
      ['Discipline Agents', 'Sisyphus orchestrates Hephaestus, Oracle, and Librarian — a full AI dev team inside Codex.'],
      ['Parallel Execution', 'Multiple agents work simultaneously on subtasks instead of one serial thread.'],
      ['Multi-Model Routing', 'Automatic model selection per task category — quota discipline, not random churn.'],
      ['Verified Completion', '$ulw-loop runs until the result is Oracle-verified by evidence, not a hopeful status update.'],
    ],
    pipeline: 'Three command pillars', pipelineDesc: 'Plan with $ulw-plan, execute with $start-work, and loop to verified completion with $ulw-loop.',
    steps: [['/init-deep', 'Project memory'], ['$ulw-plan', 'Plan the work'], ['$start-work', 'Execute the plan'], ['$ulw-loop', 'Verified completion']],
    agents: 'Discipline Agents', agentsDesc: 'A coordinated AI dev team running inside Codex.',
    skills: 'Start in 3 Steps', install: 'Install command', stepList: [['01', 'Install', 'Run npx lazycodex-ai install to set up the harness for Codex.'], ['02', 'Project memory', 'Run /init-deep to generate hierarchical AGENTS.md context.'], ['03', 'Work', 'Use $ulw-plan, $start-work, and $ulw-loop to drive the loop.']],
  },
  ko: {
    metaTitle: 'LazyCodex - Codex를 위한 OmO 에이전트 하네스',
    metaDescription: 'LazyCodex(LZX) 공식 문서. Codex 안에서의 프로젝트 메모리, 계획, 실행, 검증된 완료.',
    subtitle: 'Codex용으로 패키징한 OmO 에이전트 하네스',
    desc: ['Codex 안에서 프로젝트 메모리, 계획, 실행, 검증된 완료까지.', 'Codex를 위한 LazyVim이라고 생각하세요 — 합리적 기본값, 원할 때 덮어쓰기.'],
    getStarted: '시작하기', different: '무엇을 얻나',
    features: [
      ['기강 잡힌 에이전트', 'Sisyphus가 Hephaestus, Oracle, Librarian을 지휘합니다 — Codex 안의 완전한 AI 개발팀.'],
      ['병렬 실행', '하나의 직렬 스레드 대신 여러 에이전트가 동시에 하위 작업을 처리합니다.'],
      ['멀티 모델 라우팅', '작업 카테고리별 자동 모델 선택 — 무작위가 아니라 quota 절약 규율.'],
      ['검증된 완료', '$ulw-loop은 희망 섞인 상태 보고가 아니라 Oracle이 증거로 검증할 때까지 돕니다.'],
    ],
    pipeline: '세 가지 명령 기둥', pipelineDesc: '$ulw-plan으로 계획하고, $start-work로 실행하고, $ulw-loop으로 검증된 완료까지 돌립니다.',
    steps: [['/init-deep', '프로젝트 메모리'], ['$ulw-plan', '작업 계획'], ['$start-work', '계획 실행'], ['$ulw-loop', '검증된 완료']],
    agents: '기강 잡힌 에이전트', agentsDesc: 'Codex 안에서 도는 협업 AI 개발팀.',
    skills: '3단계로 시작', install: '설치 명령', stepList: [['01', '설치', 'npx lazycodex-ai install로 Codex용 하네스를 설치합니다.'], ['02', '프로젝트 메모리', '/init-deep으로 계층형 AGENTS.md 컨텍스트를 생성합니다.'], ['03', '작업', '$ulw-plan, $start-work, $ulw-loop으로 루프를 돌립니다.']],
  },
  zh: {
    metaTitle: 'LazyCodex - 面向 Codex 的 OmO 智能体 harness',
    metaDescription: 'LazyCodex(LZX) 官方文档：在 Codex 内的项目记忆、规划、执行与验证完成。',
    subtitle: '为 Codex 打包的 OmO 智能体 harness', desc: ['在 Codex 内实现项目记忆、规划、执行与验证完成。', '把它想成 Codex 版的 LazyVim — 合理默认，按需覆盖。'],
    getStarted: '开始使用', different: '你能得到什么',
    features: [['纪律智能体', 'Sisyphus 指挥 Hephaestus、Oracle、Librarian —— Codex 内的完整 AI 开发团队。'], ['并行执行', '多个智能体同时处理子任务，而非单线串行。'], ['多模型路由', '按任务类别自动选择模型 —— 是配额纪律，不是随机切换。'], ['验证完成', '$ulw-loop 持续运行，直到 Oracle 以证据验证结果。']],
    pipeline: '三大命令支柱', pipelineDesc: '用 $ulw-plan 规划，用 $start-work 执行，用 $ulw-loop 循环到验证完成。',
    steps: [['/init-deep', '项目记忆'], ['$ulw-plan', '规划工作'], ['$start-work', '执行计划'], ['$ulw-loop', '验证完成']],
    agents: '纪律智能体', agentsDesc: '在 Codex 内协作的 AI 开发团队。', skills: '三步开始', install: '安装命令',
    stepList: [['01', '安装', '运行 npx lazycodex-ai install 为 Codex 安装 harness。'], ['02', '项目记忆', '运行 /init-deep 生成分层 AGENTS.md 上下文。'], ['03', '开始工作', '用 $ulw-plan、$start-work、$ulw-loop 驱动循环。']],
  },
  ja: {
    metaTitle: 'LazyCodex - Codex 向け OmO エージェント harness',
    metaDescription: 'LazyCodex(LZX) の公式ドキュメント。Codex 内でのプロジェクトメモリ、計画、実行、検証済み完了。',
    subtitle: 'Codex 向けにパッケージした OmO エージェント harness', desc: ['Codex の中でプロジェクトメモリ、計画、実行、検証済み完了まで。', 'Codex 版の LazyVim だと考えてください — 合理的な既定値、必要なら上書き。'],
    getStarted: 'はじめる', different: '得られるもの',
    features: [['規律あるエージェント', 'Sisyphus が Hephaestus、Oracle、Librarian を統括 —— Codex 内の完全な AI 開発チーム。'], ['並列実行', '1 本の直列スレッドではなく、複数エージェントが同時にサブタスクを処理。'], ['マルチモデルルーティング', 'タスクカテゴリごとに自動でモデル選択 —— ランダムではなくクォータ規律。'], ['検証済み完了', '$ulw-loop は希望的観測ではなく Oracle が証拠で検証するまで回ります。']],
    pipeline: '3 つのコマンドの柱', pipelineDesc: '$ulw-plan で計画し、$start-work で実行し、$ulw-loop で検証済み完了まで回します。',
    steps: [['/init-deep', 'プロジェクトメモリ'], ['$ulw-plan', '作業を計画'], ['$start-work', '計画を実行'], ['$ulw-loop', '検証済み完了']],
    agents: '規律あるエージェント', agentsDesc: 'Codex 内で動く協調 AI 開発チーム。', skills: '3 ステップで開始', install: 'インストールコマンド',
    stepList: [['01', 'インストール', 'npx lazycodex-ai install で Codex 用 harness を導入。'], ['02', 'プロジェクトメモリ', '/init-deep で階層的な AGENTS.md コンテキストを生成。'], ['03', '作業開始', '$ulw-plan、$start-work、$ulw-loop でループを回す。']],
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
            <div className="inline-flex rounded-full border border-fd-border bg-fd-card px-3 py-1 text-sm text-fd-muted-foreground">OmO for Codex · npx</div>
            <div className="space-y-5">
              <h1 className="text-5xl font-black tracking-tight sm:text-7xl">LazyCodex</h1>
              <p className="text-2xl font-semibold text-fd-primary">{t.subtitle}</p>
              <div className="space-y-2 text-lg text-fd-muted-foreground">{t.desc.map((line) => <p key={line}>{line}</p>)}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`${prefix}/docs/getting-started`} className="rounded-full bg-fd-primary px-5 py-3 font-semibold text-fd-primary-foreground">{t.getStarted}</Link>
            </div>
            <div className="max-w-xl"><CopyInstallCommand command={INSTALL_COMMAND} label={t.install} /></div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-fd-border bg-fd-card p-5 shadow-2xl">
            <Image src="/images/hero.png" alt="LazyCodex" width={960} height={600} priority className="rounded-2xl" />
          </div>
        </section>

        <section className="space-y-6">
          <div><p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.different}</p><h2 className="mt-2 text-3xl font-bold">The agent harness for complex codebases.</h2></div>
          <div className="grid gap-4 md:grid-cols-2">{t.features.map(([title, desc]) => <div key={title} className="rounded-2xl border border-fd-border bg-fd-card p-6"><h3 className="text-xl font-bold">{title}</h3><p className="mt-3 text-fd-muted-foreground">{desc}</p></div>)}</div>
        </section>

        <section className="rounded-3xl border border-fd-border bg-fd-card p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.pipeline}</p>
          <h2 className="mt-2 text-3xl font-bold">Plan, execute, verify.</h2>
          <p className="mt-3 text-fd-muted-foreground">{t.pipelineDesc}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">{t.steps.map(([label, role], i) => <div key={label} className="rounded-2xl border border-fd-border p-5"><div className="text-sm text-fd-muted-foreground">0{i + 1}</div><div className="mt-2 font-bold">{label}</div><div className="mt-1 text-sm text-fd-muted-foreground">{role}</div></div>)}</div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-fd-border bg-fd-card p-8"><p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.agents}</p><h2 className="mt-2 text-3xl font-bold">Sisyphus leads the team.</h2><p className="mt-3 text-fd-muted-foreground">{t.agentsDesc}</p><div className="mt-6 flex flex-wrap gap-2">{['Sisyphus', 'Hephaestus', 'Oracle', 'Librarian'].map((agent) => <span key={agent} className="rounded-full border border-fd-border px-3 py-1 text-sm">{agent}</span>)}</div></div>
          <div className="rounded-3xl border border-fd-border bg-fd-card p-8"><p className="text-sm font-bold uppercase tracking-widest text-fd-primary">{t.skills}</p><div className="mt-6 space-y-4">{t.stepList.map(([step, title, desc]) => <div key={step} className="flex gap-4"><div className="font-mono text-fd-primary">{step}</div><div><div className="font-bold">{title}</div><div className="text-sm text-fd-muted-foreground">{desc}</div></div></div>)}</div></div>
        </section>
      </main>
    </HomeLayout>
  );
}
