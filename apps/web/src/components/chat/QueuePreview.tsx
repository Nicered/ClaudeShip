"use client";

import { ChevronDown, ChevronUp, Trash2, Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore, type QueuedMessage } from "@/stores/useChatStore";

interface QueuePreviewProps {
  items: QueuedMessage[];
  onDelete?: (id: string) => void;
}

export function QueuePreview({ items, onDelete }: QueuePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) return null;

  return (
    <div className="border-t bg-muted/30">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span>Queue ({items.length})</span>
        </div>
      </button>

      {/* Queue Items */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          {items.map((item, index) => (
            <QueueItem
              key={item.id}
              item={item}
              isNext={index === 0}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface QueueItemProps {
  item: QueuedMessage;
  isNext: boolean;
  onDelete?: (id: string) => void;
}

function QueueItem({ item, isNext, onDelete }: QueueItemProps) {
  const isProcessing = item.status === "processing";

  return (
    <div
      className={`relative flex items-start gap-2 p-3 rounded-md border ${
        isProcessing
          ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
          : "bg-background border-border"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm line-clamp-2 break-words">
          {item.content}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isNext && !isProcessing && (
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">
            Next
          </span>
        )}
        {isProcessing && (
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded animate-pulse">
            Processing
          </span>
        )}
        {onDelete && !isProcessing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
