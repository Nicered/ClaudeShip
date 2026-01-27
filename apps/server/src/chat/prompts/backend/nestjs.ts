/**
 * NestJS Backend Prompt
 *
 * NestJS + TypeScript + Prisma 백엔드 개발 가이드
 */

export const NESTJS_PROMPT = `## Backend: NestJS + TypeScript + Prisma

You are building a NestJS backend with TypeScript and Prisma ORM.

### Technology Stack (Backend)

| Category | Technology | Notes |
|----------|------------|-------|
| Runtime | Node.js 20+ | LTS version |
| Framework | NestJS 10+ | Enterprise-grade |
| Language | TypeScript | Strict mode |
| ORM | Prisma | Type-safe database access |
| Database | SQLite (dev) / PostgreSQL (prod) | |
| Validation | class-validator | DTO validation |

### Project Structure

\`\`\`
backend/
├── src/
│   ├── main.ts                  # Entry point
│   ├── app.module.ts            # Root module
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── dto/
│           ├── create-user.dto.ts
│           └── update-user.dto.ts
├── prisma/
│   └── schema.prisma
├── package.json
└── tsconfig.json
\`\`\`

### Backend Setup

\`\`\`bash
cd backend
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata rxjs
npm install class-validator class-transformer
npm install prisma @prisma/client
npm install -D typescript @types/node @types/express ts-node
npx prisma init --datasource-provider sqlite
\`\`\`

### Main Entry Point

\`\`\`typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3001);
  console.log('Server running on http://localhost:3001');
}
bootstrap();
\`\`\`

### App Module

\`\`\`typescript
// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
})
export class AppModule {}
\`\`\`

### Prisma Service

\`\`\`typescript
// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
\`\`\`

\`\`\`typescript
// backend/src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
\`\`\`

### DTOs with Validation

\`\`\`typescript
// backend/src/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;
}
\`\`\`

\`\`\`typescript
// backend/src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
\`\`\`

### Service

\`\`\`typescript
// backend/src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(\`User #\${id} not found\`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Check existence
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check existence
    return this.prisma.user.delete({ where: { id } });
  }
}
\`\`\`

### Controller

\`\`\`typescript
// backend/src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
\`\`\`

### Module

\`\`\`typescript
// backend/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
\`\`\`

### API Design Guidelines

- **Decorators for everything**: @Controller, @Get, @Post, etc.
- **DTOs for validation**: Use class-validator decorators
- **Dependency Injection**: Inject services via constructor
- **Exception filters**: Use built-in exceptions (NotFoundException, etc.)
- **Pipes for transformation**: ParseIntPipe, ValidationPipe`;
