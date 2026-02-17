import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ProjectService } from "../project/project.service";
import { ChatService } from "../chat/chat.service";
import * as path from "path";
import * as fs from "fs/promises";
import { existsSync } from "fs";

export interface CustomAgent {
  name: string;
  description: string;
  tools: string[];
  prompt: string;
}

/**
 * Simple YAML parser for Claude Code agent files.
 * Handles flat key-value pairs, arrays, and multiline strings (block scalar |).
 */
function parseAgentYaml(content: string): CustomAgent {
  const result: Record<string, string | string[]> = {};
  const lines = content.split("\n");
  let currentKey = "";
  let multilineValue = "";
  let inMultiline = false;
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    if (inMultiline) {
      if (line.startsWith("  ") || line.trim() === "") {
        multilineValue += (multilineValue ? "\n" : "") + line.replace(/^ {2}/, "");
        continue;
      } else {
        result[currentKey] = multilineValue;
        inMultiline = false;
        multilineValue = "";
      }
    }

    if (inArray) {
      if (line.match(/^\s+-\s+/)) {
        arrayValues.push(line.replace(/^\s+-\s+/, "").trim());
        continue;
      } else {
        result[currentKey] = arrayValues;
        inArray = false;
        arrayValues = [];
      }
    }

    const match = line.match(/^(\w+):\s*(.*)/);
    if (match) {
      currentKey = match[1];
      const value = match[2].trim();

      if (value === "|") {
        inMultiline = true;
        multilineValue = "";
      } else if (value === "") {
        // Could be array on next line
        inArray = true;
        arrayValues = [];
      } else {
        result[currentKey] = value;
      }
    }
  }

  if (inMultiline) {
    result[currentKey] = multilineValue;
  }
  if (inArray) {
    result[currentKey] = arrayValues;
  }

  return {
    name: (result.name as string) || "",
    description: (result.description as string) || "",
    tools: Array.isArray(result.tools) ? result.tools : [],
    prompt: (result.prompt as string) || "",
  };
}

function formatAgentYaml(agent: CustomAgent): string {
  let content = `name: ${agent.name}\n`;
  content += `description: ${agent.description}\n`;
  content += `tools:\n`;
  for (const tool of agent.tools) {
    content += `  - ${tool}\n`;
  }
  content += `prompt: |\n`;
  for (const line of agent.prompt.split("\n")) {
    content += `  ${line}\n`;
  }
  return content;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private projectService: ProjectService,
    private chatService: ChatService,
  ) {}

  private async getAgentsDir(projectId: string): Promise<string> {
    const projectPath = await this.projectService.getProjectPath(projectId);
    return path.join(projectPath, ".claude", "agents");
  }

  async listAgents(projectId: string): Promise<CustomAgent[]> {
    const agentsDir = await this.getAgentsDir(projectId);

    if (!existsSync(agentsDir)) {
      return [];
    }

    const files = await fs.readdir(agentsDir);
    const agents: CustomAgent[] = [];

    for (const file of files) {
      if (!file.endsWith(".yml") && !file.endsWith(".yaml")) continue;

      try {
        const content = await fs.readFile(
          path.join(agentsDir, file),
          "utf-8",
        );
        const parsed = parseAgentYaml(content);
        if (parsed.name) {
          agents.push(parsed);
        }
      } catch (error) {
        this.logger.warn(`Failed to parse agent file ${file}: ${error}`);
      }
    }

    return agents;
  }

  async getAgent(projectId: string, name: string): Promise<CustomAgent> {
    const agentsDir = await this.getAgentsDir(projectId);
    const filePath = path.join(agentsDir, `${this.sanitizeName(name)}.yml`);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`Agent not found: ${name}`);
    }

    const content = await fs.readFile(filePath, "utf-8");
    return parseAgentYaml(content);
  }

  async createAgent(
    projectId: string,
    agent: CustomAgent,
  ): Promise<CustomAgent> {
    const agentsDir = await this.getAgentsDir(projectId);

    await fs.mkdir(agentsDir, { recursive: true });

    const fileName = `${this.sanitizeName(agent.name)}.yml`;
    const filePath = path.join(agentsDir, fileName);

    if (existsSync(filePath)) {
      throw new BadRequestException(`Agent already exists: ${agent.name}`);
    }

    await fs.writeFile(filePath, formatAgentYaml(agent), "utf-8");
    return agent;
  }

  async updateAgent(
    projectId: string,
    name: string,
    agent: CustomAgent,
  ): Promise<CustomAgent> {
    const agentsDir = await this.getAgentsDir(projectId);
    const filePath = path.join(agentsDir, `${this.sanitizeName(name)}.yml`);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`Agent not found: ${name}`);
    }

    await fs.writeFile(filePath, formatAgentYaml(agent), "utf-8");

    if (name !== agent.name) {
      const newFilePath = path.join(
        agentsDir,
        `${this.sanitizeName(agent.name)}.yml`,
      );
      await fs.rename(filePath, newFilePath);
    }

    return agent;
  }

  async deleteAgent(projectId: string, name: string): Promise<void> {
    const agentsDir = await this.getAgentsDir(projectId);
    const filePath = path.join(agentsDir, `${this.sanitizeName(name)}.yml`);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`Agent not found: ${name}`);
    }

    await fs.unlink(filePath);
  }

  async runAgent(
    projectId: string,
    name: string,
  ): Promise<{ message: string }> {
    const agent = await this.getAgent(projectId, name);

    const prompt = `[Custom Agent: ${agent.name}]\n\n${agent.prompt}`;
    this.chatService.sendMessage(projectId, prompt, "build").subscribe({
      error: (err) => {
        this.logger.error(`Agent run failed: ${err.message}`);
      },
    });

    return { message: `Agent "${agent.name}" started` };
  }

  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
