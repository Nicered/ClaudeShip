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
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    appType: AppType;
    frontendFramework?: FrontendFramework;
    backendFramework?: BackendFramework;
    features?: string[];
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

const WEB_FRONTENDS = [
  { value: FrontendFramework.REACT_VITE, icon: "⚛️", label: "React + Vite" },
  { value: FrontendFramework.NEXTJS, icon: "▲", label: "Next.js" },
  { value: FrontendFramework.VUE, icon: "💚", label: "Vue 3" },
  { value: FrontendFramework.SVELTE, icon: "🔶", label: "SvelteKit" },
];

const MOBILE_FRONTENDS = [
  { value: FrontendFramework.EXPO, icon: "📱", label: "Expo" },
  { value: FrontendFramework.REACT_NATIVE, icon: "⚛️", label: "React Native" },
  { value: FrontendFramework.FLUTTER, icon: "🐦", label: "Flutter" },
];

const BACKENDS = [
  { value: BackendFramework.EXPRESS, icon: "🟢", label: "Express" },
  { value: BackendFramework.FASTAPI, icon: "🐍", label: "FastAPI" },
  { value: BackendFramework.DJANGO, icon: "🎸", label: "Django" },
  { value: BackendFramework.NESTJS, icon: "🔴", label: "NestJS" },
];

const FEATURE_OPTIONS = [
  { id: "database-sqlite", group: "Database", label: "SQLite", description: "경량 로컬 DB" },
  { id: "database-postgres", group: "Database", label: "PostgreSQL", description: "프로덕션 DB" },
  { id: "auth-nextauth", group: "Auth", label: "NextAuth", description: "인증 (Next.js)" },
  { id: "auth-passport", group: "Auth", label: "Passport", description: "인증 (Express)" },
  { id: "ui-shadcn", group: "UI", label: "shadcn/ui", description: "React 컴포넌트" },
  { id: "ui-tailwind", group: "UI", label: "Tailwind CSS", description: "유틸리티 CSS" },
  { id: "ui-material", group: "UI", label: "Material UI", description: "Google 디자인" },
  { id: "test-playwright", group: "Testing", label: "Playwright", description: "E2E 테스트" },
  { id: "test-jest", group: "Testing", label: "Jest", description: "유닛 테스트" },
];

type WizardStep = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<WizardStep, string> = {
  1: "프로젝트 이름 & 타입",
  2: "프레임워크",
  3: "기능 선택",
  4: "확인",
};

