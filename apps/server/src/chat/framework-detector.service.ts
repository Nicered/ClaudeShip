/**
 * Framework Detector Service
 *
 * 사용자 메시지에서 프레임워크 키워드를 감지하고 변경 의도를 파악
 */

import { Injectable, Logger } from "@nestjs/common";
import { FrontendFramework, BackendFramework } from "@prisma/client";

export interface DetectionResult {
  detected: boolean;
  frontendFramework?: FrontendFramework;
  backendFramework?: BackendFramework;
  confidence: number; // 0-1
  matchedKeywords: string[];
}

interface KeywordMapping {
  keywords: string[];
  framework: FrontendFramework | BackendFramework;
  type: "frontend" | "backend";
}

@Injectable()
export class FrameworkDetectorService {
  private readonly logger = new Logger(FrameworkDetectorService.name);

  // 프레임워크 키워드 매핑
  private readonly keywordMappings: KeywordMapping[] = [
    // Frontend frameworks
    {
      keywords: ["react", "vite", "react+vite", "react vite"],
      framework: FrontendFramework.REACT_VITE,
      type: "frontend",
    },
    {
      keywords: ["next", "nextjs", "next.js", "next js"],
      framework: FrontendFramework.NEXTJS,
      type: "frontend",
    },
    {
      keywords: ["vue", "vue3", "vue 3", "vue.js", "vuejs", "nuxt"],
      framework: FrontendFramework.VUE,
      type: "frontend",
    },
    {
      keywords: ["svelte", "sveltekit", "svelte kit"],
      framework: FrontendFramework.SVELTE,
      type: "frontend",
    },
    // Mobile frameworks
    {
      keywords: ["react native", "react-native", "reactnative", "rn"],
      framework: FrontendFramework.REACT_NATIVE,
      type: "frontend",
    },
    {
      keywords: ["flutter", "dart"],
      framework: FrontendFramework.FLUTTER,
      type: "frontend",
    },
    {
      keywords: ["expo"],
      framework: FrontendFramework.EXPO,
      type: "frontend",
    },
    // Backend frameworks
    {
      keywords: ["express", "expressjs", "express.js", "express js"],
      framework: BackendFramework.EXPRESS,
      type: "backend",
    },
    {
      keywords: ["fastapi", "fast api", "fast-api"],
      framework: BackendFramework.FASTAPI,
      type: "backend",
    },
    {
      keywords: ["django", "drf", "django rest"],
      framework: BackendFramework.DJANGO,
      type: "backend",
    },
    {
      keywords: ["nest", "nestjs", "nest.js", "nest js"],
      framework: BackendFramework.NESTJS,
      type: "backend",
    },
  ];

  // 의도 패턴 (프레임워크 변경을 원하는 표현)
  private readonly intentPatterns: RegExp[] = [
    // Korean patterns
    /(?:로|으로)\s*(?:만들|바꿔|변경|전환|사용)/i,
    /(?:쓰|사용)(?:자|할게|해)/i,
    /(?:로|으로)\s*(?:해|해줘|할래)/i,
    // English patterns
    /(?:use|switch\s+to|change\s+to|convert\s+to|migrate\s+to)/i,
    /(?:let's\s+use|i\s+want\s+to\s+use|can\s+we\s+use)/i,
    /(?:build\s+with|create\s+with|develop\s+with)/i,
  ];

  /**
   * 메시지에서 프레임워크 변경 의도 감지
   */
  detect(
    message: string,
    currentFrontend: FrontendFramework,
    currentBackend: BackendFramework
  ): DetectionResult {
    const normalizedMessage = message.toLowerCase();
    const matchedKeywords: string[] = [];
    let detectedFrontend: FrontendFramework | undefined;
    let detectedBackend: BackendFramework | undefined;

    // 1. 키워드 매칭
    for (const mapping of this.keywordMappings) {
      for (const keyword of mapping.keywords) {
        if (normalizedMessage.includes(keyword)) {
          matchedKeywords.push(keyword);

          if (mapping.type === "frontend") {
            detectedFrontend = mapping.framework as FrontendFramework;
          } else {
            detectedBackend = mapping.framework as BackendFramework;
          }
          break;
        }
      }
    }

    // 2. 키워드가 없으면 탐지 실패
    if (matchedKeywords.length === 0) {
      return {
        detected: false,
        confidence: 0,
        matchedKeywords: [],
      };
    }

    // 3. 의도 패턴 확인
    const hasIntent = this.intentPatterns.some((pattern) =>
      pattern.test(message)
    );

    // 4. 신뢰도 계산
    let confidence = 0.5; // 키워드만 있으면 기본 0.5

    if (hasIntent) {
      confidence = 0.9; // 의도 패턴이 있으면 높은 신뢰도
    }

    // 현재 프레임워크와 다른 경우에만 변경으로 인식
    const frontendChanged =
      detectedFrontend !== undefined && detectedFrontend !== currentFrontend;
    const backendChanged =
      detectedBackend !== undefined && detectedBackend !== currentBackend;

    // 변경이 감지되지 않으면
    if (!frontendChanged && !backendChanged) {
      return {
        detected: false,
        confidence: 0,
        matchedKeywords,
      };
    }

    // 5. 결과 반환
    const result: DetectionResult = {
      detected: true,
      confidence,
      matchedKeywords,
    };

    if (frontendChanged) {
      result.frontendFramework = detectedFrontend;
    }
    if (backendChanged) {
      result.backendFramework = detectedBackend;
    }

    this.logger.log(
      `Framework change detected: ${JSON.stringify(result)}`
    );

    return result;
  }

  /**
   * 감지 결과를 사용자에게 알릴 메시지 생성
   */
  generateNotificationMessage(result: DetectionResult): string | null {
    if (!result.detected) {
      return null;
    }

    const changes: string[] = [];

    if (result.frontendFramework) {
      const name = this.getFrontendName(result.frontendFramework);
      changes.push(`프론트엔드를 **${name}**으로`);
    }

    if (result.backendFramework) {
      const name = this.getBackendName(result.backendFramework);
      changes.push(`백엔드를 **${name}**으로`);
    }

    if (changes.length === 0) {
      return null;
    }

    return `프레임워크 변경이 감지되었습니다: ${changes.join(", ")} 변경합니다.`;
  }

  private getFrontendName(framework: FrontendFramework): string {
    switch (framework) {
      case FrontendFramework.REACT_VITE:
        return "React + Vite";
      case FrontendFramework.NEXTJS:
        return "Next.js";
      case FrontendFramework.VUE:
        return "Vue 3";
      case FrontendFramework.SVELTE:
        return "SvelteKit";
      case FrontendFramework.REACT_NATIVE:
        return "React Native";
      case FrontendFramework.FLUTTER:
        return "Flutter";
      case FrontendFramework.EXPO:
        return "Expo";
      case FrontendFramework.NONE:
        return "없음";
    }
  }

  private getBackendName(framework: BackendFramework): string {
    switch (framework) {
      case BackendFramework.EXPRESS:
        return "Express";
      case BackendFramework.FASTAPI:
        return "FastAPI";
      case BackendFramework.DJANGO:
        return "Django";
      case BackendFramework.NESTJS:
        return "NestJS";
      case BackendFramework.NONE:
        return "없음";
    }
  }
}
