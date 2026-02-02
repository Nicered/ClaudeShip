import { Module } from "@nestjs/common";
import { ArchitectController } from "./architect.controller";
import { ArchitectService } from "./architect.service";
import { ProjectModule } from "../project/project.module";
import { ChatModule } from "../chat/chat.module";

@Module({
  imports: [ProjectModule, ChatModule],
  controllers: [ArchitectController],
  providers: [ArchitectService],
  exports: [ArchitectService],
})
export class ArchitectModule {}
