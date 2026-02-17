import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { AgentService, type CustomAgent } from "./agent.service";

@Controller("projects/:projectId/agents")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  listAgents(@Param("projectId") projectId: string) {
    return this.agentService.listAgents(projectId);
  }

  @Get(":name")
  getAgent(
    @Param("projectId") projectId: string,
    @Param("name") name: string,
  ) {
    return this.agentService.getAgent(projectId, name);
  }

  @Post()
  createAgent(
    @Param("projectId") projectId: string,
    @Body() body: CustomAgent,
  ) {
    return this.agentService.createAgent(projectId, body);
  }

  @Put(":name")
  updateAgent(
    @Param("projectId") projectId: string,
    @Param("name") name: string,
    @Body() body: CustomAgent,
  ) {
    return this.agentService.updateAgent(projectId, name, body);
  }

  @Delete(":name")
  deleteAgent(
    @Param("projectId") projectId: string,
    @Param("name") name: string,
  ) {
    return this.agentService.deleteAgent(projectId, name);
  }

  @Post(":name/run")
  runAgent(
    @Param("projectId") projectId: string,
    @Param("name") name: string,
  ) {
    return this.agentService.runAgent(projectId, name);
  }
}
