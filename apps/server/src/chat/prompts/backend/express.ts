/**
 * Express Backend Prompt
 *
 * Express + TypeScript + Prisma 백엔드 개발 가이드
 */

export const EXPRESS_PROMPT = `## Backend: Express + TypeScript + Prisma

You are building an Express.js backend with TypeScript and Prisma ORM.

### Technology Stack (Backend)

| Category | Technology | Notes |
|----------|------------|-------|
| Runtime | Node.js 20+ | LTS version |
| Framework | Express 4.x | Minimal framework |
| Language | TypeScript | Strict mode |
| ORM | Prisma | Type-safe database access |
| Database | SQLite (dev) / PostgreSQL (prod) | |
| Validation | Zod | Schema validation |

### Project Structure

\`\`\`
backend/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # Route handlers
│   ├── controllers/      # Request/response handling
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   └── types/            # TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema
├── package.json
└── tsconfig.json
\`\`\`

### Backend Setup

\`\`\`bash
cd backend
npm init -y
npm install express cors dotenv zod
npm install -D typescript @types/express @types/node @types/cors ts-node nodemon
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
\`\`\`

### package.json scripts

\`\`\`json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
\`\`\`

### tsconfig.json

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
\`\`\`

### Server Setup Pattern

\`\`\`typescript
// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import usersRouter from './routes/users';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', usersRouter);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
\`\`\`

### Route Pattern with Zod Validation

\`\`\`typescript
// backend/src/routes/users.ts
import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// POST /api/users
router.post('/', async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await prisma.user.create({ data });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res, next) => {
  try {
    const data = createUserSchema.partial().parse(req.body);
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
\`\`\`

### Prisma Schema Example

\`\`\`prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
\`\`\`

### API Design Guidelines

- **RESTful conventions**: GET read, POST create, PUT update, DELETE delete
- **Consistent response format**: \`{ data, error, message }\`
- **Proper status codes**: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Error
- **Input validation**: Use Zod for all request body validation
- **Error messages**: User-friendly messages, log technical details

### Environment Variables

\`\`\`
# backend/.env
PORT=3001
DATABASE_URL="file:./dev.db"
\`\`\``;
