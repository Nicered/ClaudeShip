"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@claudeship/shared";
import {
  FileText,
  FolderSearch,
  Terminal,
  Edit3,
  Search,
  Globe,
  CheckCircle2,
  ListTodo,
  Bot,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ToolActivity {
  name: string;
  input?: Record<string, unknown>;
  status: "completed";
}

interface MessageItemProps {
  message: ChatMessage;
}

const toolIcons: Record<string, React.ReactNode> = {
  Read: <FileText className="h-3 w-3" />,
  Glob: <FolderSearch className="h-3 w-3" />,
  Grep: <Search className="h-3 w-3" />,
  Bash: <Terminal className="h-3 w-3" />,
  Edit: <Edit3 className="h-3 w-3" />,
  Write: <Edit3 className="h-3 w-3" />,
  WebFetch: <Globe className="h-3 w-3" />,
  WebSearch: <Globe className="h-3 w-3" />,
  TodoWrite: <ListTodo className="h-3 w-3" />,
  Task: <Bot className="h-3 w-3" />,
};

const toolDisplayNames: Record<string, string> = {
  Read: "파일 읽기",
  Glob: "파일 검색",
  Grep: "내용 검색",
  Bash: "명령어 실행",
  Edit: "파일 수정",
  Write: "파일 생성",
  WebFetch: "웹 페이지",
  WebSearch: "웹 검색",
  Task: "에이전트",
  TodoWrite: "작업 목록",
};

function ReviewSummaryMessage({ message, metadata }: { message: ChatMessage; metadata: Record<string, unknown> }) {
  const score = metadata.overallScore as number;
  const issueCount = (metadata.issueCount as number) || 0;
  const criticalCount = (metadata.criticalCount as number) || 0;
  const highCount = (metadata.highCount as number) || 0;

  let scoreColor = "text-green-600 bg-green-100";
  if (score < 50) scoreColor = "text-red-600 bg-red-100";
  else if (score < 70) scoreColor = "text-yellow-600 bg-yellow-100";
  else if (score < 90) scoreColor = "text-blue-600 bg-blue-100";

  return (
    <div className="flex gap-3 p-4 rounded-lg bg-muted/30 border border-dashed">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-sm font-medium">
        <Search className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-violet-600 uppercase">Code Review</span>
          <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold", scoreColor)}>
            {score}/100
          </span>
          {issueCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {issueCount} issue{issueCount !== 1 ? "s" : ""}
              {criticalCount > 0 && <span className="text-red-600 font-medium"> ({criticalCount} critical)</span>}
              {highCount > 0 && <span className="text-orange-600 font-medium"> ({highCount} high)</span>}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{message.content.split("\n")[0].replace(/^Code Review Complete - Score: \d+\/100\n?/, "")}</p>
      </div>
    </div>
  );
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "USER";
  const isSystem = message.role === "SYSTEM";

  // Parse metadata
  let toolActivities: ToolActivity[] = [];
  let parsedMetadata: Record<string, unknown> = {};
  if (message.metadata) {
    try {
      parsedMetadata = typeof message.metadata === "string"
        ? JSON.parse(message.metadata)
        : (message.metadata as Record<string, unknown>);
      if (!isUser) {
        toolActivities = (parsedMetadata.toolActivities as ToolActivity[]) || [];
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Render review summary system messages with special UI
  if (isSystem && parsedMetadata.type === "review_summary") {
    return <ReviewSummaryMessage message={message} metadata={parsedMetadata} />;
  }

  // Skip other system messages from rendering
  if (isSystem) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-muted/50" : "bg-background"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? "U" : "AI"}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        {/* Tool activities summary */}
        {toolActivities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {toolActivities.slice(0, 10).map((activity, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground"
              >
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                {toolIcons[activity.name] || <Terminal className="h-3 w-3" />}
                {toolDisplayNames[activity.name] || activity.name}
              </span>
            ))}
            {toolActivities.length > 10 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                +{toolActivities.length - 10}개
              </span>
            )}
          </div>
        )}

        <div className="max-w-none">
          {isUser ? (
            <div className="whitespace-pre-wrap break-words leading-7">{message.content}</div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    </div>
  );
}
