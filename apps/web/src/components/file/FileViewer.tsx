"use client";

import { X, Copy, Check, Save, Pencil, Eye } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";

interface FileViewerProps {
  path: string;
  content: string;
  language: string;
  projectId?: string;
  onClose: () => void;
}

const languageMap: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  py: "python",
  json: "json",
  md: "markdown",
  css: "css",
  scss: "scss",
  html: "markup",
  prisma: "graphql",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  yml: "yaml",
  yaml: "yaml",
  env: "bash",
  gitignore: "bash",
};

const binaryExtensions = ["png", "jpg", "jpeg", "gif", "ico", "woff", "woff2", "ttf", "eot", "pdf", "zip"];

function getLanguage(extension: string): string {
  return languageMap[extension] || "typescript";
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

export function FileViewer({ path, content, language, projectId, onClose }: FileViewerProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileName = getFileName(path);
  const prismLanguage = getLanguage(language);
  const canEdit = projectId && !binaryExtensions.includes(language);

  useEffect(() => {
    setHasChanges(editContent !== content);
  }, [editContent, content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(isEditing ? editContent : content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = useCallback(async () => {
    if (!projectId || !hasChanges) return;
    setIsSaving(true);
    try {
      await api.put(`/projects/${projectId}/files/content`, {
        path,
        content: editContent,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save file:", error);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, path, editContent, hasChanges]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave],
  );

  const toggleEdit = () => {
    if (isEditing && hasChanges) {
      if (!confirm("Discard unsaved changes?")) return;
      setEditContent(content);
    }
    setIsEditing(!isEditing);
  };

  const displayContent = isEditing ? editContent : content;
  const lines = displayContent.split("\n");

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 z-50 flex flex-col rounded-lg border bg-background shadow-lg md:inset-8 lg:inset-16">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{fileName}</span>
            <span className="text-xs text-muted-foreground">{path}</span>
            {hasChanges && (
              <span className="w-2 h-2 rounded-full bg-orange-500" title="Unsaved changes" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">
              {lines.length} lines
            </span>
            {canEdit && (
              <Button
                variant={isEditing ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={toggleEdit}
                title={isEditing ? "View mode" : "Edit mode"}
              >
                {isEditing ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </Button>
            )}
            {isEditing && hasChanges && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSave}
                disabled={isSaving}
                title="Save (Ctrl+S)"
              >
                <Save className={`h-4 w-4 ${isSaving ? "animate-spin" : "text-green-500"}`} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy"}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              title={t("common.close")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#1e1e1e]" onKeyDown={handleKeyDown}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full bg-[#1e1e1e] text-zinc-200 font-mono text-sm p-4 resize-none outline-none leading-relaxed"
              spellCheck={false}
              autoFocus
            />
          ) : (
            <Highlight theme={themes.vsDark} code={content} language={prismLanguage}>
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className="text-sm leading-relaxed"
                  style={{
                    ...style,
                    margin: 0,
                    padding: "1rem",
                    background: "#1e1e1e",
                    minHeight: "100%",
                  }}
                >
                  <code className={className}>
                    {tokens.map((line, i) => {
                      const { key: _lineKey, ...lineProps } = getLineProps({ line });
                      return (
                        <div
                          key={i}
                          {...lineProps}
                          className="table-row hover:bg-white/5"
                        >
                          <span className="table-cell select-none pr-4 text-right text-gray-500 w-12">
                            {i + 1}
                          </span>
                          <span className="table-cell">
                            {line.map((token, index) => {
                              const { key: _key, ...tokenProps } = getTokenProps({ token });
                              return <span key={index} {...tokenProps} />;
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </code>
                </pre>
              )}
            </Highlight>
          )}
        </div>
      </div>
    </div>
  );
}
