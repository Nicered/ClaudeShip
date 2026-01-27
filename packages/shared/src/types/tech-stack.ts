/**
 * Tech Stack Types
 *
 * 프레임워크 및 기술 스택 관련 타입 정의
 */

export enum FrontendFramework {
  // Web
  REACT_VITE = "REACT_VITE", // React + Vite (default)
  NEXTJS = "NEXTJS", // Next.js
  VUE = "VUE", // Vue 3 + Vite
  SVELTE = "SVELTE", // SvelteKit
  // Mobile
  REACT_NATIVE = "REACT_NATIVE", // React Native
  FLUTTER = "FLUTTER", // Flutter (Dart)
  EXPO = "EXPO", // Expo (React Native based)
  // None
  NONE = "NONE", // Backend only
}

export enum AppType {
  FULLSTACK_WEB = "FULLSTACK_WEB", // Frontend + Backend
  FRONTEND_ONLY = "FRONTEND_ONLY", // Static site / SPA
  API_ONLY = "API_ONLY", // Backend only
  MOBILE = "MOBILE", // Mobile app only
  MOBILE_WITH_API = "MOBILE_WITH_API", // Mobile app + Backend
}

export const appTypeLabels: Record<AppType, string> = {
  [AppType.FULLSTACK_WEB]: "풀스택 웹앱",
  [AppType.FRONTEND_ONLY]: "프론트엔드 전용",
  [AppType.API_ONLY]: "API 서버",
  [AppType.MOBILE]: "모바일 앱",
  [AppType.MOBILE_WITH_API]: "모바일 앱 + API",
};

export enum CssFramework {
  TAILWIND = "TAILWIND", // Tailwind CSS (default)
  VANILLA = "VANILLA", // Vanilla CSS
  SCSS = "SCSS", // SCSS/Sass
}

export enum UiLibrary {
  SHADCN = "SHADCN", // shadcn/ui (default for React)
  NONE = "NONE", // No UI library
}

export interface TechStackConfig {
  cssFramework?: CssFramework;
  uiLibrary?: UiLibrary;
  stateManagement?: string; // zustand, pinia, etc.
  additionalLibraries?: string[];
}

export const frontendFrameworkLabels: Record<FrontendFramework, string> = {
  // Web
  [FrontendFramework.REACT_VITE]: "React + Vite",
  [FrontendFramework.NEXTJS]: "Next.js",
  [FrontendFramework.VUE]: "Vue 3 + Vite",
  [FrontendFramework.SVELTE]: "SvelteKit",
  // Mobile
  [FrontendFramework.REACT_NATIVE]: "React Native",
  [FrontendFramework.FLUTTER]: "Flutter",
  [FrontendFramework.EXPO]: "Expo",
  // None
  [FrontendFramework.NONE]: "없음",
};

export const defaultTechStackConfig: TechStackConfig = {
  cssFramework: CssFramework.TAILWIND,
  uiLibrary: UiLibrary.SHADCN,
  stateManagement: "zustand",
  additionalLibraries: [],
};
