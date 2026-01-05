export type Locale = 'en' | 'ko';

export const translations = {
  en: {
    nav: {
      features: 'Features',
      demo: 'Demo',
      docs: 'Docs',
      github: 'GitHub',
    },
    hero: {
      badge: 'AI-Powered Development',
      title: 'Build apps with',
      titleHighlight: 'natural language',
      description: 'Describe what you want in plain English. Claude writes the code, runs it, and shows you the result in real-time.',
      cta: 'Get Started',
      ctaSecondary: 'View Demo',
      install: 'npx claudeship',
    },
    features: {
      title: 'Everything you need',
      subtitle: 'to build faster',
      items: [
        {
          title: 'Natural Language',
          description: 'Just describe what you want. No syntax to remember, no boilerplate to write.',
        },
        {
          title: 'Live Preview',
          description: 'Real-time preview with console logs, error overlay, and responsive device modes.',
        },
        {
          title: 'Full-Stack',
          description: 'Frontend with Next.js, backend with Express or FastAPI, SQLite database viewer.',
        },
        {
          title: 'Checkpoint & Rollback',
          description: 'Git-based snapshots. Save your progress and restore to any previous state.',
        },
        {
          title: 'File Explorer',
          description: 'Browse files, manage environment variables, and view syntax-highlighted code.',
        },
        {
          title: 'Browser Testing',
          description: 'Create automated test scenarios with clicks, form fills, and assertions.',
        },
      ],
    },
    demo: {
      title: 'See it in action',
      subtitle: 'Type a prompt and watch Claude build your app',
      placeholder: 'Create a todo app with dark mode...',
      send: 'Send',
      thinking: 'Claude is thinking...',
      typing: 'Claude is typing...',
    },
    install: {
      title: 'Ready to start?',
      subtitle: 'One command to install and run',
      copy: 'Copy',
      copied: 'Copied!',
      requirements: 'Requires Node.js 20+, pnpm, and Claude Code CLI',
    },
    footer: {
      built: 'Built with Claude Code',
      links: {
        docs: 'Documentation',
        github: 'GitHub',
        npm: 'npm',
      },
    },
  },
  ko: {
    nav: {
      features: '기능',
      demo: '데모',
      docs: '문서',
      github: 'GitHub',
    },
    hero: {
      badge: 'AI 기반 개발',
      title: '자연어로',
      titleHighlight: '앱을 만드세요',
      description: '원하는 것을 설명하세요. Claude가 코드를 작성하고, 실행하고, 결과를 실시간으로 보여줍니다.',
      cta: '시작하기',
      ctaSecondary: '데모 보기',
      install: 'npx claudeship',
    },
    features: {
      title: '더 빠르게 개발하는',
      subtitle: '모든 것',
      items: [
        {
          title: '자연어 입력',
          description: '원하는 것만 설명하세요. 문법을 외울 필요 없습니다.',
        },
        {
          title: '실시간 프리뷰',
          description: '콘솔 로그, 에러 오버레이, 반응형 디바이스 모드를 지원하는 실시간 프리뷰.',
        },
        {
          title: '풀스택 지원',
          description: 'Next.js 프론트엔드, Express/FastAPI 백엔드, SQLite 데이터베이스 뷰어.',
        },
        {
          title: '체크포인트 & 롤백',
          description: 'Git 기반 스냅샷. 진행 상황을 저장하고 이전 상태로 복원하세요.',
        },
        {
          title: '파일 탐색기',
          description: '파일 탐색, 환경 변수 관리, 구문 강조된 코드 보기.',
        },
        {
          title: '브라우저 테스팅',
          description: '클릭, 폼 입력, 검증을 포함한 자동화된 테스트 시나리오 생성.',
        },
      ],
    },
    demo: {
      title: '직접 체험해보세요',
      subtitle: '프롬프트를 입력하고 Claude가 앱을 만드는 것을 보세요',
      placeholder: '다크 모드가 있는 할 일 앱을 만들어줘...',
      send: '전송',
      thinking: 'Claude가 생각 중...',
      typing: 'Claude가 입력 중...',
    },
    install: {
      title: '시작할 준비가 되셨나요?',
      subtitle: '한 줄 명령어로 설치하고 실행하세요',
      copy: '복사',
      copied: '복사됨!',
      requirements: 'Node.js 20+, pnpm, Claude Code CLI 필요',
    },
    footer: {
      built: 'Claude Code로 제작',
      links: {
        docs: '문서',
        github: 'GitHub',
        npm: 'npm',
      },
    },
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}
