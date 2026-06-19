import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { i18n } from '@/lib/i18n';
import { OMC_VERSION } from '@/lib/version';

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
  const patinaLabel =
    ({ en: 'Star Patina on GitHub', ko: 'GitHub에서 Patina에 Star', ja: 'GitHub で Patina に Star', zh: '在 GitHub 上 Star Patina' } as const)[
      lang as 'en' | 'ko' | 'ja' | 'zh'
    ] ?? 'Star Patina on GitHub';
  const patinaTitle =
    ({ en: 'Patina — open-source AI text humanizer', ko: 'Patina — 오픈소스 AI 텍스트 휴머나이저', ja: 'Patina — オープンソースの AI テキストヒューマナイザー', zh: 'Patina — 开源 AI 文本人性化工具' } as const)[
      lang as 'en' | 'ko' | 'ja' | 'zh'
    ] ?? 'Patina — open-source AI text humanizer';
  const langPrefix = lang === i18n.defaultLanguage ? '' : `/${lang}`;

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      nav={{
        title: (
          <div key="docs-nav-title" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="OMC"
              width={28}
              height={26}
              priority
              className="shrink-0"
            />
            <div className="flex flex-col">
              <span>Oh My ClaudeCode</span>
              <span className="text-xs text-fd-muted-foreground">v{OMC_VERSION}</span>
            </div>
          </div>
        ),
        url: lang === i18n.defaultLanguage ? '/docs' : `/${lang}/docs`,
      }}
      sidebar={{
        defaultOpenLevel: 1,
        footer: (
          <a
            key="patina-cta"
            href="https://github.com/devswha/patina"
            target="_blank"
            rel="noopener noreferrer"
            title={patinaTitle}
            className="mt-2 flex items-center gap-1.5 border-t px-1.5 pt-2 text-xs text-fd-muted-foreground transition-colors duration-100 hover:text-fd-accent-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3.5 text-amber-500">
              <path d="M12 2.6l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.97l-5.64 2.96 1.08-6.29-4.57-4.45 6.31-.92z" />
            </svg>
            <span className="truncate">{patinaLabel}</span>
          </a>
        ),
      }}
      i18n={i18n}
      links={[
        {
          text: 'GitHub',
          url: 'https://github.com/Yeachan-Heo/oh-my-claudecode',
          external: true,
        },
        {
          type: 'icon',
          text: supportLabel,
          url: `${langPrefix}/docs/support`,
          icon: (
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
          ),
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
