import type { Metadata } from 'next';
import './globals.css';
import 'nextra-theme-docs/style.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nicered.github.io'),
  title: 'ClaudeShip - AI-Powered App Builder',
  description: 'Build web applications with natural language. Describe what you want, AI writes the code.',
  keywords: ['AI', 'Claude', 'app builder', 'code generation', 'Next.js', 'NestJS'],
  authors: [{ name: 'ClaudeShip' }],
  alternates: {
    canonical: '/ClaudeShip/',
  },
  openGraph: {
    title: 'ClaudeShip - AI-Powered App Builder',
    description: 'Build web applications with natural language.',
    type: 'website',
    url: 'https://nicered.github.io/ClaudeShip/',
    siteName: 'ClaudeShip',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClaudeShip - AI-Powered App Builder',
    description: 'Build web applications with natural language.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: 'GZ7MbCBtQBsW7nv9R3BATtvTiIj1wngXcwqB94jZwxA',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
