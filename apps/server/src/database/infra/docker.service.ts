import { Injectable, Logger } from "@nestjs/common";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface DockerStatus {
  available: boolean;
  version?: string;
  error?: string;
}

export interface ContainerInfo {
  id: string;
  name: string;
  status: "running" | "exited" | "paused" | "created" | "unknown";
  ports: string[];
}

export interface ContainerConfig {
  name: string;
  image: string;
  port: number;
  containerPort: number;
  env: Record<string, string>;
  volumeName?: string;
}

@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);

  /**
   * Check if Docker is installed and running
   */
  async checkAvailable(): Promise<DockerStatus> {
    try {
      const { stdout } = await execAsync("docker version --format '{{.Server.Version}}'");
      const version = stdout.trim();
      this.logger.log(`Docker available: v${version}`);
      return { available: true, version };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`Docker not available: ${message}`);
      return { available: false, error: message };
    }
  }

  /**
   * Run a new container
   */
  async runContainer(config: ContainerConfig): Promise<string> {
    const envArgs = Object.entries(config.env)
      .map(([key, value]) => `-e ${key}=${value}`)
      .join(" ");

    const volumeArg = config.volumeName
      ? `-v ${config.volumeName}:/var/lib/postgresql/data`
      : "";

    const command = `docker run -d --name ${config.name} -p ${config.port}:${config.containerPort} ${envArgs} ${volumeArg} ${config.image}`;

    this.logger.log(`Running container: ${config.name}`);

    try {
      const { stdout } = await execAsync(command);
      const containerId = stdout.trim();
      this.logger.log(`Container started: ${containerId.substring(0, 12)}`);
      return containerId;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to run container: ${message}`);
      throw new Error(`Failed to run container: ${message}`);
    }
  }

  /**
   * Get container status by name or ID
   */
  async getContainerStatus(nameOrId: string): Promise<ContainerInfo | null> {
    try {
      const { stdout } = await execAsync(
        `docker inspect --format '{{.Id}},{{.Name}},{{.State.Status}}' ${nameOrId}`
      );

      const [id, name, status] = stdout.trim().split(",");

      return {
        id,
        name: name.replace(/^\//, ""), // Remove leading slash
        status: this.parseStatus(status),
        ports: [],
      };
    } catch {
      return null;
    }
  }

  /**
   * Start a stopped container
   */
  async startContainer(nameOrId: string): Promise<void> {
    this.logger.log(`Starting container: ${nameOrId}`);
    try {
      await execAsync(`docker start ${nameOrId}`);
      this.logger.log(`Container started: ${nameOrId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to start container: ${message}`);
      throw new Error(`Failed to start container: ${message}`);
    }
  }

  /**
   * Stop a running container
   */
  async stopContainer(nameOrId: string): Promise<void> {
    this.logger.log(`Stopping container: ${nameOrId}`);
    try {
      await execAsync(`docker stop ${nameOrId}`);
      this.logger.log(`Container stopped: ${nameOrId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to stop container: ${message}`);
      throw new Error(`Failed to stop container: ${message}`);
    }
  }

  /**
   * Remove a container
   */
  async removeContainer(nameOrId: string, force: boolean = false): Promise<void> {
    this.logger.log(`Removing container: ${nameOrId}`);
    try {
      const forceFlag = force ? "-f" : "";
      await execAsync(`docker rm ${forceFlag} ${nameOrId}`);
      this.logger.log(`Container removed: ${nameOrId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to remove container: ${message}`);
      throw new Error(`Failed to remove container: ${message}`);
    }
  }

  /**
   * List all ClaudeShip database containers
   */
  async listClaudeShipContainers(): Promise<ContainerInfo[]> {
    try {
      const { stdout } = await execAsync(
        `docker ps -a --filter "name=claudeship-db-" --format "{{.ID}},{{.Names}},{{.Status}},{{.Ports}}"`
      );

      if (!stdout.trim()) {
        return [];
      }

      return stdout
        .trim()
        .split("\n")
        .map((line) => {
          const [id, name, status, ports] = line.split(",");
          return {
            id,
            name,
            status: this.parseStatusFromPs(status),
            ports: ports ? ports.split(",").map((p) => p.trim()) : [],
          };
        });
    } catch {
      return [];
    }
  }

  /**
   * Check if a port is available
   */
  async isPortAvailable(port: number): Promise<boolean> {
    try {
      // Check if any process is using the port
      await execAsync(`lsof -i:${port}`);
      return false; // Port is in use
    } catch {
      return true; // Port is available (lsof returns error if nothing found)
    }
  }

  /**
   * Find an available port in a range
   */
  async findAvailablePort(start: number = 5432, end: number = 5500): Promise<number> {
    for (let port = start; port <= end; port++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    throw new Error(`No available port found in range ${start}-${end}`);
  }

  /**
   * Execute command inside container
   */
  async exec(nameOrId: string, command: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`docker exec ${nameOrId} ${command}`);
      return stdout.trim();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to exec in container: ${message}`);
    }
  }

  private parseStatus(status: string): ContainerInfo["status"] {
    switch (status.toLowerCase()) {
      case "running":
        return "running";
      case "exited":
        return "exited";
      case "paused":
        return "paused";
      case "created":
        return "created";
      default:
        return "unknown";
    }
  }

  private parseStatusFromPs(status: string): ContainerInfo["status"] {
    const lower = status.toLowerCase();
    if (lower.includes("up")) return "running";
    if (lower.includes("exited")) return "exited";
    if (lower.includes("paused")) return "paused";
    if (lower.includes("created")) return "created";
    return "unknown";
  }
}
