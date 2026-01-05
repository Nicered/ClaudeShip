import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import { ProjectService } from "../project/project.service";
import * as path from "path";
import * as fs from "fs/promises";
import { existsSync } from "fs";

export interface EnvVariable {
  key: string;
  value: string;
}

export interface EnvFile {
  path: string;
  variables: EnvVariable[];
}

@Injectable()
export class EnvService {
  private readonly logger = new Logger(EnvService.name);

  constructor(private projectService: ProjectService) {}

  /**
   * Parse .env file content into key-value pairs
   */
  private parseEnvContent(content: string): EnvVariable[] {
    const variables: EnvVariable[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      // Parse KEY=VALUE format
      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex > 0) {
        const key = trimmed.substring(0, equalsIndex).trim();
        let value = trimmed.substring(equalsIndex + 1).trim();

        // Remove surrounding quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        variables.push({ key, value });
      }
    }

    return variables;
  }

  /**
   * Convert variables to .env file format
   */
  private formatEnvContent(variables: EnvVariable[]): string {
    return variables
      .map(({ key, value }) => {
        // Quote values that contain spaces or special characters
        const needsQuotes = /[\s#=]/.test(value) || value.includes('"');
        const formattedValue = needsQuotes
          ? `"${value.replace(/"/g, '\\"')}"`
          : value;
        return `${key}=${formattedValue}`;
      })
      .join("\n");
  }

  /**
   * Get list of .env files in project
   */
  async getEnvFiles(projectId: string): Promise<EnvFile[]> {
    const projectPath = await this.projectService.getProjectPath(projectId);
    const envFiles: EnvFile[] = [];

    // Common .env file patterns
    const envPatterns = [
      ".env",
      ".env.local",
      ".env.development",
      ".env.development.local",
      ".env.production",
      ".env.production.local",
      ".env.test",
      ".env.test.local",
      ".env.example",
    ];

    // Check root and backend directories
    const searchDirs = [projectPath, path.join(projectPath, "backend")];

    for (const dir of searchDirs) {
      if (!existsSync(dir)) continue;

      for (const pattern of envPatterns) {
        const filePath = path.join(dir, pattern);
        if (existsSync(filePath)) {
          try {
            const content = await fs.readFile(filePath, "utf-8");
            const relativePath = path.relative(projectPath, filePath);
            envFiles.push({
              path: relativePath,
              variables: this.parseEnvContent(content),
            });
          } catch (error) {
            this.logger.warn(`Failed to read ${filePath}: ${error}`);
          }
        }
      }
    }

    return envFiles;
  }

  /**
   * Get specific .env file
   */
  async getEnvFile(projectId: string, filePath: string): Promise<EnvFile> {
    const projectPath = await this.projectService.getProjectPath(projectId);
    const fullPath = path.join(projectPath, filePath);

    // Security: Ensure path is within project
    const resolvedPath = path.resolve(fullPath);
    const resolvedProjectPath = path.resolve(projectPath);
    if (!resolvedPath.startsWith(resolvedProjectPath)) {
      throw new BadRequestException("Invalid file path");
    }

    if (!existsSync(fullPath)) {
      throw new NotFoundException(`File not found: ${filePath}`);
    }

    try {
      const content = await fs.readFile(fullPath, "utf-8");
      return {
        path: filePath,
        variables: this.parseEnvContent(content),
      };
    } catch (error) {
      this.logger.error(`Failed to read env file: ${error}`);
      throw new BadRequestException("Failed to read file");
    }
  }

  /**
   * Update .env file
   */
  async updateEnvFile(
    projectId: string,
    filePath: string,
    variables: EnvVariable[]
  ): Promise<EnvFile> {
    const projectPath = await this.projectService.getProjectPath(projectId);
    const fullPath = path.join(projectPath, filePath);

    // Security: Ensure path is within project
    const resolvedPath = path.resolve(fullPath);
    const resolvedProjectPath = path.resolve(projectPath);
    if (!resolvedPath.startsWith(resolvedProjectPath)) {
      throw new BadRequestException("Invalid file path");
    }

    // Validate file name
    const fileName = path.basename(filePath);
    if (!fileName.startsWith(".env")) {
      throw new BadRequestException("File must be a .env file");
    }

    try {
      const content = this.formatEnvContent(variables);
      await fs.writeFile(fullPath, content + "\n", "utf-8");
      return {
        path: filePath,
        variables,
      };
    } catch (error) {
      this.logger.error(`Failed to write env file: ${error}`);
      throw new BadRequestException("Failed to write file");
    }
  }

  /**
   * Create new .env file
   */
  async createEnvFile(
    projectId: string,
    filePath: string,
    variables: EnvVariable[] = []
  ): Promise<EnvFile> {
    const projectPath = await this.projectService.getProjectPath(projectId);
    const fullPath = path.join(projectPath, filePath);

    // Security: Ensure path is within project
    const resolvedPath = path.resolve(fullPath);
    const resolvedProjectPath = path.resolve(projectPath);
    if (!resolvedPath.startsWith(resolvedProjectPath)) {
      throw new BadRequestException("Invalid file path");
    }

    // Validate file name
    const fileName = path.basename(filePath);
    if (!fileName.startsWith(".env")) {
      throw new BadRequestException("File name must start with .env");
    }

    if (existsSync(fullPath)) {
      throw new BadRequestException("File already exists");
    }

    try {
      const content = this.formatEnvContent(variables);
      await fs.writeFile(fullPath, content + "\n", "utf-8");
      return {
        path: filePath,
        variables,
      };
    } catch (error) {
      this.logger.error(`Failed to create env file: ${error}`);
      throw new BadRequestException("Failed to create file");
    }
  }

  /**
   * Delete .env file
   */
  async deleteEnvFile(projectId: string, filePath: string): Promise<void> {
    const projectPath = await this.projectService.getProjectPath(projectId);
    const fullPath = path.join(projectPath, filePath);

    // Security: Ensure path is within project
    const resolvedPath = path.resolve(fullPath);
    const resolvedProjectPath = path.resolve(projectPath);
    if (!resolvedPath.startsWith(resolvedProjectPath)) {
      throw new BadRequestException("Invalid file path");
    }

    if (!existsSync(fullPath)) {
      throw new NotFoundException("File not found");
    }

    try {
      await fs.unlink(fullPath);
    } catch (error) {
      this.logger.error(`Failed to delete env file: ${error}`);
      throw new BadRequestException("Failed to delete file");
    }
  }
}
