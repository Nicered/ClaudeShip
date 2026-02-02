"use client";

import { cn } from "@/lib/utils";
import type { ReviewIssue } from "@claudeship/shared";
import {
  ShieldAlert,
  Bug,
  Layers,
  Gauge,
  Code2,
  FileCode,
} from "lucide-react";

interface IssueCardProps {
  issue: ReviewIssue;
}

const severityConfig: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  critical: { color: "text-red-600", bg: "bg-red-100", label: "Critical" },
  high: { color: "text-orange-600", bg: "bg-orange-100", label: "High" },
  medium: { color: "text-yellow-600", bg: "bg-yellow-100", label: "Medium" },
  low: { color: "text-blue-600", bg: "bg-blue-100", label: "Low" },
};

const categoryIcons: Record<string, React.ReactNode> = {
  security: <ShieldAlert className="h-3.5 w-3.5" />,
  bug: <Bug className="h-3.5 w-3.5" />,
  architecture: <Layers className="h-3.5 w-3.5" />,
  performance: <Gauge className="h-3.5 w-3.5" />,
  quality: <Code2 className="h-3.5 w-3.5" />,
};

export function IssueCard({ issue }: IssueCardProps) {
  const severity = severityConfig[issue.severity] || severityConfig.low;

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-background">
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium",
            severity.bg,
            severity.color,
          )}
        >
          {severity.label}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          {categoryIcons[issue.category]}
          {issue.category}
        </span>
        {issue.autoFixable && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
            Auto-fixable
          </span>
        )}
      </div>

      <h4 className="font-medium text-sm">{issue.title}</h4>
      <p className="text-sm text-muted-foreground">{issue.description}</p>

      {issue.file && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <FileCode className="h-3 w-3" />
          <span className="font-mono">
            {issue.file}
            {issue.line ? `:${issue.line}` : ""}
          </span>
        </div>
      )}

      {issue.suggestion && (
        <div className="bg-muted/50 rounded p-2 text-xs">
          <span className="font-medium">Suggestion: </span>
          {issue.suggestion}
        </div>
      )}
    </div>
  );
}
