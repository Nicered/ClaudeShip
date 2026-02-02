export type ReviewStatus = "RUNNING" | "COMPLETED" | "FAILED" | "AUTO_FIXING";
export type IssueSeverity = "critical" | "high" | "medium" | "low";
export type IssueCategory =
  | "security"
  | "bug"
  | "architecture"
  | "performance"
  | "quality";

export interface ReviewIssue {
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  description: string;
  file?: string;
  line?: number;
  suggestion?: string;
  autoFixable?: boolean;
}

export interface ReviewResult {
  summary: string;
  overallScore: number;
  issues: ReviewIssue[];
  strengths: string[];
  recommendations: string[];
}

export interface Review {
  id: string;
  projectId: string;
  status: ReviewStatus;
  summary?: string;
  overallScore?: number;
  issues: ReviewIssue[];
  strengths: string[];
  recommendations: string[];
  cost?: number;
  triggerMessageId?: string;
  createdAt: string;
  completedAt?: string;
}
