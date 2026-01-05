import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { EnvService, EnvVariable } from "./env.service";

@Controller("projects/:projectId/env")
export class EnvController {
  constructor(private readonly envService: EnvService) {}

  @Get()
  getEnvFiles(@Param("projectId") projectId: string) {
    return this.envService.getEnvFiles(projectId);
  }

  @Get("file")
  getEnvFile(
    @Param("projectId") projectId: string,
    @Query("path") filePath: string
  ) {
    return this.envService.getEnvFile(projectId, filePath);
  }

  @Put("file")
  updateEnvFile(
    @Param("projectId") projectId: string,
    @Query("path") filePath: string,
    @Body() body: { variables: EnvVariable[] }
  ) {
    return this.envService.updateEnvFile(projectId, filePath, body.variables);
  }

  @Post("file")
  createEnvFile(
    @Param("projectId") projectId: string,
    @Query("path") filePath: string,
    @Body() body: { variables: EnvVariable[] }
  ) {
    return this.envService.createEnvFile(projectId, filePath, body.variables);
  }

  @Delete("file")
  deleteEnvFile(
    @Param("projectId") projectId: string,
    @Query("path") filePath: string
  ) {
    return this.envService.deleteEnvFile(projectId, filePath);
  }
}
