/**
 * Vue 3 + Vite Frontend Prompt
 *
 * Vue 3 Composition API + Vite + Tailwind CSS 프론트엔드 개발 가이드
 */

export const VUE_PROMPT = `## Frontend: Vue 3 + Vite + Tailwind CSS

You are building a Vue 3 application using Vite and the Composition API.

### Technology Stack (Frontend)

| Category | Technology | Notes |
|----------|------------|-------|
| Build Tool | Vite | Fast HMR and build |
| Framework | Vue 3 | Composition API with \`<script setup>\` |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | Use design tokens |
| State | Pinia | Official Vue store |
| Forms | VeeValidate + Zod | For validation |
| Icons | Lucide Vue Next | Consistent iconography |
| Routing | Vue Router | Client-side routing |

### Project Initialization

\`\`\`bash
# Create Vite Vue project
npm create vite@latest . -- --template vue-ts

# Install dependencies
npm install vue-router pinia @vueuse/core
npm install vee-validate @vee-validate/zod zod
npm install lucide-vue-next clsx tailwind-merge

# Setup Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

### Project Structure

\`\`\`
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── [feature]/       # Feature-specific components
├── views/               # Page components
├── composables/         # Reusable composition functions
├── stores/              # Pinia stores
├── lib/
│   ├── utils.ts         # cn() helper
│   └── api.ts           # API client
├── types/               # TypeScript types
├── router/
│   └── index.ts         # Vue Router config
├── App.vue              # Root component
├── main.ts              # Entry point
└── style.css            # Tailwind imports
\`\`\`

### Vite Configuration

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
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

### Component Pattern (script setup)

\`\`\`vue
<!-- src/components/UserCard.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { User } from '@/types';

interface Props {
  user: User;
  showEmail?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showEmail: true,
});

const emit = defineEmits<{
  (e: 'select', user: User): void;
}>();

const initials = computed(() =>
  props.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
);

const handleClick = () => {
  emit('select', props.user);
};
</script>

<template>
  <div
    class="p-4 border rounded-lg hover:border-primary cursor-pointer"
    @click="handleClick"
  >
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        {{ initials }}
      </div>
      <div>
        <h3 class="font-medium">{{ user.name }}</h3>
        <p v-if="showEmail" class="text-sm text-muted-foreground">
          {{ user.email }}
        </p>
      </div>
    </div>
  </div>
</template>
\`\`\`

### Pinia Store

\`\`\`typescript
// src/stores/useUserStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/lib/api';
import type { User } from '@/types';

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const userCount = computed(() => users.value.length);

  async function fetchUsers() {
    isLoading.value = true;
    error.value = null;
    try {
      users.value = await api.get<User[]>('/api/users');
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch users';
    } finally {
      isLoading.value = false;
    }
  }

  return { users, isLoading, error, userCount, fetchUsers };
});
\`\`\`

### Vue Router Setup

\`\`\`typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
    },
  ],
});

export default router;
\`\`\`

### Composable Pattern

\`\`\`typescript
// src/composables/useApi.ts
import { ref, computed } from 'vue';

export function useApi<T>(fetchFn: () => Promise<T>) {
  const data = ref<T | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const execute = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      data.value = await fetchFn();
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Unknown error');
    } finally {
      isLoading.value = false;
    }
  };

  const hasError = computed(() => error.value !== null);

  return { data, isLoading, error, hasError, execute };
}
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

### Vue 3 Best Practices

- **Always use \`<script setup>\`** for cleaner component code
- **Use Composition API** - no Options API
- **TypeScript for props**: Use \`defineProps<T>()\` with interfaces
- **Computed properties**: Use \`computed()\` for derived state
- **Watch wisely**: Use \`watch\` and \`watchEffect\` appropriately
- **Lifecycle hooks**: Use \`onMounted\`, \`onUnmounted\` from vue

### What NOT to Do (Vue specific)

- Never use Options API - always Composition API with \`<script setup>\`
- Never mutate props directly
- Never use \`this\` in script setup (it's undefined)
- Never forget to import ref, computed, etc. from 'vue'`;
