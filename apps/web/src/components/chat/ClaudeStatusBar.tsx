"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import {
  Activity,
  Clock,
  DollarSign,
  Wrench,
  Map,
  MessageCircleQuestion,
  Hammer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const modeConfig = {
  ask: { icon: MessageCircleQuestion, label: "Ask", color: "text-blue-500", bg: "bg-blue-500/10" },
  plan: { icon: Map, label: "Plan", color: "text-violet-500", bg: "bg-violet-500/10" },
  build: { icon: Hammer, label: "Build", color: "text-green-500", bg: "bg-green-500/10" },
} as const;

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

export function ClaudeStatusBar() {
  const { mode, isStreaming, streamingBlocks, streamStartedAt, lastCost, totalCost } = useChatStore();
  const [elapsed, setElapsed] = useState(0);

  const toolCount = streamingBlocks.filter((b) => b.type === "tool_use").length;
  const runningTools = streamingBlocks.filter((b) => b.type === "tool_use" && b.status === "running").length;
  const config = modeConfig[mode];
  const ModeIcon = config.icon;

  useEffect(() => {
    if (!isStreaming || !streamStartedAt) {
      setElapsed(0);
      return;
    }

    setElapsed(Date.now() - streamStartedAt);
    const interval = setInterval(() => {
      setElapsed(Date.now() - streamStartedAt);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, streamStartedAt]);

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 text-xs border-b bg-muted/30">
      {/* Mode Indicator */}
      <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded", config.bg)}>
        <ModeIcon className={cn("h-3 w-3", config.color)} />
        <span className={cn("font-medium", config.color)}>{config.label}</span>
      </div>

      {/* Streaming Status */}
      {isStreaming && (
        <div className="flex items-center gap-1 text-amber-500">
          <Activity className="h-3 w-3 animate-pulse" />
          <span>Active</span>
        </div>
      )}

      {/* Duration */}
      {isStreaming && elapsed > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="tabular-nums">{formatDuration(elapsed)}</span>
        </div>
      )}

      {/* Tool Count */}
      {toolCount > 0 && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Wrench className="h-3 w-3" />
          <span className="tabular-nums">
            {toolCount}{runningTools > 0 ? ` (${runningTools} running)` : ""}
          </span>
        </div>
      )}

      {/* Cost */}
      {(lastCost || totalCost > 0) && (
        <div className="flex items-center gap-1 text-muted-foreground ml-auto">
          <DollarSign className="h-3 w-3" />
          <span className="tabular-nums">
            {lastCost ? formatCost(lastCost) : ""}
            {totalCost > 0 && lastCost !== totalCost && (
              <span className="text-muted-foreground/60"> / {formatCost(totalCost)}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
