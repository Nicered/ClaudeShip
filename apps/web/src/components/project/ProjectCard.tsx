"use client";

import Link from "next/link";
import { Trash2, Globe, Smartphone, Server, Database, Zap, Code } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectListItem } from "@claudeship/shared";
import {
  AppType,
  BackendFramework,
  FrontendFramework,
  DatabaseProvider,
} from "@claudeship/shared";
import { useTranslation } from "@/lib/i18n";

interface ProjectCardProps {
  project: ProjectListItem;
  onDelete?: (id: string) => void;
}

function formatRelativeTime(date: Date, locale: string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (locale === "ko") {
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return new Date(date).toLocaleDateString("ko-KR");
  } else {
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US");
  }
}

function getAppTypeIcon(appType: AppType) {
  switch (appType) {
    case AppType.FULLSTACK_WEB:
      return <Globe className="h-5 w-5" />;
    case AppType.FRONTEND_ONLY:
      return <Zap className="h-5 w-5" />;
    case AppType.API_ONLY:
      return <Server className="h-5 w-5" />;
    case AppType.MOBILE:
      return <Smartphone className="h-5 w-5" />;
    case AppType.MOBILE_WITH_API:
      return <Smartphone className="h-5 w-5" />;
    default:
      return <Code className="h-5 w-5" />;
  }
}

function getGradientClass(appType: AppType) {
  switch (appType) {
    case AppType.FULLSTACK_WEB:
      return "from-blue-500/20 to-indigo-500/5";
    case AppType.FRONTEND_ONLY:
      return "from-yellow-500/20 to-orange-500/5";
    case AppType.API_ONLY:
      return "from-green-500/20 to-emerald-500/5";
    case AppType.MOBILE:
      return "from-purple-500/20 to-pink-500/5";
    case AppType.MOBILE_WITH_API:
      return "from-violet-500/20 to-purple-500/5";
    default:
      return "from-gray-500/20 to-slate-500/5";
  }
}

function getAppTypeLabel(appType: AppType): string {
  switch (appType) {
    case AppType.FULLSTACK_WEB:
      return "Fullstack";
    case AppType.FRONTEND_ONLY:
      return "Frontend";
    case AppType.API_ONLY:
      return "API";
    case AppType.MOBILE:
      return "Mobile";
    case AppType.MOBILE_WITH_API:
      return "Mobile+API";
    default:
      return "Unknown";
  }
}

function getFrontendLabel(framework: FrontendFramework): string {
  switch (framework) {
    case FrontendFramework.REACT_VITE:
      return "React";
    case FrontendFramework.NEXTJS:
      return "Next.js";
    case FrontendFramework.VUE:
      return "Vue";
    case FrontendFramework.SVELTE:
      return "Svelte";
    case FrontendFramework.REACT_NATIVE:
      return "RN";
    case FrontendFramework.EXPO:
      return "Expo";
    case FrontendFramework.FLUTTER:
      return "Flutter";
    default:
      return "";
  }
}

function getBackendLabel(framework: BackendFramework): string {
  switch (framework) {
    case BackendFramework.EXPRESS:
      return "Express";
    case BackendFramework.FASTAPI:
      return "FastAPI";
    case BackendFramework.DJANGO:
      return "Django";
    case BackendFramework.NESTJS:
      return "NestJS";
    default:
      return "";
  }
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { locale } = useTranslation();
  const gradientClass = getGradientClass(project.appType);

  return (
    <Link href={`/project/${project.id}`}>
      <Card className="group relative cursor-pointer overflow-hidden border transition-all hover:border-primary/50 hover:shadow-lg">
        {/* Gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 transition-opacity group-hover:opacity-100`}
        />

        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {getAppTypeIcon(project.appType)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{project.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(project.updatedAt, locale)}
                </p>
              </div>
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(project.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {/* App Type */}
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              {getAppTypeLabel(project.appType)}
            </span>

            {/* Frontend Framework */}
            {project.frontendFramework &&
              project.frontendFramework !== FrontendFramework.NONE && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 px-2.5 py-0.5 text-xs font-medium">
                  {getFrontendLabel(project.frontendFramework)}
                </span>
              )}

            {/* Backend Framework */}
            {project.backendFramework &&
              project.backendFramework !== BackendFramework.NONE && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 text-green-600 px-2.5 py-0.5 text-xs font-medium">
                  <Server className="h-3 w-3" />
                  {getBackendLabel(project.backendFramework)}
                </span>
              )}

            {/* Database Provider */}
            {project.databaseProvider && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  project.databaseProvider === DatabaseProvider.POSTGRES_DOCKER
                    ? "bg-blue-500/10 text-blue-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                <Database className="h-3 w-3" />
                {project.databaseProvider === DatabaseProvider.POSTGRES_DOCKER
                  ? "PostgreSQL"
                  : "SQLite"}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
