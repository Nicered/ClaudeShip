"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Check, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

interface Settings {
  projectsBasePath: string;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [projectsPath, setProjectsPath] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get<Settings>("/settings");
      setSettings(data);
      setProjectsPath(data.projectsBasePath);
    } catch (err) {
      setError("Failed to load settings");
    } finally {
      setIsLoading(false);
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
        </div>
      </main>
    </div>
  );
}