export function CreateProjectModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateProjectModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<WizardStep>(1);
  const [name, setName] = useState("");
  const [appType, setAppType] = useState<AppType>(AppType.FULLSTACK_WEB);
  const [frontendFramework, setFrontendFramework] = useState<FrontendFramework>(
    FrontendFramework.REACT_VITE,
  );
  const [backendFramework, setBackendFramework] = useState<BackendFramework>(
    BackendFramework.EXPRESS,
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const config = APP_TYPE_CONFIG[appType];
  const isMobileApp =
    appType === AppType.MOBILE || appType === AppType.MOBILE_WITH_API;

  const handleAppTypeChange = (newAppType: AppType) => {
    setAppType(newAppType);
    const newConfig = APP_TYPE_CONFIG[newAppType];
    const isMobile =
      newAppType === AppType.MOBILE || newAppType === AppType.MOBILE_WITH_API;

    if (newConfig.showFrontend) {
      setFrontendFramework(
        isMobile ? FrontendFramework.EXPO : FrontendFramework.REACT_VITE,
      );
    }
    if (newConfig.showBackend) {
      setBackendFramework(BackendFramework.EXPRESS);
    }
  };

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      appType,
      frontendFramework: config.showFrontend ? frontendFramework : undefined,
      backendFramework: config.showBackend ? backendFramework : undefined,
      features: selectedFeatures.length > 0 ? selectedFeatures : undefined,
    });

    // Reset form
    setStep(1);
    setName("");
    setAppType(AppType.FULLSTACK_WEB);
    setFrontendFramework(FrontendFramework.REACT_VITE);
    setBackendFramework(BackendFramework.EXPRESS);
    setSelectedFeatures([]);
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    return true;
  };

  // Step 2 is skippable if no frontend/backend to choose
  const shouldSkipStep2 =
    !config.showFrontend && !config.showBackend;

  const nextStep = () => {
    if (step === 1 && shouldSkipStep2) {
      setStep(3);
    } else if (step < 4) {
      setStep((step + 1) as WizardStep);
    }
  };

  const prevStep = () => {
    if (step === 3 && shouldSkipStep2) {
      setStep(1);
    } else if (step > 1) {
      setStep((step - 1) as WizardStep);
    }
  };

  const featureGroups = FEATURE_OPTIONS.reduce(
    (acc, f) => {
      if (!acc[f.group]) acc[f.group] = [];
      acc[f.group].push(f);
      return acc;
    },
    {} as Record<string, typeof FEATURE_OPTIONS>,
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setStep(1); onOpenChange(o); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("project.createTitle")}</DialogTitle>
          <DialogDescription>
            {STEP_LABELS[step]} ({step}/4)
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1">
          {([1, 2, 3, 4] as WizardStep[]).map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="py-2 min-h-[200px]">
          {/* Step 1: Name & Type */}
          {step === 1 && (
            <div className="grid gap-4">
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
            </div>
          )}

          {/* Step 2: Framework */}
          {step === 2 && (
            <div className="grid gap-4">
              {config.showFrontend && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    {isMobileApp ? "모바일 프레임워크" : "프론트엔드"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(isMobileApp ? MOBILE_FRONTENDS : WEB_FRONTENDS).map(
                      (fw) => (
                        <Button
                          key={fw.value}
                          type="button"
                          variant={
                            frontendFramework === fw.value
                              ? "default"
                              : "outline"
                          }
                          className="h-14 flex-col gap-0.5"
                          onClick={() => setFrontendFramework(fw.value)}
                        >
                          <span className="text-base">{fw.icon}</span>
                          <span className="text-[10px]">{fw.label}</span>
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              )}

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
          )}

          {/* Step 3: Features */}
          {step === 3 && (
            <div className="grid gap-4">
              <p className="text-sm text-muted-foreground">
                추가할 기능을 선택하세요 (선택 사항)
              </p>
              {Object.entries(featureGroups).map(([group, features]) => (
                <div key={group} className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    {group}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {features.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => toggleFeature(f.id)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                          selectedFeatures.includes(f.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        <span className="font-medium">{f.label}</span>
                        <span className="text-xs ml-1 opacity-70">
                          {f.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="grid gap-3">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">이름</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">타입</span>
                  <span className="font-medium">
                    {APP_TYPE_CONFIG[appType].icon}{" "}
                    {APP_TYPE_CONFIG[appType].label}
                  </span>
                </div>
                {config.showFrontend && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      프론트엔드
                    </span>
                    <span className="font-medium">
                      {
                        (isMobileApp ? MOBILE_FRONTENDS : WEB_FRONTENDS).find(
                          (f) => f.value === frontendFramework,
                        )?.label
                      }
                    </span>
                  </div>
                )}
                {config.showBackend && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      백엔드
                    </span>
                    <span className="font-medium">
                      {BACKENDS.find((f) => f.value === backendFramework)?.label}
                    </span>
                  </div>
                )}
                {selectedFeatures.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">기능</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {selectedFeatures.map((id) => {
                        const feature = FEATURE_OPTIONS.find(
                          (f) => f.id === id,
                        );
                        return (
                          <span
                            key={id}
                            className="px-2 py-0.5 rounded text-xs bg-muted"
                          >
                            {feature?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <div>
            {step > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setStep(1); onOpenChange(false); }}
            >
              {t("common.cancel")}
            </Button>
            {step < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
              >
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? (
                  t("common.loading")
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    {t("common.create")}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
