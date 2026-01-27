import { FrontendFramework, TechStackConfig, AppType } from "./tech-stack";

// @deprecated Use AppType instead
export enum ProjectType {
  WEB = "WEB",
  NATIVE = "NATIVE",
}

export enum BackendFramework {
  NONE = "NONE",
  EXPRESS = "EXPRESS",
  FASTAPI = "FASTAPI",
  DJANGO = "DJANGO",
  NESTJS = "NESTJS",
}

export { FrontendFramework, AppType } from "./tech-stack";
export type { TechStackConfig } from "./tech-stack";

export enum DatabaseProvider {
  POSTGRES_DOCKER = "POSTGRES_DOCKER",
  SQLITE = "SQLITE",
}

export const projectTypeLabels: Record<ProjectType, string> = {
  [ProjectType.WEB]: "웹앱",
  [ProjectType.NATIVE]: "네이티브 앱",
};

export const backendFrameworkLabels: Record<BackendFramework, string> = {
  [BackendFramework.NONE]: "프론트엔드 전용",
  [BackendFramework.EXPRESS]: "Express (Node.js)",
  [BackendFramework.FASTAPI]: "FastAPI (Python)",
  [BackendFramework.DJANGO]: "Django (Python)",
  [BackendFramework.NESTJS]: "NestJS (Node.js)",
};

export interface Project {
  id: string;
  name: string;
  appType: AppType;
  projectType: ProjectType; // @deprecated
  frontendFramework: FrontendFramework;
  backendFramework: BackendFramework;
  techStackConfig?: TechStackConfig;
  path: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  appType: AppType;
  frontendFramework?: FrontendFramework;
  backendFramework?: BackendFramework;
  description?: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  appType: AppType;
  frontendFramework: FrontendFramework;
  backendFramework: BackendFramework;
  databaseProvider?: DatabaseProvider | null;
  updatedAt: Date;
}
