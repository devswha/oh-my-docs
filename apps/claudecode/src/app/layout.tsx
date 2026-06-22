import 'fumadocs-ui/style.css';
import './global.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Oh My ClaudeCode — Docs',
  description:
    'Official documentation for oh-my-claudecode, a multi-agent orchestration layer for Claude Code.',
  openGraph: {
    title: 'Oh My ClaudeCode — Docs',
    description:
      'Official documentation for oh-my-claudecode, a multi-agent orchestration layer for Claude Code.',
    type: 'website',
    url: 'https://omc.vibetip.help',
    images: [
      {
        url: 'https://omc.vibetip.help/images/omc-social-preview.jpg',
        width: 1280,
        height: 640,
        alt: 'Oh My ClaudeCode documentation preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oh My ClaudeCode — Docs',
    description:
      'Official documentation for oh-my-claudecode, a multi-agent orchestration layer for Claude Code.',
    images: ['https://omc.vibetip.help/images/omc-social-preview.jpg'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
