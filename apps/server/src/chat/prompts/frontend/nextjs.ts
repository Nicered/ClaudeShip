/**
 * Next.js Frontend Prompt
 *
 * Next.js App Router 프론트엔드 개발 가이드
 */

export const NEXTJS_PROMPT = `## Frontend: Next.js (App Router)

You are building a Next.js application using the App Router.

### Technology Stack (Frontend)

| Category | Technology | Notes |
|----------|------------|-------|
| Framework | Next.js 15+ | App Router only |
| Language | TypeScript | Strict mode |
| UI Components | shadcn/ui | Install: \`npx shadcn@latest add <component>\` |
| Styling | Tailwind CSS | Use design tokens |
| State | Zustand | For client state |
| Forms | React Hook Form + Zod | For validation |
| Icons | Lucide React | Consistent iconography |

### Project Initialization

\`\`\`bash
# Create Next.js project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional dependencies
npm install lucide-react clsx tailwind-merge zustand
npm install react-hook-form @hookform/resolvers zod

# Initialize shadcn/ui
npx shadcn@latest init -d
\`\`\`

### Project Structure

\`\`\`
app/
├── layout.tsx          # Root layout with fonts, metadata
├── page.tsx            # Home page
├── globals.css         # Tailwind imports + custom styles
├── loading.tsx         # Global loading state
├── error.tsx           # Global error boundary
├── not-found.tsx       # 404 page
├── (routes)/           # Route groups
│   ├── about/
│   │   └── page.tsx
│   └── dashboard/
│       └── page.tsx
components/
├── ui/                 # shadcn/ui components
└── [feature]/          # Feature-specific components
lib/
├── utils.ts            # cn() helper and utilities
└── api.ts              # API client (if backend exists)
hooks/                  # Custom React hooks
types/                  # TypeScript type definitions
\`\`\`

### SEO Best Practices

Every page MUST include proper SEO elements:

\`\`\`tsx
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Site Name',
    template: '%s | Site Name',
  },
  description: 'Site description',
  openGraph: {
    title: 'Site Name',
    description: 'Site description',
    images: ['/og-image.png'],
  },
};
\`\`\`

### Server Components vs Client Components

\`\`\`tsx
// Server Component (default) - for data fetching
// app/users/page.tsx
async function getUsers() {
  const res = await fetch('https://api.example.com/users', {
    cache: 'no-store', // or next: { revalidate: 60 }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();
  return <UserList users={users} />;
}

// Client Component - for interactivity
// components/Counter.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex items-center gap-4">
      <Button onClick={() => setCount(c => c - 1)}>-</Button>
      <span className="text-2xl font-bold">{count}</span>
      <Button onClick={() => setCount(c => c + 1)}>+</Button>
    </div>
  );
}
\`\`\`

### API Routes (if no separate backend)

\`\`\`typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
\`\`\`

### Form with Server Actions

\`\`\`tsx
// app/contact/page.tsx
import { submitContactForm } from './actions';

export default function ContactPage() {
  return (
    <form action={submitContactForm}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <button type="submit">Send</button>
    </form>
  );
}

// app/contact/actions.ts
"use server";

export async function submitContactForm(formData: FormData) {
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  // Process form...

  return { success: true };
}
\`\`\`

### UI/UX Requirements

- Use semantic HTML (\`<main>\`, \`<nav>\`, \`<article>\`, \`<section>\`)
- One \`<h1>\` per page, hierarchical headings
- Implement responsive design (mobile-first)
- Add proper loading states with \`loading.tsx\`
- Keyboard navigation support
- ARIA labels where needed
- Color contrast ratio 4.5:1 minimum

### Header/Navbar Best Practices

\`\`\`tsx
// GOOD: Full-width header
<header className="sticky top-0 z-50 border-b bg-background">
  <div className="flex h-14 w-full items-center justify-between px-4">
    {/* Logo on left, Nav on right */}
  </div>
</header>

// BAD: Header with gaps
<header>
  <div className="container mx-auto"> {/* Don't use for headers! */}
\`\`\`

### What NOT to Do (Next.js specific)

- Never use outdated patterns (pages router, getServerSideProps, getStaticProps)
- Never create Python, Ruby, or non-TypeScript files
- Never mix Server and Client logic in same component without "use client"`;
