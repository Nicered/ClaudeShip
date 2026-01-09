import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  DatabaseInfraService,
  InfraStatus,
  ProjectDatabaseStatus,
  DatabaseProvider,
} from "./database-infra.service";
import { ProjectService } from "../../project/project.service";

@Controller("api/database")
export class DatabaseInfraController {
  constructor(
    private databaseInfraService: DatabaseInfraService,
    private projectService: ProjectService
  ) {}

  /**
   * Get infrastructure status (Docker availability, etc.)
   */
  @Get("status")
  async getInfraStatus(): Promise<InfraStatus> {
    return this.databaseInfraService.getInfraStatus();
  }

  /**
   * Refresh Docker status (clear cache)
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshStatus(): Promise<InfraStatus> {
    this.databaseInfraService.clearDockerCache();
    return this.databaseInfraService.getInfraStatus();
  }

  /**
   * Get database status for a project
   */
  @Get("projects/:projectId")
  async getProjectDatabaseStatus(
    @Param("projectId") projectId: string,
    @Query("provider") provider?: DatabaseProvider
  ): Promise<ProjectDatabaseStatus> {
    const projectPath = await this.projectService.getProjectPath(projectId);
    return this.databaseInfraService.getDatabaseStatus(
      projectId,
      projectPath,
      provider
    );
  }

  /**
   * Create database for a project
   */
  @Post("projects/:projectId")
  async createProjectDatabase(
    @Param("projectId") projectId: string
  ): Promise<ProjectDatabaseStatus> {
    const projectPath = await this.projectService.getProjectPath(projectId);
    const config = await this.databaseInfraService.createDatabase(
      projectId,
      projectPath
    );

    return {
      provider: config.provider,
      status: "running",
      url: config.url,
    };
  }

  /**
   * Start database for a project
   */
  @Post("projects/:projectId/start")
  @HttpCode(HttpStatus.OK)
  async startProjectDatabase(
    @Param("projectId") projectId: string,
    @Query("provider") provider: DatabaseProvider = "postgres_docker"
  ): Promise<ProjectDatabaseStatus> {
    const projectPath = await this.projectService.getProjectPath(projectId);

    await this.databaseInfraService.startDatabase(projectId, provider);

    return this.databaseInfraService.getDatabaseStatus(
      projectId,
      projectPath,
      provider
    );
  }

  /**
   * Stop database for a project
   */
  @Post("projects/:projectId/stop")
  @HttpCode(HttpStatus.OK)
  async stopProjectDatabase(
    @Param("projectId") projectId: string,
    @Query("provider") provider: DatabaseProvider = "postgres_docker"
  ): Promise<ProjectDatabaseStatus> {
    const projectPath = await this.projectService.getProjectPath(projectId);

    await this.databaseInfraService.stopDatabase(projectId, provider);

    return this.databaseInfraService.getDatabaseStatus(
      projectId,
      projectPath,
      provider
    );
  }

  /**
   * Delete database for a project
   */
  @Delete("projects/:projectId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProjectDatabase(
    @Param("projectId") projectId: string,
    @Query("provider") provider: DatabaseProvider = "postgres_docker",
    @Query("removeData") removeData: string = "false"
  ): Promise<void> {
    const projectPath = await this.projectService.getProjectPath(projectId);

    await this.databaseInfraService.deleteDatabase(
      projectId,
      projectPath,
      provider,
      removeData === "true"
    );
  }
}
