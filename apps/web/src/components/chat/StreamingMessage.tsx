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

const COLLAPSE_THRESHOLD = 5;
const VISIBLE_WHEN_COLLAPSED = 2;

// Tool category definitions with colors
type ToolCategory = "file" | "search" | "system" | "web" | "agent";

const toolCategoryMap: Record<string, ToolCategory> = {
  Read: "file",
  Edit: "file",
  Write: "file",
  Glob: "search",
  Grep: "search",
  Bash: "system",
  WebFetch: "web",
  WebSearch: "web",
  Task: "agent",
  TodoWrite: "agent",
};

const categoryConfig: Record<ToolCategory, { label: string; color: string; border: string; bg: string; text: string }> = {
  file: { label: "File", color: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300" },
  search: { label: "Search", color: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800", bg: "bg-purple-50 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300" },
  system: { label: "System", color: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800", bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300" },
  web: { label: "Web", color: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300" },
  agent: { label: "Agent", color: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-800", bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300" },
};

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

const subagentTypeLabels: Record<string, string> = {
  Explore: "Explore Agent",
  Plan: "Plan Agent",
  "general-purpose": "General Agent",
  Bash: "Bash Agent",
};

function SubagentBlock({ block }: { block: StreamingBlock }) {
  const [showResult, setShowResult] = useState(false);
  const isRunning = block.status === "running";
  const input = block.tool?.input || {};
  const agentType = (input.subagent_type as string) || "Agent";
  const description = (input.description as string) || "";
  const label = subagentTypeLabels[agentType] || `${agentType} Agent`;

  return (
    <div className={`rounded-lg border p-3 space-y-1.5 ${
      isRunning
        ? "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950"
        : "border-border bg-muted"
    }`}>
      <div className="flex items-center gap-2">
        {isRunning ? (
          <Loader2 className="h-4 w-4 animate-spin text-violet-600 dark:text-violet-400" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        )}
        <Bot className={`h-4 w-4 ${isRunning ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"}`} />
        <span className={`font-medium text-sm ${isRunning ? "text-violet-700 dark:text-violet-300" : ""}`}>
          {label}
        </span>
        {block.duration !== undefined && (
          <span className="text-xs text-muted-foreground ml-auto tabular-nums">
            ({formatDuration(block.duration)})
          </span>
        )}
      </div>

      {description && (
        <p className={`text-xs pl-10 ${isRunning ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"}`}>
          &quot;{description}&quot;
        </p>
      )}

      {block.result && !isRunning && (
        <button
          onClick={() => setShowResult(!showResult)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors pl-10 flex items-center gap-1"
        >
          {showResult ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showResult ? "결과 숨기기" : "결과 보기"}
        </button>
      )}
      {showResult && block.result && (
        <div className="pl-10 text-xs text-muted-foreground bg-background rounded p-2 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono">
          {block.result.length > 500 ? block.result.substring(0, 500) + "..." : block.result}
        </div>
      )}
    </div>
  );
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

function getToolCategory(toolName: string): ToolCategory {
  return toolCategoryMap[toolName] || "system";
}

function ToolUseBlock({ block }: { block: StreamingBlock }) {
  const isRunning = block.status === "running";
  const toolName = block.tool?.name || "Unknown";
  const category = getToolCategory(toolName);
  const config = categoryConfig[category];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm border ${
        isRunning
          ? `${config.bg} ${config.border}`
          : "bg-muted border-border"
      }`}
    >
      {isRunning ? (
        <Loader2 className={`h-4 w-4 animate-spin ${config.color}`} />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      )}
      <span className={isRunning ? config.text : "text-muted-foreground"}>
        {toolIcons[toolName] || <Terminal className="h-4 w-4" />}
      </span>
      <span className={`font-medium ${isRunning ? config.text : ""}`}>
        {getToolDisplayName(toolName)}
      </span>
      {getToolDescription(block) && (
        <span className={`truncate flex-1 ${isRunning ? config.color : "text-muted-foreground"}`}>
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

function ToolSummaryBadges({ blocks }: { blocks: StreamingBlock[] }) {
  const categoryCounts: Partial<Record<ToolCategory, number>> = {};
  for (const block of blocks) {
    const cat = getToolCategory(block.tool?.name || "");
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  const totalDuration = blocks.reduce((sum, b) => sum + (b.duration || 0), 0);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {(Object.entries(categoryCounts) as [ToolCategory, number][]).map(([cat, count]) => {
        const config = categoryConfig[cat];
        return (
          <span
            key={cat}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}
          >
            {config.label} {count}
          </span>
        );
      })}
      {totalDuration > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">
          ({formatDuration(totalDuration)})
        </span>
      )}
    </div>
  );
}

interface ToolBlockGroupProps {
  blocks: StreamingBlock[];
}

function renderToolBlock(block: StreamingBlock) {
  if (block.tool?.name === "Task") {
    return <SubagentBlock key={block.id} block={block} />;
  }
  return <ToolUseBlock key={block.id} block={block} />;
}

function ToolBlockGroup({ blocks }: ToolBlockGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = blocks.length > COLLAPSE_THRESHOLD;
  const hiddenCount = blocks.length - (VISIBLE_WHEN_COLLAPSED * 2);

  if (!shouldCollapse || isExpanded) {
    return (
      <div className="space-y-1">
        {shouldCollapse && <ToolSummaryBadges blocks={blocks} />}
        {blocks.map(renderToolBlock)}
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

  const firstBlocks = blocks.slice(0, VISIBLE_WHEN_COLLAPSED);
  const lastBlocks = blocks.slice(-VISIBLE_WHEN_COLLAPSED);

  return (
    <div className="space-y-1">
      <ToolSummaryBadges blocks={blocks} />
      {firstBlocks.map(renderToolBlock)}
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center border border-dashed border-border rounded-md hover:bg-muted/50"
      >
        <ChevronDown className="h-4 w-4" />
        <span>{hiddenCount}개 더 보기</span>
      </button>
      {lastBlocks.map(renderToolBlock)}
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
      if (currentToolGroup.length > 0) {
        groups.push({ type: "tool_group", blocks: currentToolGroup });
        currentToolGroup = [];
      }
      groups.push({ type: "other", blocks: [block] });
    }
  }

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
        {blockGroups.map((group, groupIndex) => {
          if (group.type === "tool_group") {
            return <ToolBlockGroup key={`group-${groupIndex}`} blocks={group.blocks} />;
          }

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

        {isStreaming && !hasBlocks && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI가 생각 중...</span>
          </div>
        )}

        {isStreaming && hasBlocks && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
}
