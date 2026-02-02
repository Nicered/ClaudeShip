"use client";

import { useEffect, useState } from "react";
import { useArchitectStore } from "@/stores/useArchitectStore";
import { IssueCard } from "./IssueCard";
import {
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReviewIssue } from "@claudeship/shared";

interface ArchitectPanelProps {
  projectId: string;
}

function ScoreBadge({ score }: { score: number }) {
  let color = "text-green-600 bg-green-100";
  if (score < 50) color = "text-red-600 bg-red-100";
  else if (score < 70) color = "text-yellow-600 bg-yellow-100";
  else if (score < 90) color = "text-blue-600 bg-blue-100";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-sm font-bold",
        color,
      )}
    >
      {score}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "RUNNING":
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    case "AUTO_FIXING":
      return <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />;
    default:
      return null;
  }
}

export function ArchitectPanel({ projectId }: ArchitectPanelProps) {
  const {
    reviews,
    activeReview,
    isReviewing,
    isAutoFixing,
    error,
    fetchReviews,
    fetchReview,
    triggerReview,
    subscribeToReviews,
    clearError,
  } = useArchitectStore();

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews(projectId);
    const unsubscribe = subscribeToReviews(projectId);
    return unsubscribe;
  }, [projectId]);

  useEffect(() => {
    if (selectedReviewId) {
      fetchReview(projectId, selectedReviewId);
    }
  }, [selectedReviewId, projectId]);

  // Auto-select the latest review
  useEffect(() => {
    if (reviews.length > 0 && !selectedReviewId) {
      setSelectedReviewId(reviews[0].id);
    }
  }, [reviews]);

  const handleTriggerReview = () => {
    triggerReview(projectId);
  };

  const selectedReview = activeReview?.id === selectedReviewId ? activeReview : null;

  const groupedIssues: Record<string, ReviewIssue[]> = {};
  if (selectedReview?.issues) {
    for (const issue of selectedReview.issues) {
      if (!groupedIssues[issue.severity]) {
        groupedIssues[issue.severity] = [];
      }
      groupedIssues[issue.severity].push(issue);
    }
  }

  const severityOrder = ["critical", "high", "medium", "low"];

  return (
    <div className="flex flex-col h-full">
      {/* Auto-fix banner */}
      {isAutoFixing && (
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 border-b border-purple-200 text-sm text-purple-700">
          <Sparkles className="h-4 w-4 animate-pulse" />
          Auto-fixing critical issues...
        </div>
      )}

      <div className="flex flex-1 min-h-0">
      {/* Left sidebar - review list */}
      <div className="w-56 border-r flex flex-col flex-shrink-0">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-medium text-sm">Reviews</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerReview}
            disabled={isReviewing}
            className="h-7 text-xs"
          >
            {isReviewing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {reviews.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No reviews yet.
              <br />
              Reviews run automatically after builds.
            </div>
          ) : (
            reviews.map((review) => (
              <button
                key={review.id}
                onClick={() => setSelectedReviewId(review.id)}
                className={cn(
                  "w-full text-left p-3 border-b hover:bg-muted/50 transition-colors",
                  selectedReviewId === review.id && "bg-muted",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <StatusIcon status={review.status} />
                  {review.overallScore != null && (
                    <ScoreBadge score={review.overallScore} />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleString()}
                </div>
                {review.issues.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {review.issues.length} issue
                    {review.issues.length !== 1 ? "s" : ""}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right content - review detail */}
      <div className="flex-1 overflow-y-auto">
        {!selectedReview ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Search className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Select a review to view details</p>
            {reviews.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerReview}
                disabled={isReviewing}
                className="mt-4"
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  "Trigger Manual Review"
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status={selectedReview.status} />
                {selectedReview.overallScore != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {selectedReview.overallScore}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                )}
              </div>
              {selectedReview.cost != null && (
                <span className="text-xs text-muted-foreground">
                  Cost: ${selectedReview.cost.toFixed(4)}
                </span>
              )}
            </div>

            {/* Summary */}
            {selectedReview.summary && (
              <p className="text-sm text-muted-foreground border-l-2 pl-3">
                {selectedReview.summary}
              </p>
            )}

            {/* Issues */}
            {selectedReview.issues.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Issues ({selectedReview.issues.length})
                </h4>
                {severityOrder.map((severity) =>
                  groupedIssues[severity]?.length ? (
                    <div key={severity} className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground uppercase">
                        {severity} ({groupedIssues[severity].length})
                      </h5>
                      {groupedIssues[severity].map((issue, idx) => (
                        <IssueCard key={`${severity}-${idx}`} issue={issue} />
                      ))}
                    </div>
                  ) : null,
                )}
              </div>
            )}

            {/* Strengths */}
            {selectedReview.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {selectedReview.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-green-600 mt-0.5">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {selectedReview.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recommendations</h4>
                <ul className="space-y-1">
                  {selectedReview.recommendations.map((r, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-blue-600 mt-0.5">-</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
              <button
                onClick={clearError}
                className="ml-2 underline text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
