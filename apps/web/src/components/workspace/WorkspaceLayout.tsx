"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { FileExplorer } from "@/components/file/FileExplorer";
import { FileViewer } from "@/components/file/FileViewer";
import { DatabasePanel } from "@/components/database/DatabasePanel";
import { TestRunner } from "@/components/testing/TestRunner";
import { CheckpointPanel } from "@/components/checkpoint/CheckpointPanel";
import { EnvPanel } from "@/components/env/EnvPanel";
import { ArchitectPanel } from "@/components/architect/ArchitectPanel";
import { ProjectContextPanel } from "@/components/project-context/ProjectContextPanel";
import {
  FolderTree,
  X,
  Eye,
  Database,
  FlaskConical,
  GitBranch,
  Settings2,
  Search,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

interface WorkspaceLayoutProps {
  projectId: string;
}

interface SelectedFile {
  path: string;
  content: string;
  extension: string;
}

type RightPanelTab = "preview" | "database" | "testing" | "checkpoint" | "env" | "review" | "context";

const tabConfig: { id: RightPanelTab; icon: React.ReactNode; label: string }[] = [
  { id: "preview", icon: <Eye className="h-4 w-4" />, label: "Preview" },
  { id: "database", icon: <Database className="h-4 w-4" />, label: "Database" },
  { id: "testing", icon: <FlaskConical className="h-4 w-4" />, label: "Testing" },
  { id: "review", icon: <Search className="h-4 w-4" />, label: "Review" },
  { id: "checkpoint", icon: <GitBranch className="h-4 w-4" />, label: "Checkpoint" },
  { id: "env", icon: <Settings2 className="h-4 w-4" />, label: "Env" },
  { id: "context", icon: <FileText className="h-4 w-4" />, label: "Context" },
];

export function WorkspaceLayout({ projectId }: WorkspaceLayoutProps) {
  const { t } = useTranslation();
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [activeTab, setActiveTab] = useState<RightPanelTab>("preview");

  const handleFileSelect = (path: string, content: string) => {
    const extension = path.split(".").pop() || "";
    setSelectedFile({ path, content, extension });
  };

  const handleCloseViewer = () => {
    setSelectedFile(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "preview":
        return <PreviewPanel projectId={projectId} />;
      case "database":
        return <DatabasePanel projectId={projectId} />;
      case "testing":
        return <TestRunner projectId={projectId} />;
      case "checkpoint":
        return <CheckpointPanel projectId={projectId} />;
      case "env":
        return <EnvPanel projectId={projectId} />;
      case "review":
        return <ArchitectPanel projectId={projectId} />;
      case "context":
        return <ProjectContextPanel projectId={projectId} />;
      default:
        return <PreviewPanel projectId={projectId} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* File Explorer Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFileExplorer(!showFileExplorer)}
        className="absolute left-4 top-16 z-10 h-8 w-8 p-0"
        title={showFileExplorer ? t("fileExplorer.close") : t("fileExplorer.open")}
      >
        {showFileExplorer ? (
          <X className="h-4 w-4" />
        ) : (
          <FolderTree className="h-4 w-4" />
        )}
      </Button>

      {/* File Explorer Panel */}
      {showFileExplorer && (
        <div className="w-64 border-r bg-muted/30 flex-shrink-0">
          <FileExplorer projectId={projectId} onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* Chat Panel - 30% width */}
      <div
        className="border-r flex-shrink-0"
        style={{ width: showFileExplorer ? "calc(30% - 8rem)" : "30%" }}
      >
        <ChatPanel projectId={projectId} />
      </div>

      {/* Right Panel - 70% width */}
      <div
        className="flex-1 flex flex-col"
        style={{ width: showFileExplorer ? "calc(70%)" : "70%" }}
      >
        {/* Tab Bar */}
        <div className="flex items-center border-b bg-muted/30 px-2">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              title={tab.label}
            >
              {tab.icon}
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewer
          path={selectedFile.path}
          content={selectedFile.content}
          language={selectedFile.extension}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}
