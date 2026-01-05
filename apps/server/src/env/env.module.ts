import { Module } from "@nestjs/common";
import { EnvController } from "./env.controller";
import { EnvService } from "./env.service";
import { ProjectModule } from "../project/project.module";

@Module({
  imports: [ProjectModule],
  controllers: [EnvController],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
