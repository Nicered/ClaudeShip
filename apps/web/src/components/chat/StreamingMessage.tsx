"use client";

import { useState } from "react";
import { useChatStore, type StreamingBlock } from "@/stores/useChatStore";
import {
  FileText,
  FolderSearch,
  Terminal,
  Edit3,
  Search,
  Globe,
  CheckCircle2,
  Loader2,
  ListTodo,
  Bot,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { AskUserQuestionBlock } from "./AskUserQuestionBlock";

interface StreamingMessageProps {
  blocks: StreamingBlock[];
  isStreaming?: boolean;
  projectId: string;
}

const COLLAPSE_THRESHOLD = 5; // Number of tool blocks before collapsing
const VISIBLE_WHEN_COLLAPSED = 2; // Number of items to show at start and end when collapsed

const toolIcons: Record<string, React.ReactNode> = {
  Read: <FileText className="h-4 w-4" />,
  Glob: <FolderSearch className="h-4 w-4" />,
  Grep: <Search className="h-4 w-4" />,
  Bash: <Terminal className="h-4 w-4" />,
  Edit: <Edit3 className="h-4 w-4" />,
  Write: <Edit3 className="h-4 w-4" />,
  WebFetch: <Globe className="h-4 w-4" />,
  WebSearch: <Globe className="h-4 w-4" />,
  TodoWrite: <ListTodo className="h-4 w-4" />,
  Task: <Bot className="h-4 w-4" />,
};

function getToolDisplayName(name: string): string {
  const displayNames: Record<string, string> = {
    Read: "파일 읽기",
    Glob: "파일 검색",
    Grep: "내용 검색",
    Bash: "명령어 실행",
    Edit: "파일 수정",
    Write: "파일 생성",
    WebFetch: "웹 페이지 가져오기",
    WebSearch: "웹 검색",
    Task: "에이전트 실행",
    TodoWrite: "작업 목록 업데이트",
  };
  return displayNames[name] || name;
}

function getToolDescription(block: StreamingBlock): string {
  const input = block.tool?.input;
  const name = block.tool?.name;

  if (!input || !name) return "";

  if (name === "Read" && input.file_path) {
    const path = input.file_path as string;
    const fileName = path.split("/").pop();
    return fileName || "";
  }

  if (name === "Glob" && input.pattern) {
    return input.pattern as string;
  }

  if (name === "Grep" && input.pattern) {
    return input.pattern as string;
  }

  if (name === "Bash" && input.command) {
    const cmd = input.command as string;
    return cmd.length > 50 ? cmd.substring(0, 50) + "..." : cmd;
  }

  if ((name === "Edit" || name === "Write") && input.file_path) {
    const path = input.file_path as string;
    const fileName = path.split("/").pop();
    return fileName || "";
  }

  return "";
}

function TextBlock({ content }: { content: string }) {
  return <MarkdownRenderer content={content} />;
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

function ToolUseBlock({ block }: { block: StreamingBlock }) {
  const isRunning = block.status === "running";
  const toolName = block.tool?.name || "Unknown";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
        isRunning
          ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
          : "bg-muted border border-border"
      }`}
    >
      {isRunning ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      )}
      <span className={isRunning ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground"}>
        {toolIcons[toolName] || <Terminal className="h-4 w-4" />}
      </span>
      <span className={`font-medium ${isRunning ? "text-blue-800 dark:text-blue-200" : ""}`}>
        {getToolDisplayName(toolName)}
      </span>
      {getToolDescription(block) && (
        <span className={`truncate flex-1 ${isRunning ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>
          {getToolDescription(block)}
        </span>
      )}
      {block.duration !== undefined && (
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">
          ({formatDuration(block.duration)})
        </span>
      )}
    </div>
  );
}

interface ToolBlockGroupProps {
  blocks: StreamingBlock[];
}

function ToolBlockGroup({ blocks }: ToolBlockGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = blocks.length > COLLAPSE_THRESHOLD;
  const hiddenCount = blocks.length - (VISIBLE_WHEN_COLLAPSED * 2);

  if (!shouldCollapse || isExpanded) {
    return (
      <div className="space-y-1">
        {blocks.map((block) => (
          <ToolUseBlock key={block.id} block={block} />
        ))}
        {shouldCollapse && isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
            <span>접기</span>
          </button>
        )}
      </div>
    );
  }

  // Show first few, collapse button, then last few
  const firstBlocks = blocks.slice(0, VISIBLE_WHEN_COLLAPSED);
  const lastBlocks = blocks.slice(-VISIBLE_WHEN_COLLAPSED);

  return (
    <div className="space-y-1">
      {firstBlocks.map((block) => (
        <ToolUseBlock key={block.id} block={block} />
      ))}
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center border border-dashed border-border rounded-md hover:bg-muted/50"
      >
        <ChevronDown className="h-4 w-4" />
        <span>{hiddenCount}개 더 보기</span>
      </button>
      {lastBlocks.map((block) => (
        <ToolUseBlock key={block.id} block={block} />
      ))}
    </div>
  );
}

// Group consecutive blocks by type
interface BlockGroup {
  type: "tool_group" | "other";
  blocks: StreamingBlock[];
}

function groupBlocks(blocks: StreamingBlock[]): BlockGroup[] {
  const groups: BlockGroup[] = [];
  let currentToolGroup: StreamingBlock[] = [];

  for (const block of blocks) {
    if (block.type === "tool_use") {
      currentToolGroup.push(block);
    } else {
      // Flush current tool group if exists
      if (currentToolGroup.length > 0) {
        groups.push({ type: "tool_group", blocks: currentToolGroup });
        currentToolGroup = [];
      }
      // Add non-tool block as single item
      groups.push({ type: "other", blocks: [block] });
    }
  }

  // Flush remaining tool group
  if (currentToolGroup.length > 0) {
    groups.push({ type: "tool_group", blocks: currentToolGroup });
  }

  return groups;
}

export function StreamingMessage({ blocks, isStreaming = true, projectId }: StreamingMessageProps) {
  const hasBlocks = blocks.length > 0;
  const { respondToQuestion } = useChatStore();
  const blockGroups = groupBlocks(blocks);

  const handleQuestionSubmit = (answers: Record<string, string>) => {
    respondToQuestion(projectId, answers);
  };

  return (
    <div className="flex gap-3 p-4 rounded-lg bg-background">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
        AI
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        {/* Render block groups */}
        {blockGroups.map((group, groupIndex) => {
          if (group.type === "tool_group") {
            return <ToolBlockGroup key={`group-${groupIndex}`} blocks={group.blocks} />;
          }

          // Render other blocks individually
          return group.blocks.map((block) => {
            if (block.type === "text") {
              return <TextBlock key={block.id} content={block.content || ""} />;
            }
            if (block.type === "ask_user_question" && block.askUserQuestion) {
              return (
                <AskUserQuestionBlock
                  key={block.id}
                  data={block.askUserQuestion}
                  isWaiting={block.status === "waiting"}
                  onSubmit={handleQuestionSubmit}
                />
              );
            }
            return null;
          });
        })}

        {/* Show thinking state when streaming but no blocks yet */}
        {isStreaming && !hasBlocks && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI가 생각 중...</span>
          </div>
        )}

        {/* Show cursor only while streaming */}
        {isStreaming && hasBlocks && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
}
