import { Injectable, Logger } from "@nestjs/common";
import { ProjectService } from "../project/project.service";
import { spawn, type ChildProcess } from "child_process";
import { Observable, Subject } from "rxjs";

export interface TerminalOutput {
  type: "stdout" | "stderr" | "exit";
  data?: string;
  exitCode?: number;
}

@Injectable()
export class TerminalService {
  private readonly logger = new Logger(TerminalService.name);
  private processes: Map<string, ChildProcess> = new Map();

  constructor(private projectService: ProjectService) {}

  async executeCommand(
    projectId: string,
    command: string,
  ): Promise<Observable<TerminalOutput>> {
    const projectPath = await this.projectService.getProjectPath(projectId);

    const subject = new Subject<TerminalOutput>();

    const proc = spawn("sh", ["-c", command], {
      cwd: projectPath,
      env: { ...process.env, TERM: "xterm-256color" },
      shell: false,
    });

    const processId = `${projectId}-${Date.now()}`;
    this.processes.set(processId, proc);

    proc.stdout?.on("data", (data: Buffer) => {
      subject.next({ type: "stdout", data: data.toString() });
    });

    proc.stderr?.on("data", (data: Buffer) => {
      subject.next({ type: "stderr", data: data.toString() });
    });

    proc.on("close", (code) => {
      subject.next({ type: "exit", exitCode: code ?? 0 });
      subject.complete();
      this.processes.delete(processId);
    });

    proc.on("error", (err) => {
      this.logger.error(`Terminal process error: ${err.message}`);
      subject.next({ type: "stderr", data: err.message });
      subject.complete();
      this.processes.delete(processId);
    });

    return subject.asObservable();
  }

  killProcess(projectId: string): void {
    for (const [id, proc] of this.processes) {
      if (id.startsWith(projectId)) {
        proc.kill("SIGTERM");
        this.processes.delete(id);
      }
    }
  }
}
