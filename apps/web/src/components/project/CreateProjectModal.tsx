"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AppType,
  FrontendFramework,
  BackendFramework,
} from "@claudeship/shared";
import { useTranslation } from "@/lib/i18n";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    appType: AppType;
    frontendFramework?: FrontendFramework;
    backendFramework?: BackendFramework;
  }) => void;
  isLoading?: boolean;
}

// App type configurations
const APP_TYPE_CONFIG = {
  [AppType.FULLSTACK_WEB]: {
    icon: "🌐",
    label: "풀스택 웹앱",
    description: "프론트엔드 + 백엔드",
    showFrontend: true,
    showBackend: true,
    webOnly: true,
  },
  [AppType.FRONTEND_ONLY]: {
    icon: "⚡",
    label: "프론트엔드",
    description: "정적 사이트 / SPA",
    showFrontend: true,
    showBackend: false,
    webOnly: true,
  },
  [AppType.API_ONLY]: {
    icon: "🔌",
    label: "API 서버",
    description: "백엔드만",
    showFrontend: false,
    showBackend: true,
    webOnly: false,
  },
  [AppType.MOBILE]: {
    icon: "📱",
    label: "모바일 앱",
    description: "React Native / Flutter",
    showFrontend: true,
    showBackend: false,
    webOnly: false,
  },
  [AppType.MOBILE_WITH_API]: {
    icon: "📱🔌",
    label: "모바일 + API",
    description: "모바일 앱 + 백엔드",
    showFrontend: true,
    showBackend: true,
    webOnly: false,
  },
};

// Web frontend frameworks
const WEB_FRONTENDS = [
  { value: FrontendFramework.REACT_VITE, icon: "⚛️", label: "React + Vite" },
  { value: FrontendFramework.NEXTJS, icon: "▲", label: "Next.js" },
  { value: FrontendFramework.VUE, icon: "💚", label: "Vue 3" },
  { value: FrontendFramework.SVELTE, icon: "🔶", label: "SvelteKit" },
];

// Mobile frontend frameworks
const MOBILE_FRONTENDS = [
  { value: FrontendFramework.EXPO, icon: "📱", label: "Expo" },
  { value: FrontendFramework.REACT_NATIVE, icon: "⚛️", label: "React Native" },
  { value: FrontendFramework.FLUTTER, icon: "🐦", label: "Flutter" },
];

// Backend frameworks
const BACKENDS = [
  { value: BackendFramework.EXPRESS, icon: "🟢", label: "Express" },
  { value: BackendFramework.FASTAPI, icon: "🐍", label: "FastAPI" },
  { value: BackendFramework.DJANGO, icon: "🎸", label: "Django" },
  { value: BackendFramework.NESTJS, icon: "🔴", label: "NestJS" },
];

export function CreateProjectModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateProjectModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [appType, setAppType] = useState<AppType>(AppType.FULLSTACK_WEB);
  const [frontendFramework, setFrontendFramework] = useState<FrontendFramework>(
    FrontendFramework.REACT_VITE
  );
  const [backendFramework, setBackendFramework] = useState<BackendFramework>(
    BackendFramework.EXPRESS
  );

  const config = APP_TYPE_CONFIG[appType];
  const isMobileApp =
    appType === AppType.MOBILE || appType === AppType.MOBILE_WITH_API;

  const handleAppTypeChange = (newAppType: AppType) => {
    setAppType(newAppType);
    // Reset frameworks based on app type
    const newConfig = APP_TYPE_CONFIG[newAppType];
    const isMobile =
      newAppType === AppType.MOBILE || newAppType === AppType.MOBILE_WITH_API;

    if (newConfig.showFrontend) {
      setFrontendFramework(
        isMobile ? FrontendFramework.EXPO : FrontendFramework.REACT_VITE
      );
    }
    if (newConfig.showBackend) {
      setBackendFramework(BackendFramework.EXPRESS);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      appType,
      frontendFramework: config.showFrontend ? frontendFramework : undefined,
      backendFramework: config.showBackend ? backendFramework : undefined,
    });

    // Reset form
    setName("");
    setAppType(AppType.FULLSTACK_WEB);
    setFrontendFramework(FrontendFramework.REACT_VITE);
    setBackendFramework(BackendFramework.EXPRESS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("project.createTitle")}</DialogTitle>
            <DialogDescription>
              새 프로젝트의 이름과 타입을 선택하세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Project Name */}
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t("project.name")}
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("project.namePlaceholder")}
                autoFocus
              />
            </div>

            {/* App Type Selection */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">앱 타입</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(APP_TYPE_CONFIG).map(([type, cfg]) => (
                  <Button
                    key={type}
                    type="button"
                    variant={appType === type ? "default" : "outline"}
                    className="h-16 flex-col gap-0.5"
                    onClick={() => handleAppTypeChange(type as AppType)}
                  >
                    <span className="text-lg">{cfg.icon}</span>
                    <span className="text-xs font-medium">{cfg.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {cfg.description}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Frontend Framework Selection */}
            {config.showFrontend && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  {isMobileApp ? "모바일 프레임워크" : "프론트엔드"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(isMobileApp ? MOBILE_FRONTENDS : WEB_FRONTENDS).map((fw) => (
                    <Button
                      key={fw.value}
                      type="button"
                      variant={
                        frontendFramework === fw.value ? "default" : "outline"
                      }
                      className="h-14 flex-col gap-0.5"
                      onClick={() => setFrontendFramework(fw.value)}
                    >
                      <span className="text-base">{fw.icon}</span>
                      <span className="text-[10px]">{fw.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Backend Framework Selection */}
            {config.showBackend && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">백엔드</label>
                <div className="grid grid-cols-4 gap-2">
                  {BACKENDS.map((fw) => (
                    <Button
                      key={fw.value}
                      type="button"
                      variant={
                        backendFramework === fw.value ? "default" : "outline"
                      }
                      className="h-14 flex-col gap-0.5"
                      onClick={() => setBackendFramework(fw.value)}
                    >
                      <span className="text-base">{fw.icon}</span>
                      <span className="text-[10px]">{fw.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
