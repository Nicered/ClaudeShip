import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as path from "path";
import * as fs from "fs/promises";

export interface AppSettings {
  projectsBasePath: string;
}

const DEFAULT_PROJECTS_PATH = path.join(
  process.env.HOME || "/tmp",
  "claudeship-projects"
);

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get(key: string): Promise<string | null> {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });
    return setting?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getAll(): Promise<AppSettings> {
    const projectsBasePath = await this.get("projectsBasePath");

    return {
      projectsBasePath: projectsBasePath || DEFAULT_PROJECTS_PATH,
    };
  }

  async getProjectsBasePath(): Promise<string> {
    const customPath = await this.get("projectsBasePath");
    return customPath || DEFAULT_PROJECTS_PATH;
  }

  async setProjectsBasePath(newPath: string): Promise<{ success: boolean; error?: string }> {
    // Validate the path
    const expandedPath = newPath.replace(/^~/, process.env.HOME || "");
    const absolutePath = path.isAbsolute(expandedPath)
      ? expandedPath
      : path.resolve(expandedPath);

    // Try to create the directory if it doesn't exist
    try {
      await fs.mkdir(absolutePath, { recursive: true });

      // Test write permission by creating and removing a temp file
      const testFile = path.join(absolutePath, ".claudeship-test");
      await fs.writeFile(testFile, "test");
      await fs.unlink(testFile);
    } catch (error) {
      return {
        success: false,
        error: `Cannot access directory: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }

    await this.set("projectsBasePath", absolutePath);

    return { success: true };
  }
}
