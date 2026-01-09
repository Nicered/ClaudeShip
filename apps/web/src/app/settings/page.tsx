"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Check, AlertCircle, Loader2, Database, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

interface Settings {
  projectsBasePath: string;
}

interface InfraStatus {
  docker: {
    available: boolean;
    version?: string;
    error?: string;
  };
  defaultProvider: "postgres_docker" | "sqlite";
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projectsPath, setProjectsPath] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Database infrastructure state
  const [infraStatus, setInfraStatus] = useState<InfraStatus | null>(null);
  const [isLoadingInfra, setIsLoadingInfra] = useState(true);
  const [isRefreshingInfra, setIsRefreshingInfra] = useState(false);

  useEffect(() => {
    loadSettings();
    loadInfraStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get<Settings>("/settings");
      setSettings(data);
      setProjectsPath(data.projectsBasePath);
    } catch {
      setError("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInfraStatus = async () => {
    try {
      const data = await api.get<InfraStatus>("/database/status");
      setInfraStatus(data);
    } catch {
      // Silently fail - infrastructure status is optional
    } finally {
      setIsLoadingInfra(false);
    }
  };

  const refreshInfraStatus = async () => {
    setIsRefreshingInfra(true);
    try {
      const data = await api.post<InfraStatus>("/database/refresh");
      setInfraStatus(data);
    } catch {
      // Silently fail
    } finally {
      setIsRefreshingInfra(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await api.put<{ success: boolean; error?: string; path?: string }>(
        "/settings/projects-path",
        { path: projectsPath }
      );

      if (result.success) {
        setSuccess(true);
        setProjectsPath(result.path || projectsPath);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = settings && projectsPath !== settings.projectsBasePath;

  return (
    <div className="flex min-h-screen flex-col">
      <Header title={t("settings.title")} showBack backHref="/" />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Projects Path Setting */}
          <section className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{t("settings.projectsPath.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("settings.projectsPath.description")}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={projectsPath}
                    onChange={(e) => setProjectsPath(e.target.value)}
                    placeholder="~/claudeship-projects"
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("common.save")
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    {t("settings.projectsPath.saved")}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {t("settings.projectsPath.note")}
                </p>
              </div>
            )}
          </section>

          {/* Database Infrastructure */}
          <section className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">데이터베이스 인프라</h2>
                  <p className="text-sm text-muted-foreground">
                    프로젝트별 데이터베이스 자동 관리
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshInfraStatus}
                disabled={isRefreshingInfra}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingInfra ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {isLoadingInfra ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : infraStatus ? (
              <div className="space-y-4">
                {/* Docker Status */}
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      infraStatus.docker.available ? "bg-green-500" : "bg-yellow-500"
                    }`} />
                    <div>
                      <p className="font-medium">Docker</p>
                      <p className="text-sm text-muted-foreground">
                        {infraStatus.docker.available
                          ? `v${infraStatus.docker.version}`
                          : "설치되지 않음 또는 실행 중이 아님"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    infraStatus.docker.available ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {infraStatus.docker.available ? "실행 중" : "비활성"}
                  </span>
                </div>

                {/* Default Provider */}
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground mb-2">기본 데이터베이스</p>
                  <div className="flex items-center gap-2">
                    {infraStatus.defaultProvider === "postgres_docker" ? (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500/10">
                          <span className="text-xs font-bold text-blue-600">PG</span>
                        </div>
                        <div>
                          <p className="font-medium">PostgreSQL (Docker)</p>
                          <p className="text-xs text-muted-foreground">
                            프로젝트별 독립 컨테이너
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500/10">
                          <span className="text-xs font-bold text-amber-600">SL</span>
                        </div>
                        <div>
                          <p className="font-medium">SQLite</p>
                          <p className="text-xs text-muted-foreground">
                            경량 파일 기반 DB (폴백)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Info */}
                <p className="text-xs text-muted-foreground">
                  {infraStatus.docker.available
                    ? "Docker가 감지되어 새 프로젝트에 PostgreSQL이 자동으로 생성됩니다."
                    : "Docker가 없어 SQLite로 폴백됩니다. Docker를 설치하면 PostgreSQL을 사용할 수 있습니다."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                인프라 상태를 불러올 수 없습니다.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
