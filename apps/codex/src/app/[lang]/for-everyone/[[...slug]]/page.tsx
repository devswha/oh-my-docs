import type { Metadata } from 'next';
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { forEveryoneSource } from '@/lib/source-for-everyone';
import { findNeighbour } from 'fumadocs-core/page-tree';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Mermaid } from '@/components/mermaid';
import type { ComponentType } from 'react';

type PageDataWithContent = {
  body: ComponentType<{
    components?: Record<string, unknown>;
  }>;
  toc: unknown;
  title: string;
  description?: string;
};

export default async function Page(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}) {
  const params = await props.params;
  const page = forEveryoneSource.getPage(params.slug, params.lang);
  if (!page) notFound();

  const pageData = page.data as typeof page.data & PageDataWithContent;
  const MDXContent = pageData.body;

  const tree = forEveryoneSource.getPageTree(params.lang);
  const autoNav = findNeighbour(tree, page.url);

  return (
    <DocsPage
      toc={pageData.toc}
      breadcrumb={{ enabled: true, includeRoot: true, includePage: true }}
      footer={{ items: autoNav }}
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
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return forEveryoneSource.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[]; lang: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = forEveryoneSource.getPage(params.slug, params.lang);
  if (!page) notFound();
  const pageData = page.data as typeof page.data & PageDataWithContent;

  return {
    title: `${pageData.title} — OMX For Everyone`,
    description: pageData.description,
  };
}
