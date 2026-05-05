import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { i18n } from '@/lib/i18n';
import { OMO_VERSION } from '@/lib/version';

function HelpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

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
  const langPrefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      nav={{
        title: (
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="OmO"
              width={28}
              height={28}
              priority
              className="shrink-0"
            />
            <div className="flex flex-col">
              <span>Oh My OpenAgent</span>
              <span className="text-xs text-fd-muted-foreground">v{OMO_VERSION}</span>
            </div>
          </div>
        ),
        url: lang === i18n.defaultLanguage ? '/docs' : `/${lang}/docs`,
      }}
      sidebar={{
        defaultOpenLevel: 1,
      }}
      i18n={i18n}
      links={[
        {
          text: 'GitHub',
          url: 'https://github.com/code-yeongyu/oh-my-openagent',
          external: true,
        },
        {
          type: 'icon',
          text: supportLabel,
          url: `${langPrefix}/docs/support`,
          icon: <HelpIcon />,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
