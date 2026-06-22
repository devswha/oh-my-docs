import 'fumadocs-ui/style.css';
import './global.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Oh My OpenAgent - Docs',
  description:
    'Official documentation for Oh My OpenAgent, a multi-model orchestration harness for OpenCode.',
  openGraph: {
    title: 'Oh My OpenAgent - Docs',
    description:
      'Official documentation for Oh My OpenAgent, a multi-model orchestration harness for OpenCode.',
    type: 'website',
    url: 'https://omo.vibetip.help',
    images: [
      {
        url: 'https://omo.vibetip.help/images/omo-social-preview.jpg',
        width: 1280,
        height: 640,
        alt: 'Oh My OpenAgent documentation preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oh My OpenAgent - Docs',
    description:
      'Official documentation for Oh My OpenAgent, a multi-model orchestration harness for OpenCode.',
    images: ['https://omo.vibetip.help/images/omo-social-preview.jpg'],
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
