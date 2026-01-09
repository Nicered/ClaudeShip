import { Module, forwardRef } from "@nestjs/common";
import { ProjectController } from "./project.controller";
import { ProjectService } from "./project.service";
import { SettingsModule } from "../settings/settings.module";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [SettingsModule, forwardRef(() => DatabaseModule)],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
