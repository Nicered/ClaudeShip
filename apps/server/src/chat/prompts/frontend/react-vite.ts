/**
 * React + Vite Frontend Prompt
 *
 * React + Vite + Tailwind CSS 프론트엔드 개발 가이드
 */

export const REACT_VITE_PROMPT = `## Frontend: React + Vite + Tailwind CSS

You are building a React application using Vite as the build tool and Tailwind CSS for styling.

### Technology Stack (Frontend)

| Category | Technology | Notes |
|----------|------------|-------|
| Build Tool | Vite | Fast HMR and build |
| Framework | React 18+ | Functional components with hooks |
| Language | TypeScript | Strict mode |
| UI Components | shadcn/ui | Install: \`npx shadcn@latest add <component>\` |
| Styling | Tailwind CSS | Use design tokens |
| State | Zustand | For global state |
| Forms | React Hook Form + Zod | For validation |
| Icons | Lucide React | Consistent iconography |
| Routing | React Router | Client-side routing |

### Project Initialization

\`\`\`bash
# Create Vite project
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install react-router-dom zustand lucide-react clsx tailwind-merge
npm install react-hook-form @hookform/resolvers zod

# Setup Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Initialize shadcn/ui
npx shadcn@latest init -d
\`\`\`

### Project Structure

\`\`\`
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── [feature]/       # Feature-specific components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── lib/
│   ├── utils.ts         # cn() helper
│   └── api.ts           # API client (if backend exists)
├── store/               # Zustand stores
├── types/               # TypeScript types
├── App.tsx              # Main app with router
├── main.tsx             # Entry point
└── index.css            # Tailwind imports
\`\`\`

### Vite Configuration

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
\`\`\`

### Router Setup

\`\`\`typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
\`\`\`

### State Management (Zustand)

\`\`\`typescript
// src/store/useStore.ts
import { create } from 'zustand';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
\`\`\`

### API Client Pattern

\`\`\`typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(\`\${API_URL}\${endpoint}\`);
    if (!res.ok) throw new Error(\`API Error: \${res.status}\`);
    return res.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const res = await fetch(\`\${API_URL}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(\`API Error: \${res.status}\`);
    return res.json();
  }
}

export const api = new ApiClient();
\`\`\`

### UI/UX Requirements

- Use semantic HTML (header, main, footer, nav, section)
- Implement responsive design (mobile-first)
- Use shadcn/ui Button, Card, Input, etc.
- Add hover/focus states for interactive elements
- Include loading spinners for async operations
- Show toast notifications for user feedback

### Header/Navbar Best Practices

- **NEVER use \`container\` class for headers** - it creates max-width gaps on wide screens
- Use \`w-full\` for full-width headers that span the entire viewport

\`\`\`tsx
// GOOD: Full-width header
<header className="sticky top-0 z-50 border-b bg-background">
  <div className="flex h-14 w-full items-center justify-between px-4">
    {/* Logo on left, Nav on right */}
  </div>
</header>
\`\`\`

### React Best Practices

- **Custom hooks** for logic reuse (\`useAuth\`, \`useProducts\`)
- **Memoization** for expensive operations (\`useMemo\`, \`useCallback\`)
- **Proper dependency arrays** in useEffect
- **Loading/Error states**: Always handle loading, error, and empty states
- **Lazy loading** for code splitting with \`React.lazy()\``;
