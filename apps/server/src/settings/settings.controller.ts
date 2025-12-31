import { Controller, Get, Put, Body } from "@nestjs/common";
import { SettingsService } from "./settings.service";

class UpdateProjectsPathDto {
  path: string;
}

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getAll();
  }

  @Get("projects-path")
  async getProjectsPath() {
    const path = await this.settingsService.getProjectsBasePath();
    return { path };
  }

  @Put("projects-path")
  async setProjectsPath(@Body() dto: UpdateProjectsPathDto) {
    const result = await this.settingsService.setProjectsBasePath(dto.path);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const newPath = await this.settingsService.getProjectsBasePath();
    return { success: true, path: newPath };
  }
}
