/**
 * Prompt Builder Service
 *
 * 프로젝트 설정에 따라 동적으로 시스템 프롬프트를 조립
 */

import { Injectable } from "@nestjs/common";
import { FrontendFramework, BackendFramework } from "@prisma/client";

// Core sections
import {
  CORE_PRINCIPLES,
  REQUIREMENTS_CLARIFICATION,
  INCREMENTAL_BUILDING,
  CONTENT_GUIDELINES,
  CLEAN_CODE_PRINCIPLES,
  RESPONSE_FORMAT,
  SERVER_RESTRICTIONS,
  PREVIEW_RESTART,
  DEBUGGING_PROCESS,
} from "./sections/core";

// Frontend prompts
import { REACT_VITE_PROMPT } from "./frontend/react-vite";
import { NEXTJS_PROMPT } from "./frontend/nextjs";
import { VUE_PROMPT } from "./frontend/vue";
import { SVELTE_PROMPT } from "./frontend/svelte";

// Mobile prompts
import { REACT_NATIVE_PROMPT } from "./frontend/react-native";
import { EXPO_PROMPT } from "./frontend/expo";
import { FLUTTER_PROMPT } from "./frontend/flutter";

// Backend prompts
import { EXPRESS_PROMPT } from "./backend/express";
import { FASTAPI_PROMPT } from "./backend/fastapi";
import { DJANGO_PROMPT } from "./backend/django";
import { NESTJS_PROMPT } from "./backend/nestjs";

export interface PromptBuilderConfig {
  frontendFramework: FrontendFramework;
  backendFramework: BackendFramework;
  techStackConfig?: string | null;
}

@Injectable()
export class PromptBuilderService {
  /**
   * 프론트엔드와 백엔드 프레임워크에 맞는 시스템 프롬프트 생성
   */
  build(config: PromptBuilderConfig): string {
    const sections: string[] = [];

    // 1. 프로젝트 타입 소개
    sections.push(this.buildIntroSection(config));

    // 2. 코어 원칙
    sections.push(CORE_PRINCIPLES);
    sections.push(REQUIREMENTS_CLARIFICATION);
    sections.push(INCREMENTAL_BUILDING);

    // 3. 프론트엔드 프롬프트
    const frontendPrompt = this.getFrontendPrompt(config.frontendFramework);
    if (frontendPrompt) {
      sections.push(frontendPrompt);
    }

    // 4. 백엔드 프롬프트
    const backendPrompt = this.getBackendPrompt(config.backendFramework);
    if (backendPrompt) {
      sections.push(backendPrompt);
    }

    // 5. 풀스택 프로젝트 구조 가이드
    if (
      config.frontendFramework !== FrontendFramework.NONE &&
      config.backendFramework !== BackendFramework.NONE
    ) {
      sections.push(this.buildFullstackGuide(config));
    }

    // 6. 콘텐츠 가이드라인
    sections.push(CONTENT_GUIDELINES);

    // 7. 클린 코드 원칙
    sections.push(CLEAN_CODE_PRINCIPLES);

    // 8. 응답 형식
    sections.push(RESPONSE_FORMAT);

    // 9. 서버 제약사항
    sections.push(SERVER_RESTRICTIONS);

    // 10. 프리뷰 재시작
    sections.push(PREVIEW_RESTART);

    // 11. 디버깅 프로세스
    sections.push(DEBUGGING_PROCESS);

    return sections.join("\n\n---\n\n");
  }

  /**
   * 프로젝트 소개 섹션 생성
   */
  private buildIntroSection(config: PromptBuilderConfig): string {
    const frontendName = this.getFrontendFrameworkName(config.frontendFramework);
    const backendName = this.getBackendFrameworkName(config.backendFramework);

    let intro = `# Project Configuration\n\n`;

    if (
      config.frontendFramework !== FrontendFramework.NONE &&
      config.backendFramework !== BackendFramework.NONE
    ) {
      intro += `You are building a **full-stack application** with:\n`;
      intro += `- **Frontend**: ${frontendName}\n`;
      intro += `- **Backend**: ${backendName}\n\n`;
      intro += `**CRITICAL**: Complete BOTH frontend AND backend before reporting completion.`;
    } else if (config.frontendFramework !== FrontendFramework.NONE) {
      intro += `You are building a **frontend-only application** with:\n`;
      intro += `- **Framework**: ${frontendName}\n\n`;
      intro += `Focus on creating a beautiful, responsive, and functional frontend.`;
    } else if (config.backendFramework !== BackendFramework.NONE) {
      intro += `You are building a **backend-only API** with:\n`;
      intro += `- **Framework**: ${backendName}\n\n`;
      intro += `Focus on creating a robust, well-documented API.`;
    }

    return intro;
  }

