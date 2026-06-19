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

function StarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-3.5 text-amber-500"
    >
      <path d="M12 2.6l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.97l-5.64 2.96 1.08-6.29-4.57-4.45 6.31-.92z" />
    </svg>
  );
}

const iconButtonClass =
  'inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium text-fd-muted-foreground transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring';

export function DocsSidebarFooter({
  supportHref,
  supportLabel,
  languageLabel,
  patinaLabel,
  patinaTitle,
}: {
  supportHref: string;
  supportLabel: string;
  languageLabel: string;
  patinaLabel: string;
  patinaTitle: string;
}) {
  return (
    <div className="-mx-4 -mt-2 border-t px-4 pt-2">
      <a
        href="https://github.com/devswha/patina"
        target="_blank"
        rel="noopener noreferrer"
        title={patinaTitle}
        className="group mb-2 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-fd-muted-foreground transition-colors duration-100 hover:bg-fd-accent hover:text-fd-accent-foreground"
      >
        <StarIcon />
        <span className="truncate">{patinaLabel}</span>
        <span aria-hidden="true" className="ms-auto opacity-0 transition-opacity group-hover:opacity-100">★</span>
      </a>
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
