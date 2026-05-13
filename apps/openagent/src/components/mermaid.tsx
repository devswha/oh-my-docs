'use client';

import { useEffect, useId, useState } from 'react';
import { useTheme } from 'next-themes';
import mermaid from 'mermaid';
import DOMPurify from 'dompurify';

const ALLOWED_HTML_TAGS = [
  'foreignobject',
  'div',
  'span',
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'code',
  'pre',
  'hr',
];
const ALLOWED_HTML_ATTR = ['class', 'style', 'xmlns'];

export function Mermaid({ chart }: { chart: string }) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState('');
  const reactId = useId();
  const idSuffix = reactId.replace(/[^a-zA-Z0-9_-]/g, '');

  // Theme is global Mermaid config. Re-initialize only when theme changes
  // so concurrent renders can't fight over it on every chart-prop update.
  useEffect(() => {
    const isDark = resolvedTheme === 'dark';
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      look: 'handDrawn',
      fontFamily: 'inherit',
      securityLevel: 'strict',
    });
  }, [resolvedTheme]);

  useEffect(() => {
    let alive = true;
    const id = `mermaid-${idSuffix}`;
    mermaid
      .render(id, chart.trim())
      .then(({ svg }) => {
        if (!alive) return;
        setSvg(
          DOMPurify.sanitize(svg, {
            USE_PROFILES: { svg: true },
            ADD_TAGS: ALLOWED_HTML_TAGS,
            ADD_ATTR: ALLOWED_HTML_ATTR,
            HTML_INTEGRATION_POINTS: { foreignobject: true },
          }),
        );
      })
      .catch((err) => {
        if (!alive) return;
        console.error('Mermaid render failed:', err);
        setSvg('');
      });
    return () => {
      alive = false;
    };
  }, [chart, resolvedTheme, idSuffix]);

  return (
    <div
      className="my-6 flex justify-center [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
