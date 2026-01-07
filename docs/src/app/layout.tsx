import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClaudeShip - AI-Powered App Builder',
  description: 'Build web applications with natural language. Describe what you want, AI writes the code.',
  keywords: ['AI', 'Claude', 'app builder', 'code generation', 'Next.js', 'NestJS'],
  authors: [{ name: 'ClaudeShip' }],
  openGraph: {
    title: 'ClaudeShip - AI-Powered App Builder',
    description: 'Build web applications with natural language.',
    type: 'website',
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
