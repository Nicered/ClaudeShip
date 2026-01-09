import { Injectable, Logger } from "@nestjs/common";
import { DockerService, DockerStatus } from "./docker.service";
import {
  PostgresContainerService,
  PostgresDatabaseConfig,
} from "./postgres-container.service";
import { SqliteInfraService, SqliteDatabaseConfig } from "./sqlite-infra.service";

export type DatabaseProvider = "postgres_docker" | "sqlite";

export type DatabaseConfig = PostgresDatabaseConfig | SqliteDatabaseConfig;

export interface InfraStatus {
  docker: DockerStatus;
  defaultProvider: DatabaseProvider;
}

export interface ProjectDatabaseStatus {
  provider: DatabaseProvider;
  status: "running" | "stopped" | "not_created" | "error";
  url?: string;
  error?: string;
}

@Injectable()
export class DatabaseInfraService {
  private readonly logger = new Logger(DatabaseInfraService.name);

  // Cache Docker status to avoid repeated checks
  private dockerStatusCache: DockerStatus | null = null;
  private dockerStatusCacheTime: number = 0;
  private readonly CACHE_TTL_MS = 60000; // 1 minute

  constructor(
    private dockerService: DockerService,
    private postgresService: PostgresContainerService,
    private sqliteService: SqliteInfraService
  ) {}

  /**
   * Get infrastructure status
   */
  async getInfraStatus(): Promise<InfraStatus> {
    const docker = await this.getDockerStatus();

    return {
      docker,
      defaultProvider: docker.available ? "postgres_docker" : "sqlite",
    };
  }

  /**
   * Create database for a project
   * Automatically selects provider based on Docker availability
   */
  async createDatabase(
    projectId: string,
    projectPath: string
  ): Promise<DatabaseConfig> {
    const docker = await this.getDockerStatus();

    if (docker.available) {
      this.logger.log(
        `Docker available, creating PostgreSQL container for project ${projectId}`
      );

      try {
        const config = await this.postgresService.createForProject(projectId);
        this.logger.log(`PostgreSQL database created for project ${projectId}`);
        return config;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        this.logger.warn(
          `Failed to create PostgreSQL container, falling back to SQLite: ${message}`
        );
        // Fall back to SQLite
        return this.createSqliteDatabase(projectId, projectPath);
      }
    }

    this.logger.log(
      `Docker not available, creating SQLite database for project ${projectId}`
    );
    return this.createSqliteDatabase(projectId, projectPath);
  }

  /**
   * Create SQLite database (fallback)
   */
  private async createSqliteDatabase(
    projectId: string,
    projectPath: string
  ): Promise<SqliteDatabaseConfig> {
    const config = await this.sqliteService.createForProject(
      projectId,
      projectPath
    );
    this.logger.log(`SQLite database created for project ${projectId}`);
    return config;
  }

  /**
   * Get database status for a project
   */
  async getDatabaseStatus(
    projectId: string,
    projectPath: string,
    currentProvider?: DatabaseProvider
  ): Promise<ProjectDatabaseStatus> {
    // Check PostgreSQL container first if it was the provider
    if (!currentProvider || currentProvider === "postgres_docker") {
      const postgresStatus = await this.postgresService.getStatus(projectId);

      if (postgresStatus.exists) {
        return {
          provider: "postgres_docker",
          status: postgresStatus.running ? "running" : "stopped",
          url: postgresStatus.config?.url,
        };
      }
    }

    // Check SQLite
    if (!currentProvider || currentProvider === "sqlite") {
      const sqliteConfig = await this.sqliteService.getConfig(projectPath);

      if (sqliteConfig) {
        return {
          provider: "sqlite",
          status: "running", // SQLite is always "running" if file exists
          url: sqliteConfig.url,
        };
      }
    }

    return {
      provider: currentProvider || "sqlite",
      status: "not_created",
    };
  }

  /**
   * Start database for a project
   */
  async startDatabase(
    projectId: string,
    provider: DatabaseProvider
  ): Promise<void> {
    if (provider === "postgres_docker") {
      await this.postgresService.start(projectId);
      this.logger.log(`PostgreSQL database started for project ${projectId}`);
    }
    // SQLite doesn't need to be started
  }

  /**
   * Stop database for a project
   */
  async stopDatabase(
    projectId: string,
    provider: DatabaseProvider
  ): Promise<void> {
    if (provider === "postgres_docker") {
      await this.postgresService.stop(projectId);
      this.logger.log(`PostgreSQL database stopped for project ${projectId}`);
    }
    // SQLite doesn't need to be stopped
  }

  /**
   * Delete database for a project
   */
  async deleteDatabase(
    projectId: string,
    projectPath: string,
    provider: DatabaseProvider,
    removeData: boolean = false
  ): Promise<void> {
    if (provider === "postgres_docker") {
      await this.postgresService.remove(projectId, removeData);
      this.logger.log(`PostgreSQL database removed for project ${projectId}`);
    } else {
      if (removeData) {
        await this.sqliteService.delete(projectPath);
        this.logger.log(`SQLite database removed for project ${projectId}`);
      }
    }
  }

  /**
   * Get cached Docker status
   */
  private async getDockerStatus(): Promise<DockerStatus> {
    const now = Date.now();

    if (
      this.dockerStatusCache &&
      now - this.dockerStatusCacheTime < this.CACHE_TTL_MS
    ) {
      return this.dockerStatusCache;
    }

    this.dockerStatusCache = await this.dockerService.checkAvailable();
    this.dockerStatusCacheTime = now;

    return this.dockerStatusCache;
  }

  /**
   * Clear Docker status cache (useful after Docker is started)
   */
  clearDockerCache(): void {
    this.dockerStatusCache = null;
    this.dockerStatusCacheTime = 0;
  }
}
