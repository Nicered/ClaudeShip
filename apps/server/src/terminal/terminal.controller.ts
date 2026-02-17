import { Controller, Post, Delete, Param, Body, Sse, Res } from "@nestjs/common";
import { TerminalService } from "./terminal.service";
import { Observable, map } from "rxjs";
import type { Response } from "express";

@Controller("projects/:projectId/terminal")
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}

  @Post("execute")
  @Sse()
  async execute(
    @Param("projectId") projectId: string,
    @Body() body: { command: string },
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await this.terminalService.executeCommand(
      projectId,
      body.command,
    );

    stream.subscribe({
      next: (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      },
      complete: () => {
        res.write("data: [DONE]\n\n");
        res.end();
      },
      error: () => {
        res.end();
      },
    });
  }

  @Delete("kill")
  kill(@Param("projectId") projectId: string) {
    this.terminalService.killProcess(projectId);
    return { message: "Process terminated" };
  }
}
