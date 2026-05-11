import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { i18n } from '@/lib/i18n';
import { OMX_VERSION } from '@/lib/version';
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
  const langPrefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      nav={{
        title: (
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="OMX"
              width={28}
              height={28}
              priority
              className="shrink-0"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="flex flex-col">
              <span>Oh My CodeX</span>
              <span className="text-xs text-fd-muted-foreground">v{OMX_VERSION}</span>
            </div>
          </div>
        ),
        url: lang === i18n.defaultLanguage ? '/docs' : `/${lang}/docs`,
      }}
      sidebar={{
        defaultOpenLevel: 1,
        footer: (
          <DocsSidebarFooter
            supportHref={`${langPrefix}/docs/support`}
            supportLabel={supportLabel}
            languageLabel={languageLabel}
          />
        ),
      }}
      i18n={i18n}
      slots={{
        languageSelect: false,
        themeSwitch: false,
      }}
      links={[
        {
          text: 'GitHub',
          url: 'https://github.com/Yeachan-Heo/oh-my-codex',
          external: true,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
