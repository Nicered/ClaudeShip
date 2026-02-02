"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Sparkles, Save } from "lucide-react";

interface ProjectContextPanelProps {
  projectId: string;
}

export function ProjectContextPanel({ projectId }: ProjectContextPanelProps) {
  const [content, setContent] = useState<string>("");
  const [exists, setExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const loadContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { exists: hasContext } = await api.get<{ exists: boolean }>(
        `/projects/${projectId}/context/exists`,
      );
      setExists(hasContext);

      if (hasContext) {
        const { content: ctx } = await api.get<{
          exists: boolean;
          content: string | null;
        }>(`/projects/${projectId}/context`);
        setContent(ctx || "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load context");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (exists) {
        await api.put(`/projects/${projectId}/context`, { content });
      } else {
        await api.post(`/projects/${projectId}/context`, { content });
        setExists(true);
      }
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const { template } = await api.get<{ template: string }>(
        `/projects/${projectId}/context/template`,
      );
      setContent(template);
      setIsDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate template");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!exists && !isDirty) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <FileText className="h-12 w-12 opacity-50" />
        <p className="text-sm">No PROJECT.md found</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generate Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setContent("# Project Name\n\n## Overview\n\n");
              setIsDirty(true);
            }}
          >
            Create Empty
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">PROJECT.md</span>
          {isDirty && (
            <span className="text-xs text-muted-foreground">(unsaved)</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-7 text-xs"
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            Generate
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="h-7 text-xs"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 w-full p-4 font-mono text-sm resize-none bg-background focus:outline-none"
        placeholder="# Project Name&#10;&#10;Write your PROJECT.md content here..."
        spellCheck={false}
      />
    </div>
  );
}
