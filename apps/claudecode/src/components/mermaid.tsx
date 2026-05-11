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

  useEffect(() => {
    const isDark = resolvedTheme === 'dark';
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      look: 'handDrawn',
      fontFamily: 'inherit',
      securityLevel: 'strict',
    });

    const id = `mermaid-${reactId.replace(/:/g, '')}`;
    mermaid
      .render(id, chart.trim())
      .then(({ svg }) => {
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
        console.error('Mermaid render failed:', err);
        setSvg('');
      });
  }, [chart, resolvedTheme, reactId]);

  return (
    <div
      className="my-6 flex justify-center [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
