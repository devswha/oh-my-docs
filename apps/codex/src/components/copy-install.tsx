'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

const INSTALL_COMMAND = 'npm i -g oh-my-codex';

const COPY = {
  en: { title: 'Click to copy', copy: 'Copy', copied: 'Copied' },
  ko: { title: '클릭하여 복사', copy: '복사', copied: '복사됨' },
  ja: { title: 'クリックでコピー', copy: 'コピー', copied: 'コピー済み' },
  zh: { title: '点击复制', copy: '复制', copied: '已复制' },
} as const;

type Lang = keyof typeof COPY;

export function CopyInstallCommand() {
  const params = useParams<{ lang?: string }>();
  const locale: Lang =
    params?.lang && params.lang in COPY ? (params.lang as Lang) : 'en';
  const labels = COPY[locale];

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Best-effort: do nothing if clipboard API unavailable.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group mt-8 flex w-full max-w-lg items-center gap-3 rounded-lg border border-fd-border bg-fd-card px-5 py-3.5 text-left font-mono text-sm transition-colors hover:bg-fd-accent/50"
      title={labels.title}
      aria-label={labels.title}
    >
      <span className="select-none text-fd-muted-foreground">$</span>
      <span className="flex-1 truncate text-fd-foreground">
        {INSTALL_COMMAND}
      </span>
      <span className="flex-none select-none text-xs text-fd-muted-foreground transition-colors group-hover:text-fd-foreground">
        {copied ? labels.copied : labels.copy}
      </span>
    </button>
  );
}
