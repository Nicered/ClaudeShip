<p align="center">
  <img src="https://raw.githubusercontent.com/Nicered/ClaudeShip/main/docs/public/logo.svg" alt="ClaudeShip" width="120">
</p>

<h1 align="center">ClaudeShip</h1>

<p align="center">
  <strong>AI-Powered Web Development Environment</strong><br>
  Describe what you want → Watch AI build it → See live preview
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/claudeship"><img src="https://img.shields.io/npm/v/claudeship.svg" alt="npm"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></a>
</p>

<p align="center">
  <a href="https://nicered.github.io/ClaudeShip">Website</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a>
</p>

---

## What is ClaudeShip?

ClaudeShip is an **AI-powered development environment** that lets you build web applications using natural language.

Instead of writing code line by line, simply describe what you want to build. The AI generates code, installs packages, and runs your app in real-time. Think of it as **Replit + Cursor** combined into a local development environment.

### Why ClaudeShip?

| Traditional Way | ClaudeShip |
|----------------|------------|
| Write code manually | Describe in natural language |
| Build → Refresh → Repeat | Real-time live preview |
| Debug error messages | AI auto-fixes issues |
| Search documentation | Solve through conversation |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ClaudeShip Interface                         │
├──────────────┬────────────────────────┬────────────────────────────┤
│              │                        │                            │
│   📁 Files   │      💬 Chat           │      👁 Live Preview       │
│              │                        │                            │
│   src/       │  You: "Create a       │   ┌──────────────────┐     │
│   ├─ app/    │        todo app"      │   │   My Todo List   │     │
│   ├─ comp/   │                        │   │   ☐ Learn AI     │     │
│   └─ lib/    │  AI: Creating todo     │   │   ☑ Setup env    │     │
│              │      app with...       │   └──────────────────┘     │
│              │                        │                            │
└──────────────┴────────────────────────┴────────────────────────────┘
```

1. **💬 Chat** — Describe what you want to build in natural language
2. **⚡ Generate** — AI creates code, installs packages, sets up file structure
3. **👁 Preview** — Changes are reflected in the live preview in real-time
4. **🔄 Iterate** — Keep chatting to add features and make changes

---

## Features

### 🗣 Natural Language Development
```
"Create a login page"
"Add a dark mode toggle"
"Connect to a database and show user list"
```

### 💾 Conversation Memory
Your chat history is saved, so you can continue where you left off. No need to re-explain context — just keep the conversation going naturally.

### ⚡ Auto-Refresh Preview
Preview automatically refreshes when code changes. Like Replit, it detects file changes and reflects them instantly.

### 📂 File Explorer
Browse your project structure in a tree view. Click any file to view its contents with syntax highlighting.

### 🔧 Full-Stack Support

| Configuration | Frontend | Backend | Database |
|---------------|----------|---------|----------|
| **Frontend Only** | Next.js 15 | — | — |
| **+ Express** | Next.js 15 | Express + Prisma | SQLite |
| **+ FastAPI** | Next.js 15 | FastAPI + SQLAlchemy | SQLite |

### 🌐 Internationalization
English and Korean UI support. Switch languages anytime from the header.

---

## Quick Start

### One Command

```bash
npx claudeship
```

Open [http://localhost:13000](http://localhost:13000) and start building!

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **Claude Code CLI** — [claude.ai/code](https://claude.ai/code)

```bash
# Check requirements
npx claudeship doctor
```

### Installation Options

```bash
# Option 1: npx (Recommended)
npx claudeship

# Option 2: Global install
npm install -g claudeship
claudeship start

# Option 3: From source
git clone https://github.com/nicered/claudeship.git
cd claudeship
pnpm install
pnpm dev
```

### CLI Options

```bash
claudeship              # Start ClaudeShip
claudeship doctor       # Check system requirements
claudeship -p 3000      # Custom web port
claudeship -s 4000      # Custom API port
```

---

## Example Prompts

```
"Create a blog with markdown support and dark theme"

"Build a dashboard showing sales charts"

"Make a kanban board with drag-and-drop tasks"

"Create a user authentication API with JWT"

"Add form validation with error messages to the signup page"
```

---

## Architecture

```
claudeship/
├── apps/
│   ├── web/              # Next.js 15 frontend
│   │   ├── components/   # Chat, Preview, FileExplorer
│   │   ├── stores/       # Zustand state
│   │   └── lib/          # Utilities, i18n
│   │
│   └── server/           # NestJS 10 backend
│       ├── chat/         # Claude Code CLI integration
│       ├── project/      # Project management
│       ├── preview/      # Dev server + file watcher
│       └── file/         # File tree API
│
├── packages/
│   └── shared/           # TypeScript types
│
└── projects/             # User projects (gitignored)
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, shadcn/ui, Tailwind CSS, Zustand |
| Backend | NestJS 10, Prisma, SQLite, SSE |
| AI | Claude Code CLI (streaming) |
| File Watch | chokidar |

---

## Development

```bash
pnpm dev          # Start all dev servers
pnpm build        # Production build
pnpm type-check   # TypeScript check
pnpm lint         # Run ESLint
```

---

## Contributing

Contributions are welcome! Please follow the commit message convention:

```
[TYPE] Title

- Bullet point (max 4 lines)
```

**Types**: `FEAT`, `FIX`, `DOCS`, `STYLE`, `REFACTOR`, `TEST`, `CHORE`, `PERF`, `CI`, `BUILD`

---

## License

MIT