  /**
   * 풀스택 프로젝트 구조 가이드
   */
  private buildFullstackGuide(config: PromptBuilderConfig): string {
    return `## Full-stack Project Structure

\`\`\`
project/
├── frontend/                 # Frontend application
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/                  # Backend server
│   ├── src/
│   ├── package.json (or requirements.txt)
│   └── ...
└── README.md
\`\`\`

### Critical Requirements

1. **Both directories must exist** with proper configuration files
2. **Frontend API client** must be configured to call backend API
3. **CORS** must be configured on the backend
4. **Environment variables** must be set for API URLs

### Build Order for Full-stack

1. Create backend first (API, database schema, routes)
2. Create frontend second (UI, API client, pages)
3. Verify both have package.json with dev scripts
4. Only then report completion`;
  }

  /**
   * 프론트엔드 프레임워크 프롬프트 반환
   */
  private getFrontendPrompt(framework: FrontendFramework): string | null {
    switch (framework) {
      // Web frameworks
      case FrontendFramework.REACT_VITE:
        return REACT_VITE_PROMPT;
      case FrontendFramework.NEXTJS:
        return NEXTJS_PROMPT;
      case FrontendFramework.VUE:
        return VUE_PROMPT;
      case FrontendFramework.SVELTE:
        return SVELTE_PROMPT;
      // Mobile frameworks
      case FrontendFramework.REACT_NATIVE:
        return REACT_NATIVE_PROMPT;
      case FrontendFramework.EXPO:
        return EXPO_PROMPT;
      case FrontendFramework.FLUTTER:
        return FLUTTER_PROMPT;
      case FrontendFramework.NONE:
        return null;
    }
  }

  /**
   * 백엔드 프레임워크 프롬프트 반환
   */
  private getBackendPrompt(framework: BackendFramework): string | null {
    switch (framework) {
      case BackendFramework.EXPRESS:
        return EXPRESS_PROMPT;
      case BackendFramework.FASTAPI:
        return FASTAPI_PROMPT;
      case BackendFramework.DJANGO:
        return DJANGO_PROMPT;
      case BackendFramework.NESTJS:
        return NESTJS_PROMPT;
      case BackendFramework.NONE:
        return null;
    }
  }

  /**
   * 프론트엔드 프레임워크 이름 반환
   */
  private getFrontendFrameworkName(framework: FrontendFramework): string {
    switch (framework) {
      // Web frameworks
      case FrontendFramework.REACT_VITE:
        return "React + Vite + Tailwind CSS";
      case FrontendFramework.NEXTJS:
        return "Next.js + Tailwind CSS";
      case FrontendFramework.VUE:
        return "Vue 3 + Vite + Tailwind CSS";
      case FrontendFramework.SVELTE:
        return "SvelteKit + Tailwind CSS";
      // Mobile frameworks
      case FrontendFramework.REACT_NATIVE:
        return "React Native";
      case FrontendFramework.EXPO:
        return "Expo (React Native)";
      case FrontendFramework.FLUTTER:
        return "Flutter (Dart)";
      case FrontendFramework.NONE:
        return "None";
    }
  }

  /**
   * 백엔드 프레임워크 이름 반환
   */
  private getBackendFrameworkName(framework: BackendFramework): string {
    switch (framework) {
      case BackendFramework.EXPRESS:
        return "Express + TypeScript + Prisma";
      case BackendFramework.FASTAPI:
        return "FastAPI + Python + SQLAlchemy";
      case BackendFramework.DJANGO:
        return "Django + Django REST Framework";
      case BackendFramework.NESTJS:
        return "NestJS + TypeScript + Prisma";
      case BackendFramework.NONE:
        return "None";
    }
  }
}
