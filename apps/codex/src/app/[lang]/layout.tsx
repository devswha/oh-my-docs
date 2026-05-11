import { RootProvider } from 'fumadocs-ui/provider/next';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { Analytics } from '@vercel/analytics/next';
import { i18n } from '@/lib/i18n';
import type { ReactNode } from 'react';

const { provider } = defineI18nUI(i18n, {
  translations: {
    en: {
      displayName: 'English',
    },
    ko: {
      displayName: '한국어',
      search: '문서 검색',
      searchNoResult: '검색 결과 없음',
      toc: '목차',
      previousPage: '이전',
      nextPage: '다음',
    },
    zh: {
      displayName: '中文',
      search: '搜索文档',
      searchNoResult: '无搜索结果',
      toc: '目录',
      previousPage: '上一页',
      nextPage: '下一页',
    },
    ja: {
      displayName: '日本語',
      search: 'ドキュメントを検索',
      searchNoResult: '検索結果がありません',
      toc: '目次',
      previousPage: '前へ',
      nextPage: '次へ',
    },
  },
});

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export default async function LangLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <RootProvider i18n={provider(lang)}>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
