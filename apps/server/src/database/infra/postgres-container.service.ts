import { Injectable, Logger } from "@nestjs/common";
import { DockerService } from "./docker.service";
import { randomBytes } from "crypto";

export interface PostgresDatabaseConfig {
  provider: "postgres_docker";
  url: string;
  containerId: string;
  containerName: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface PostgresContainerStatus {
  exists: boolean;
  running: boolean;
  config?: PostgresDatabaseConfig;
}

const POSTGRES_IMAGE = "postgres:16-alpine";
const CONTAINER_PREFIX = "claudeship-db-";
const VOLUME_PREFIX = "claudeship-data-";
const DEFAULT_DATABASE = "claudeship";
const DEFAULT_USERNAME = "claudeship";
const PORT_RANGE_START = 5432;
const PORT_RANGE_END = 5500;
const READY_CHECK_ATTEMPTS = 30;
const READY_CHECK_INTERVAL_MS = 1000;

@Injectable()
export class PostgresContainerService {
  private readonly logger = new Logger(PostgresContainerService.name);

  constructor(private dockerService: DockerService) {}

  /**
   * Create PostgreSQL container for a project
   */
  async createForProject(projectId: string): Promise<PostgresDatabaseConfig> {
    const containerName = this.getContainerName(projectId);
    const volumeName = this.getVolumeName(projectId);

    this.logger.log(`Creating PostgreSQL container for project ${projectId}`);

    // Check if container already exists
    const existingStatus = await this.getStatus(projectId);
    if (existingStatus.exists) {
      this.logger.log(`Container already exists: ${containerName}`);
      if (!existingStatus.running) {
        await this.start(projectId);
      }
      return existingStatus.config!;
    }

    // Find available port
    const port = await this.dockerService.findAvailablePort(
      PORT_RANGE_START,
      PORT_RANGE_END
    );

    // Generate password
    const password = this.generatePassword();

    // Run container
    const containerId = await this.dockerService.runContainer({
      name: containerName,
      image: POSTGRES_IMAGE,
      port,
      containerPort: 5432,
      env: {
        POSTGRES_USER: DEFAULT_USERNAME,
        POSTGRES_PASSWORD: password,
        POSTGRES_DB: DEFAULT_DATABASE,
      },
      volumeName,
    });

    // Wait for PostgreSQL to be ready
    await this.waitForReady(containerName);

    const config: PostgresDatabaseConfig = {
      provider: "postgres_docker",
      url: `postgresql://${DEFAULT_USERNAME}:${password}@localhost:${port}/${DEFAULT_DATABASE}`,
      containerId,
      containerName,
      port,
      database: DEFAULT_DATABASE,
      username: DEFAULT_USERNAME,
      password,
    };

    this.logger.log(
      `PostgreSQL container created: ${containerName} on port ${port}`
    );

    return config;
  }

  /**
   * Get container status for a project
   */
  async getStatus(projectId: string): Promise<PostgresContainerStatus> {
    const containerName = this.getContainerName(projectId);
    const containerInfo = await this.dockerService.getContainerStatus(containerName);

    if (!containerInfo) {
      return { exists: false, running: false };
    }

    const running = containerInfo.status === "running";

    // Note: We can't retrieve the password from an existing container
    // This is a limitation - password would need to be stored somewhere
    return {
      exists: true,
      running,
      config: {
        provider: "postgres_docker",
        url: "", // Cannot retrieve without stored password
        containerId: containerInfo.id,
        containerName: containerInfo.name,
        port: 0, // Would need to parse from ports
        database: DEFAULT_DATABASE,
        username: DEFAULT_USERNAME,
        password: "", // Cannot retrieve
      },
    };
  }

  /**
   * Start PostgreSQL container for a project
   */
  async start(projectId: string): Promise<void> {
    const containerName = this.getContainerName(projectId);
    this.logger.log(`Starting PostgreSQL container: ${containerName}`);
    await this.dockerService.startContainer(containerName);
    await this.waitForReady(containerName);
    this.logger.log(`PostgreSQL container started: ${containerName}`);
  }

  /**
   * Stop PostgreSQL container for a project
   */
  async stop(projectId: string): Promise<void> {
    const containerName = this.getContainerName(projectId);
    this.logger.log(`Stopping PostgreSQL container: ${containerName}`);
    await this.dockerService.stopContainer(containerName);
    this.logger.log(`PostgreSQL container stopped: ${containerName}`);
  }

  /**
   * Remove PostgreSQL container for a project
   */
  async remove(projectId: string, removeVolume: boolean = false): Promise<void> {
    const containerName = this.getContainerName(projectId);
    this.logger.log(`Removing PostgreSQL container: ${containerName}`);

    // Stop if running
    const status = await this.getStatus(projectId);
    if (status.running) {
      await this.stop(projectId);
    }

    // Remove container
    if (status.exists) {
      await this.dockerService.removeContainer(containerName);
    }

    // Remove volume if requested
    if (removeVolume) {
      const volumeName = this.getVolumeName(projectId);
      try {
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);
        await execAsync(`docker volume rm ${volumeName}`);
        this.logger.log(`Volume removed: ${volumeName}`);
      } catch {
        // Volume might not exist
        this.logger.warn(`Failed to remove volume: ${volumeName}`);
      }
    }

    this.logger.log(`PostgreSQL container removed: ${containerName}`);
  }

  /**
   * Wait for PostgreSQL to be ready
   */
  private async waitForReady(containerName: string): Promise<void> {
    this.logger.log(`Waiting for PostgreSQL to be ready: ${containerName}`);

    for (let i = 0; i < READY_CHECK_ATTEMPTS; i++) {
      try {
        await this.dockerService.exec(containerName, "pg_isready -U claudeship");
        this.logger.log(`PostgreSQL is ready: ${containerName}`);
        return;
      } catch {
        await this.sleep(READY_CHECK_INTERVAL_MS);
      }
    }

    throw new Error(
      `PostgreSQL container ${containerName} failed to become ready after ${READY_CHECK_ATTEMPTS} attempts`
    );
  }

  /**
   * Generate a secure random password
   */
  private generatePassword(): string {
    return randomBytes(16).toString("hex");
  }

  /**
   * Get container name for a project
   */
  private getContainerName(projectId: string): string {
    // Use first 8 characters of project ID for container name
    return `${CONTAINER_PREFIX}${projectId.substring(0, 8)}`;
  }

  /**
   * Get volume name for a project
   */
  private getVolumeName(projectId: string): string {
    return `${VOLUME_PREFIX}${projectId.substring(0, 8)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
