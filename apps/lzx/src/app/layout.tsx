import 'fumadocs-ui/style.css';
import './global.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'LazyCodex - Docs',
  description:
    'Official documentation for LazyCodex (LZX), the OmO agent harness packaged for Codex.',
  openGraph: {
    title: 'LazyCodex - Docs',
    description:
      'Official documentation for LazyCodex (LZX), the OmO agent harness packaged for Codex.',
    type: 'website',
    url: 'https://lzx.vibetip.help',
    images: [
      {
        url: 'https://lzx.vibetip.help/images/lzx-social-preview.jpg',
        width: 1280,
        height: 640,
        alt: 'LazyCodex documentation preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LazyCodex - Docs',
    description:
      'Official documentation for LazyCodex (LZX), the OmO agent harness packaged for Codex.',
    images: ['https://lzx.vibetip.help/images/lzx-social-preview.jpg'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
