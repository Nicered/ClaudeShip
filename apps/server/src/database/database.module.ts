import { Module, forwardRef } from "@nestjs/common";
import { DatabaseController } from "./database.controller";
import { DatabaseService } from "./database.service";
import { ProjectModule } from "../project/project.module";
import { DockerService } from "./infra/docker.service";
import { SqliteInfraService } from "./infra/sqlite-infra.service";
import { PostgresContainerService } from "./infra/postgres-container.service";
import { DatabaseInfraService } from "./infra/database-infra.service";
import { DatabaseInfraController } from "./infra/database-infra.controller";

@Module({
  imports: [forwardRef(() => ProjectModule)],
  controllers: [DatabaseController, DatabaseInfraController],
  providers: [
    DatabaseService,
    DockerService,
    SqliteInfraService,
    PostgresContainerService,
    DatabaseInfraService,
  ],
  exports: [DatabaseService, DatabaseInfraService],
})
export class DatabaseModule {}
