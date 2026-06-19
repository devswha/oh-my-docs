import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { i18n } from '@/lib/i18n';
import { LZX_VERSION } from '@/lib/version';
import { DocsSidebarFooter } from '@/components/docs-sidebar-footer';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;

  const supportLabel =
    ({ en: 'Support', ko: '지원', ja: 'サポート', zh: '支持' } as const)[
      lang as 'en' | 'ko' | 'ja' | 'zh'
    ] ?? 'Support';
  const languageLabel =
    ({ en: 'Choose language', ko: '언어 선택', ja: '言語を選択', zh: '选择语言' } as const)[
      lang as 'en' | 'ko' | 'ja' | 'zh'
    ] ?? 'Choose language';
  const patinaLabel =
    ({ en: 'Crafted with Patina', ko: 'Patina로 다듬은 문서', ja: 'Patina で整えたドキュメント', zh: '由 Patina 打磨' } as const)[
      lang as 'en' | 'ko' | 'ja' | 'zh'
    ] ?? 'Crafted with Patina';
  const patinaTitle =
    ({ en: 'Star Patina on GitHub', ko: 'GitHub에서 Patina에 ⭐ 남기기', ja: 'GitHub で Patina に ⭐ を', zh: '在 GitHub 上给 Patina 点 ⭐' } as const)[
      lang as 'en' | 'ko' | 'ja' | 'zh'
    ] ?? 'Star Patina on GitHub';
  const langPrefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      nav={{
        title: (
          <div key="docs-nav-title" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="LazyCodex"
              width={28}
              height={28}
              priority
              className="shrink-0"
            />
            <div className="flex flex-col">
              <span>LazyCodex</span>
              <span className="text-xs text-fd-muted-foreground">v{LZX_VERSION}</span>
            </div>
          </div>
        ),
        url: lang === i18n.defaultLanguage ? '/docs' : `/${lang}/docs`,
      }}
      sidebar={{
        defaultOpenLevel: 1,
        footer: (
          <DocsSidebarFooter
            key="docs-sidebar-footer"
            supportHref={`${langPrefix}/docs/support`}
            supportLabel={supportLabel}
            languageLabel={languageLabel}
            patinaLabel={patinaLabel}
            patinaTitle={patinaTitle}
          />
        ),
      }}
      i18n={i18n}
      slots={{ languageSelect: false, themeSwitch: false }}
      links={[
        {
          text: 'GitHub',
          url: 'https://github.com/code-yeongyu/lazycodex',
          external: true,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
