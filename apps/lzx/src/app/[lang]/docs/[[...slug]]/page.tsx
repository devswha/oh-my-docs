import type { Metadata } from 'next';
import type { TOCItemType } from 'fumadocs-core/toc';
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { source } from '@/lib/source';
import { findNeighbour } from 'fumadocs-core/page-tree';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Mermaid } from '@/components/mermaid';
import { ReportForm } from '@/components/report-form';
import type { ComponentType } from 'react';

type PageDataWithContent = {
  body: ComponentType<{
    components?: Record<string, unknown>;
  }>;
  toc: TOCItemType[];
  title: string;
  description?: string;
};

export default async function Page(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  const pageData = page.data as typeof page.data & PageDataWithContent;

  const MDXContent = pageData.body;
  const toc = Array.isArray(pageData.toc) ? (pageData.toc as TOCItemType[]) : undefined;

  // Previous/next follow the page-tree order, which is driven by each
  // directory's meta.json `pages` list across locales.
  const tree = source.getPageTree(params.lang);
  const footerItems = findNeighbour(tree, page.url);

  return (
    <DocsPage
      toc={toc}
      breadcrumb={{ enabled: true, includeRoot: true, includePage: true }}
      footer={{ items: footerItems }}
    >
      <DocsTitle>{pageData.title}</DocsTitle>
      <DocsDescription>{pageData.description}</DocsDescription>
      <DocsBody>
        <MDXContent
          components={{
            ...defaultMdxComponents,
            Steps,
            Step,
            Tab,
            Tabs,
            Mermaid,
            ReportForm,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();
  const pageData = page.data as typeof page.data & PageDataWithContent;

  return {
    title: `${pageData.title} — LazyCodex Docs`,
    description: pageData.description,
  };
}

