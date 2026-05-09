'use client';

import Link from 'next/link';
import { LanguageSelect } from 'fumadocs-ui/layouts/shared/slots/language-select';
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
      className="size-4.5"
    >
      <path d="m5 8 6 6" />
      <path d="M4 14l6-6 2-3" />
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
      className="size-4.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

const iconButtonClass =
  'inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium text-fd-muted-foreground transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

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
    <div className="-mx-4 -mt-2 border-t px-4 pt-2">
      <div className="flex items-center text-fd-muted-foreground">
        <LanguageSelect aria-label={languageLabel}>
          <LanguageIcon />
        </LanguageSelect>

        <Link href={supportHref} aria-label={supportLabel} className={iconButtonClass}>
          <HelpIcon />
        </Link>

        <ThemeSwitch className="ms-auto p-0" mode="light-dark" />
      </div>
    </div>
  );
}
