import {
  AppType,
  FrontendFramework,
  BackendFramework,
} from "@prisma/client";

export class CreateProjectDto {
  name: string;
  appType: AppType;
  frontendFramework?: FrontendFramework;
  backendFramework?: BackendFramework;
  description?: string;
}
