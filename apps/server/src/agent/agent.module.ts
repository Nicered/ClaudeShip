import { Module } from "@nestjs/common";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";
import { ProjectModule } from "../project/project.module";
import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [ProjectModule, ChatModule],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
