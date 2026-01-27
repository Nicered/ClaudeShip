/**
 * SvelteKit Frontend Prompt
 *
 * SvelteKit + Tailwind CSS 프론트엔드 개발 가이드
 */

export const SVELTE_PROMPT = `## Frontend: SvelteKit + Tailwind CSS

You are building a SvelteKit application with Tailwind CSS.

### Technology Stack (Frontend)

| Category | Technology | Notes |
|----------|------------|-------|
| Framework | SvelteKit | File-based routing |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | Use design tokens |
| State | Svelte stores | Built-in reactivity |
| Forms | Superforms + Zod | For validation |
| Icons | Lucide Svelte | Consistent iconography |

### Project Initialization

\`\`\`bash
# Create SvelteKit project
npx sv create . --template minimal --types ts

# Install dependencies
npm install lucide-svelte clsx tailwind-merge
npm install sveltekit-superforms zod

# Setup Tailwind CSS
npx svelte-add@latest tailwindcss
\`\`\`

### Project Structure

\`\`\`
src/
├── routes/
│   ├── +layout.svelte     # Root layout
│   ├── +page.svelte       # Home page
│   ├── +error.svelte      # Error page
│   ├── about/
│   │   └── +page.svelte
│   └── api/               # API routes
│       └── users/
│           └── +server.ts
├── lib/
│   ├── components/        # Reusable components
│   │   └── ui/
│   ├── stores/            # Svelte stores
│   └── utils.ts           # Utilities
├── app.html               # HTML template
├── app.css                # Global styles
└── app.d.ts               # Type declarations
\`\`\`

### Component Pattern

\`\`\`svelte
<!-- src/lib/components/UserCard.svelte -->
<script lang="ts">
  import type { User } from '$lib/types';

  export let user: User;
  export let showEmail = true;

  $: initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ select: User }>();

  const handleClick = () => {
    dispatch('select', user);
  };
</script>

<div
  class="p-4 border rounded-lg hover:border-primary cursor-pointer"
  on:click={handleClick}
  on:keypress={handleClick}
  role="button"
  tabindex="0"
>
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
      {initials}
    </div>
    <div>
      <h3 class="font-medium">{user.name}</h3>
      {#if showEmail}
        <p class="text-sm text-muted-foreground">{user.email}</p>
      {/if}
    </div>
  </div>
</div>
\`\`\`

### Svelte Store

\`\`\`typescript
// src/lib/stores/userStore.ts
import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';

function createUserStore() {
  const users = writable<User[]>([]);
  const isLoading = writable(false);
  const error = writable<string | null>(null);

  const userCount = derived(users, ($users) => $users.length);

  async function fetchUsers() {
    isLoading.set(true);
    error.set(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch');
      users.set(await res.json());
    } catch (e) {
      error.set(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      isLoading.set(false);
    }
  }

  return {
    users,
    isLoading,
    error,
    userCount,
    fetchUsers,
  };
}

export const userStore = createUserStore();
\`\`\`

### Page Load Data

\`\`\`typescript
// src/routes/users/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const users = await db.user.findMany();
  return { users };
};
\`\`\`

\`\`\`svelte
<!-- src/routes/users/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import UserCard from '$lib/components/UserCard.svelte';

  export let data: PageData;
</script>

<div class="container mx-auto py-8">
  <h1 class="text-2xl font-bold mb-6">Users</h1>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.users as user (user.id)}
      <UserCard {user} />
    {/each}
  </div>
</div>
\`\`\`

### API Routes

\`\`\`typescript
// src/routes/api/users/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
  const users = await db.user.findMany();
  return json(users);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return json(user, { status: 201 });
};
\`\`\`

### Form Actions

\`\`\`typescript
// src/routes/contact/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!email || !message) {
      return fail(400, { error: 'All fields are required' });
    }

    // Process form...

    return { success: true };
  },
};
\`\`\`

\`\`\`svelte
<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
  import type { ActionData } from './$types';
  import { enhance } from '$app/forms';

  export let form: ActionData;
</script>

<form method="POST" use:enhance>
  <input name="email" type="email" required />
  <textarea name="message" required />
  <button type="submit">Send</button>

  {#if form?.error}
    <p class="text-red-500">{form.error}</p>
  {/if}
  {#if form?.success}
    <p class="text-green-500">Message sent!</p>
  {/if}
</form>
\`\`\`

### Svelte Best Practices

- **Use \`$:\` for reactive statements** - Svelte's reactivity is automatic
- **Prefer stores for shared state** - Use writable/readable/derived appropriately
- **Use \`{#each}\` with keys** - Always provide key for lists
- **Server load functions** - Fetch data on server when possible
- **Form actions** - Use SvelteKit form actions for mutations
- **\`use:enhance\`** - Progressive enhancement for forms

### What NOT to Do (Svelte specific)

- Never use React/Vue patterns - Svelte has its own idioms
- Never forget to export props with \`export let\`
- Never mutate store values directly - use \`.set()\` or \`.update()\`
- Never skip \`$:\` for reactive statements`;
