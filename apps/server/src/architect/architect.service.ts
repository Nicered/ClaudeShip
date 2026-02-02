import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Observable, Subject } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { ProjectService } from "../project/project.service";
import { ClaudeCliService } from "../chat/claude-cli.service";
import { ChatService } from "../chat/chat.service";
import { Role, ReviewStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { buildReviewPrompt } from "./prompts/review-prompt";
import type { ReviewResult, ReviewIssue } from "@claudeship/shared";

export interface BuildCompleteEvent {
  projectId: string;
  messageId: string;
  toolActivities: Array<{ name: string; input?: Record<string, unknown> }>;
}

export interface ReviewStreamEvent {
  type: "start" | "progress" | "complete" | "error";
  reviewId?: string;
  data?: unknown;
}

// Tool names that indicate file modifications
const FILE_MODIFY_TOOLS = ["Write", "Edit", "MultiEdit"];

// Cooldown between reviews (30 seconds)
const REVIEW_COOLDOWN_MS = 30_000;

@Injectable()
export class ArchitectService {
  private readonly logger = new Logger(ArchitectService.name);
  private reviewSubjects: Map<string, Subject<ReviewStreamEvent>> = new Map();
  private lastReviewTime: Map<string, number> = new Map();

  constructor(
    private prisma: PrismaService,
    private projectService: ProjectService,
    private claudeCliService: ClaudeCliService,
    private chatService: ChatService,
  ) {}

  @OnEvent("build.complete")
  async handleBuildComplete(event: BuildCompleteEvent): Promise<void> {
    const { projectId, messageId, toolActivities } = event;

    // Only trigger review if file modifications occurred
    const hasFileChanges = toolActivities.some((t) =>
      FILE_MODIFY_TOOLS.includes(t.name),
    );

    if (!hasFileChanges) {
      this.logger.log(
        `Skipping review for project ${projectId}: no file modifications`,
      );
      return;
    }

    // Check cooldown
    const lastReview = this.lastReviewTime.get(projectId) || 0;
    if (Date.now() - lastReview < REVIEW_COOLDOWN_MS) {
      this.logger.log(
        `Skipping review for project ${projectId}: cooldown active`,
      );
      return;
    }

    // Check if already running
    const runningReview = await this.prisma.review.findFirst({
      where: { projectId, status: "RUNNING" },
    });
    if (runningReview) {
      this.logger.log(
        `Skipping review for project ${projectId}: review already running`,
      );
      return;
    }

    await this.triggerReview(projectId, messageId);
  }

  async triggerReview(
    projectId: string,
    triggerMessageId?: string,
  ): Promise<{ reviewId: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const projectPath = await this.projectService.getProjectPath(projectId);

    // Create review record
    const review = await this.prisma.review.create({
      data: {
        projectId,
        status: "RUNNING",
        triggerMessageId,
      },
    });

    this.lastReviewTime.set(projectId, Date.now());
    this.emitReviewEvent(projectId, {
      type: "start",
      reviewId: review.id,
    });

    // Run review asynchronously
    this.runReview(review.id, projectId, projectPath).catch((err) => {
      this.logger.error(`Review failed: ${err.message}`);
    });

    return { reviewId: review.id };
  }

  private async runReview(
    reviewId: string,
    projectId: string,
    projectPath: string,
  ): Promise<void> {
    const sessionId = randomUUID();
    const prompt = buildReviewPrompt(projectPath);

    let fullResponse = "";
    let totalCost = 0;

    return new Promise<void>((resolve, reject) => {
      const cliStream = this.claudeCliService.executePrompt(
        projectPath,
        prompt,
        sessionId,
        undefined,
        "ask",
      );

      cliStream.subscribe({
        next: (event) => {
          if (event.type === "text" && event.content) {
            fullResponse += event.content;
          }
          if (event.type === "complete" && event.cost) {
            totalCost = event.cost;
          }
        },
        error: async (error) => {
          this.logger.error(`Review CLI error: ${error.message}`);
          await this.prisma.review.update({
            where: { id: reviewId },
            data: {
              status: "FAILED",
              summary: error.message,
              completedAt: new Date(),
            },
          });
          this.emitReviewEvent(projectId, {
            type: "error",
            reviewId,
            data: { error: error.message },
          });
          reject(error);
        },
        complete: async () => {
          try {
            const result = this.parseReviewResult(fullResponse);

            await this.prisma.review.update({
              where: { id: reviewId },
              data: {
                status: "COMPLETED",
                summary: result.summary,
                overallScore: result.overallScore,
                issues: JSON.stringify(result.issues),
                strengths: JSON.stringify(result.strengths),
                recommendations: JSON.stringify(result.recommendations),
                cost: totalCost,
                completedAt: new Date(),
              },
            });

            // Save summary as SYSTEM message in chat
            const issueCount = result.issues.length;
            const criticalCount = result.issues.filter(
              (i) => i.severity === "critical",
            ).length;
            const highCount = result.issues.filter(
              (i) => i.severity === "high",
            ).length;

            let summaryContent = `Code Review Complete - Score: ${result.overallScore}/100\n${result.summary}`;
            if (issueCount > 0) {
              summaryContent += `\n\nIssues: ${issueCount} total`;
              if (criticalCount > 0)
                summaryContent += ` (${criticalCount} critical)`;
              if (highCount > 0) summaryContent += ` (${highCount} high)`;
            }

            await this.prisma.message.create({
              data: {
                projectId,
                role: Role.SYSTEM,
                content: summaryContent,
                metadata: JSON.stringify({
                  type: "review_summary",
                  reviewId,
                  overallScore: result.overallScore,
                  issueCount,
                  criticalCount,
                  highCount,
                }),
              },
            });

            this.emitReviewEvent(projectId, {
              type: "complete",
              reviewId,
              data: result,
            });

            // Auto-fix critical + autoFixable issues
            const autoFixIssues = result.issues.filter(
              (i) =>
                (i.severity === "critical" || i.severity === "high") &&
                i.autoFixable,
            );

            if (autoFixIssues.length > 0) {
              await this.triggerAutoFix(projectId, reviewId, autoFixIssues);
            }

            resolve();
          } catch (err) {
            this.logger.error(`Failed to parse review result: ${err}`);
            await this.prisma.review.update({
              where: { id: reviewId },
              data: {
                status: "FAILED",
                summary: "Failed to parse review result",
                completedAt: new Date(),
              },
            });
            this.emitReviewEvent(projectId, {
              type: "error",
              reviewId,
              data: { error: "Failed to parse review result" },
            });
            reject(err);
          }
        },
      });
    });
  }

  private async triggerAutoFix(
    projectId: string,
    reviewId: string,
    issues: ReviewIssue[],
  ): Promise<void> {
    this.logger.log(
      `Triggering auto-fix for ${issues.length} issues in project ${projectId}`,
    );

    await this.prisma.review.update({
      where: { id: reviewId },
      data: { status: "AUTO_FIXING" },
    });

    const fixPrompt = this.buildAutoFixPrompt(issues);

    // Send as a build message through ChatService
    this.chatService.sendMessage(projectId, fixPrompt, "build").subscribe({
      complete: async () => {
        this.logger.log(`Auto-fix completed for review ${reviewId}`);
        await this.prisma.review.update({
          where: { id: reviewId },
          data: { status: "COMPLETED" },
        });
      },
      error: (err) => {
        this.logger.error(`Auto-fix failed: ${err.message}`);
      },
    });
  }

  private buildAutoFixPrompt(issues: ReviewIssue[]): string {
    const issueDescriptions = issues
      .map((issue, i) => {
        let desc = `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`;
        if (issue.file) desc += `\n   File: ${issue.file}`;
        if (issue.line) desc += `:${issue.line}`;
        desc += `\n   ${issue.description}`;
        if (issue.suggestion) desc += `\n   Suggestion: ${issue.suggestion}`;
        return desc;
      })
      .join("\n\n");

    return `[Architect Review - Auto Fix Request]

The code review found the following critical/high severity issues that need to be fixed:

${issueDescriptions}

Please fix ALL of the above issues. For each fix:
1. Read the relevant file
2. Apply the minimal necessary change
3. Do not introduce new features or refactor beyond what's needed`;
  }

  private parseReviewResult(raw: string): ReviewResult {
    // Try to extract JSON from the response
    let jsonStr = raw.trim();

    // Try to find JSON in code fences
    const fenceMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    // Try to find JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    return {
      summary: parsed.summary || "Review completed",
      overallScore: Math.max(0, Math.min(100, parsed.overallScore || 0)),
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
    };
  }

  async getReviews(projectId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return reviews.map((r) => ({
      ...r,
      issues: JSON.parse(r.issues || "[]"),
      strengths: JSON.parse(r.strengths || "[]"),
      recommendations: JSON.parse(r.recommendations || "[]"),
    }));
  }

  async getReview(projectId: string, reviewId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, projectId },
    });

    if (!review) {
      throw new Error("Review not found");
    }

    return {
      ...review,
      issues: JSON.parse(review.issues || "[]"),
      strengths: JSON.parse(review.strengths || "[]"),
      recommendations: JSON.parse(review.recommendations || "[]"),
    };
  }

  getReviewStream(projectId: string): Observable<ReviewStreamEvent> {
    if (!this.reviewSubjects.has(projectId)) {
      this.reviewSubjects.set(projectId, new Subject<ReviewStreamEvent>());
    }
    return this.reviewSubjects.get(projectId)!.asObservable();
  }

  private emitReviewEvent(
    projectId: string,
    event: ReviewStreamEvent,
  ): void {
    const subject = this.reviewSubjects.get(projectId);
    if (subject) {
      subject.next(event);
    }
  }
}
