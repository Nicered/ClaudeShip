import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ProjectModule } from "./project/project.module";
import { ChatModule } from "./chat/chat.module";
import { PreviewModule } from "./preview/preview.module";
import { FileModule } from "./file/file.module";
import { SettingsModule } from "./settings/settings.module";
import { DatabaseModule } from "./database/database.module";
import { TestingModule } from "./testing/testing.module";
import { CheckpointModule } from "./checkpoint/checkpoint.module";
import { ProjectContextModule } from "./project-context/project-context.module";
import { EnvModule } from "./env/env.module";
import { ArchitectModule } from "./architect/architect.module";
import { AgentModule } from "./agent/agent.module";
import { TerminalModule } from "./terminal/terminal.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    ProjectModule,
    ChatModule,
    PreviewModule,
    FileModule,
    SettingsModule,
    DatabaseModule,
    TestingModule,
    CheckpointModule,
    ProjectContextModule,
    EnvModule,
    ArchitectModule,
    AgentModule,
    TerminalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
