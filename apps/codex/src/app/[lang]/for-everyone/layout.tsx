import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { forEveryoneSource } from '@/lib/source-for-everyone';
import { i18n } from '@/lib/i18n';
import { OMX_VERSION } from '@/lib/version';

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  const langPrefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;

  return (
    <DocsLayout
      tree={forEveryoneSource.getPageTree(lang)}
      nav={{
        title: (
          <div
            key="for-everyone-nav-title"
            className="flex items-center gap-2"
          >
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
              <span className="text-xs text-fd-muted-foreground">
                v{OMX_VERSION}
              </span>
            </div>
          </div>
        ),
        url:
          lang === i18n.defaultLanguage
            ? '/for-everyone'
            : `/${lang}/for-everyone`,
      }}
      sidebar={{
        defaultOpenLevel: 1,
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
        {
          text: 'Docs',
          url: `${langPrefix}/docs`,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
