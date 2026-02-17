import { Module } from "@nestjs/common";
import { TerminalController } from "./terminal.controller";
import { TerminalService } from "./terminal.service";
import { ProjectModule } from "../project/project.module";

@Module({
  imports: [ProjectModule],
  controllers: [TerminalController],
  providers: [TerminalService],
  exports: [TerminalService],
})
export class TerminalModule {}
