import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs/promises";
import * as path from "path";

export interface SqliteDatabaseConfig {
  provider: "sqlite";
  url: string;
  filePath: string;
}

@Injectable()
export class SqliteInfraService {
  private readonly logger = new Logger(SqliteInfraService.name);

  /**
   * Create SQLite database for a project
   */
  async createForProject(
    projectId: string,
    projectPath: string
  ): Promise<SqliteDatabaseConfig> {
    const dataDir = path.join(projectPath, "data");
    const dbPath = path.join(dataDir, "dev.db");

    this.logger.log(`Creating SQLite database for project ${projectId}`);

    try {
      // Create data directory if not exists
      await fs.mkdir(dataDir, { recursive: true });

      // SQLite will create the file automatically when first accessed
      // But we can touch it to ensure it exists
      const fileHandle = await fs.open(dbPath, "a");
      await fileHandle.close();

      this.logger.log(`SQLite database created at: ${dbPath}`);

      return {
        provider: "sqlite",
        url: `file:${dbPath}`,
        filePath: dbPath,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to create SQLite database: ${message}`);
      throw new Error(`Failed to create SQLite database: ${message}`);
    }
  }

  /**
   * Check if SQLite database exists for a project
   */
  async exists(projectPath: string): Promise<boolean> {
    const possiblePaths = [
      path.join(projectPath, "data", "dev.db"),
      path.join(projectPath, "prisma", "dev.db"),
      path.join(projectPath, "dev.db"),
    ];

    for (const dbPath of possiblePaths) {
      try {
        await fs.access(dbPath);
        return true;
      } catch {
        // File doesn't exist, continue checking
      }
    }

    return false;
  }

  /**
   * Find existing SQLite database path
   */
  async findDatabasePath(projectPath: string): Promise<string | null> {
    const possiblePaths = [
      path.join(projectPath, "data", "dev.db"),
      path.join(projectPath, "prisma", "dev.db"),
      path.join(projectPath, "dev.db"),
      path.join(projectPath, "database.db"),
      path.join(projectPath, "backend", "data", "dev.db"),
      path.join(projectPath, "backend", "prisma", "dev.db"),
    ];

    for (const dbPath of possiblePaths) {
      try {
        await fs.access(dbPath);
        return dbPath;
      } catch {
        // File doesn't exist, continue checking
      }
    }

    return null;
  }

  /**
   * Get database config from existing database
   */
  async getConfig(projectPath: string): Promise<SqliteDatabaseConfig | null> {
    const dbPath = await this.findDatabasePath(projectPath);

    if (!dbPath) {
      return null;
    }

    return {
      provider: "sqlite",
      url: `file:${dbPath}`,
      filePath: dbPath,
    };
  }

  /**
   * Delete SQLite database
   */
  async delete(projectPath: string): Promise<void> {
    const dbPath = await this.findDatabasePath(projectPath);

    if (dbPath) {
      this.logger.log(`Deleting SQLite database: ${dbPath}`);
      try {
        await fs.unlink(dbPath);
        // Also try to delete journal files
        await fs.unlink(`${dbPath}-journal`).catch(() => {});
        await fs.unlink(`${dbPath}-wal`).catch(() => {});
        await fs.unlink(`${dbPath}-shm`).catch(() => {});
        this.logger.log(`SQLite database deleted: ${dbPath}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        this.logger.error(`Failed to delete SQLite database: ${message}`);
        throw new Error(`Failed to delete SQLite database: ${message}`);
      }
    }
  }

  /**
   * Get database file size
   */
  async getSize(projectPath: string): Promise<number | null> {
    const dbPath = await this.findDatabasePath(projectPath);

    if (!dbPath) {
      return null;
    }

    try {
      const stats = await fs.stat(dbPath);
      return stats.size;
    } catch {
      return null;
    }
  }
}
