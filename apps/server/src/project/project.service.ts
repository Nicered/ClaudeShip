import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { SettingsService } from "../settings/settings.service";
import { randomUUID } from "crypto";
import * as path from "path";
import * as fs from "fs/promises";

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService
  ) {}

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        projectType: true,
        backendFramework: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async create(dto: CreateProjectDto) {
    // Use UUID for folder name to avoid issues with special characters
    const folderId = randomUUID();
    const projectsBasePath = await this.settingsService.getProjectsBasePath();
    const projectPath = path.join(projectsBasePath, folderId);

    // Create project directory
    await fs.mkdir(projectPath, { recursive: true });

    // Create frontend/backend directories for fullstack projects
    const isFullstack =
      dto.backendFramework &&
      dto.backendFramework !== "NONE";

    if (isFullstack) {
      await fs.mkdir(path.join(projectPath, "frontend"), { recursive: true });
      await fs.mkdir(path.join(projectPath, "backend"), { recursive: true });
    }

    // Create project in database
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        projectType: dto.projectType,
        backendFramework: dto.backendFramework || "NONE",
        path: projectPath,
        description: dto.description,
      },
    });

    return project;
  }

  async remove(id: string) {
    const project = await this.findOne(id);

    // Delete from database
    await this.prisma.project.delete({
      where: { id },
    });

    // Optionally delete project directory
    try {
      await fs.rm(project.path, { recursive: true, force: true });
    } catch (error) {
      // Ignore if directory doesn't exist
    }
  }

  getProjectPath(id: string): Promise<string> {
    return this.findOne(id).then((project) => project.path);
  }
}
