'use client';

import Link from 'next/link';
import { LanguageSelect, LanguageSelectText } from 'fumadocs-ui/layouts/shared/slots/language-select';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';

function LanguageIcon() {
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
      className="size-4"
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

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
      className="size-4"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

const controlClass =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

export function DocsSidebarFooter({
  supportHref,
  supportLabel,
  languageLabel,
}: {
  supportHref: string;
  supportLabel: string;
  languageLabel: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-fd-secondary/50 p-1 text-fd-muted-foreground">
      <LanguageSelect
        aria-label={languageLabel}
        className="min-w-0 flex-1 justify-start px-2 text-start"
      >
        <LanguageIcon />
        <LanguageSelectText className="truncate text-xs" />
      </LanguageSelect>

      <Link href={supportHref} aria-label={supportLabel} className={controlClass}>
        <HelpIcon />
      </Link>

      <ThemeSwitch
        className="shrink-0 overflow-visible border-y-0 border-e-0 p-0"
        mode="light-dark"
      />
    </div>
  );
}
