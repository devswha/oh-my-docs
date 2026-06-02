'use client';

import { useState, useCallback } from 'react';

export function CopyInstallCommand({
  command = 'bun install -g gajae-code',
  label = 'Install command',
}: {
  command?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [command]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group mt-8 flex w-full max-w-lg items-center gap-3 rounded-lg border border-fd-border bg-fd-card px-5 py-3.5 text-left font-mono text-sm transition-colors hover:bg-fd-accent/50"
      title={label}
      aria-label={label}
    >
      <span className="select-none text-fd-muted-foreground">$</span>
      <span className="flex-1 truncate text-fd-foreground">{command}</span>
      <span className="flex-none select-none text-xs text-fd-muted-foreground transition-colors group-hover:text-fd-foreground">
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}

