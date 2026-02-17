# 환경 변수 관리 기능 설계

> 작성일: 2025-12-30
> 버전: 1.0

---

## 1. 개요

### 1.1 목적

프로젝트의 `.env` 파일을 안전하게 관리하고 조회/수정할 수 있는 기능을 제공합니다.

### 1.2 주요 기능

| 기능 | 설명 |
|------|------|
| **파일 목록 조회** | 프로젝트 내 모든 .env 파일 탐지 |
| **변수 조회** | .env 파일 내용 파싱하여 key-value 조회 |
| **변수 수정** | .env 파일 변수 업데이트 |
| **파일 생성** | 새 .env 파일 생성 |
| **파일 삭제** | .env 파일 삭제 |

---

## 2. 지원 파일 패턴

### 2.1 탐지 대상

```typescript
const envPatterns = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local',
  '.env.test',
  '.env.test.local',
  '.env.example',
];
```

### 2.2 탐색 위치

```
{projectPath}/
├── .env
├── .env.local
├── backend/
│   ├── .env
│   └── .env.local
└── frontend/
    └── .env.local
```

---

## 3. 데이터 모델

### 3.1 EnvVariable 인터페이스

```typescript
interface EnvVariable {
  key: string;
  value: string;
}
```

### 3.2 EnvFile 인터페이스

```typescript
interface EnvFile {
  path: string;           // 프로젝트 상대 경로
  variables: EnvVariable[];
}
```

---

## 4. API 설계

### 4.1 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/projects/:id/env | 모든 .env 파일 목록 |
| GET | /api/projects/:id/env/:path | 특정 .env 파일 조회 |
| PUT | /api/projects/:id/env/:path | .env 파일 수정 |
| POST | /api/projects/:id/env | 새 .env 파일 생성 |
| DELETE | /api/projects/:id/env/:path | .env 파일 삭제 |

### 4.2 요청/응답 형식

```typescript
// GET /api/projects/:id/env
interface EnvFilesResponse {
  files: EnvFile[];
}

// PUT /api/projects/:id/env/:path
interface UpdateEnvDto {
  variables: EnvVariable[];
}

// POST /api/projects/:id/env
interface CreateEnvDto {
  path: string;              // e.g., '.env.local'
  variables?: EnvVariable[];
}
```

---

## 5. 파싱 로직

### 5.1 .env 파싱

```typescript
private parseEnvContent(content: string): EnvVariable[] {
  const variables: EnvVariable[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // 빈 줄, 주석 건너뛰기
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // KEY=VALUE 파싱
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex > 0) {
      const key = trimmed.substring(0, equalsIndex).trim();
      let value = trimmed.substring(equalsIndex + 1).trim();

      // 따옴표 제거
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      variables.push({ key, value });
    }
  }

  return variables;
}
```

### 5.2 .env 포맷팅

```typescript
private formatEnvContent(variables: EnvVariable[]): string {
  return variables
    .map(({ key, value }) => {
      // 특수문자 포함 시 따옴표 추가
      const needsQuotes = /[\s#=]/.test(value) || value.includes('"');
      const formattedValue = needsQuotes
        ? `"${value.replace(/"/g, '\\"')}"`
        : value;
      return `${key}=${formattedValue}`;
    })
    .join('\n');
}
```

---

## 6. 보안

### 6.1 경로 검증

```typescript
async getEnvFile(projectId: string, filePath: string): Promise<EnvFile> {
  const projectPath = await this.projectService.getProjectPath(projectId);
  const fullPath = path.join(projectPath, filePath);

  // 프로젝트 경로 내부인지 확인 (Path Traversal 방지)
  const resolvedPath = path.resolve(fullPath);
  const resolvedProjectPath = path.resolve(projectPath);

  if (!resolvedPath.startsWith(resolvedProjectPath)) {
    throw new BadRequestException('Invalid file path');
  }

  // .env 파일인지 확인
  const fileName = path.basename(filePath);
  if (!fileName.startsWith('.env')) {
    throw new BadRequestException('File must be a .env file');
  }

  // ... 파일 읽기
}
```

### 6.2 주의사항

| 위험 | 대응 |
|------|------|
| Path Traversal | 프로젝트 경로 내부 검증 |
| 민감 정보 노출 | 프론트엔드에서 마스킹 처리 권장 |
| 임의 파일 생성 | `.env` 접두사 파일만 허용 |

---

## 7. 구현 파일

| 파일 | 설명 |
|------|------|
| `apps/server/src/env/env.module.ts` | 모듈 정의 |
| `apps/server/src/env/env.controller.ts` | API 컨트롤러 |
| `apps/server/src/env/env.service.ts` | 환경 변수 서비스 로직 |

---

## 8. UI 연동

### 8.1 환경 변수 편집기 UI

```
┌─────────────────────────────────────────────┐
│ Environment Variables                        │
├─────────────────────────────────────────────┤
│ File: [.env ▼]                               │
├─────────────────────────────────────────────┤
│ KEY                 │ VALUE                  │
├─────────────────────┼───────────────────────┤
│ DATABASE_URL        │ ●●●●●●●●●●            │
│ API_KEY             │ ●●●●●●●●●●            │
│ PORT                │ 3000                   │
├─────────────────────┴───────────────────────┤
│ [+ Add Variable]              [Save] [Reset] │
└─────────────────────────────────────────────┘
```

### 8.2 값 마스킹

```typescript
// 프론트엔드에서 민감한 키 마스킹
const SENSITIVE_KEYS = ['KEY', 'SECRET', 'PASSWORD', 'TOKEN', 'PRIVATE'];

function shouldMask(key: string): boolean {
  return SENSITIVE_KEYS.some(s => key.toUpperCase().includes(s));
}
```

---

## 9. 사용 시나리오

### 9.1 프리뷰 실행 전 설정

1. 프리뷰 시작 시 .env 파일 존재 확인
2. 필수 변수 누락 시 경고 표시
3. 사용자가 변수 입력 후 프리뷰 재시작

### 9.2 백엔드 프레임워크별 기본값

```typescript
// Express 프로젝트
const expressDefaults: EnvVariable[] = [
  { key: 'PORT', value: '3001' },
  { key: 'DATABASE_URL', value: 'file:./dev.db' },
];

// FastAPI 프로젝트
const fastapiDefaults: EnvVariable[] = [
  { key: 'PORT', value: '8000' },
  { key: 'DATABASE_URL', value: 'sqlite:///./dev.db' },
];
```

---

## 10. 참고

- [003-fullstack-feature.md](./003-fullstack-feature.md) - 풀스택 프로젝트 구조
- [004-preview-enhancement.md](./004-preview-enhancement.md) - 프리뷰 환경 변수
