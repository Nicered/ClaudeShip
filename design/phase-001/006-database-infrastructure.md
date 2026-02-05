# 데이터베이스 인프라 자동 관리 설계

> 작성일: 2025-01-09
> Issue: #51
> 버전: 1.0

---

## 1. 개요

### 1.1 목적

ClaudeShip에서 프로젝트별 데이터베이스 인프라를 자동으로 관리합니다.

### 1.2 핵심 전략

```mermaid
flowchart TD
    A[프로젝트 생성] --> B{Docker 설치됨?}
    B -->|Yes| C[PostgreSQL 컨테이너 생성]
    B -->|No| D[SQLite 파일 생성]
    C --> E[DATABASE_URL 생성]
    D --> E
    E --> F[프로젝트에 주입]
```

### 1.3 우선순위

| 순위 | DB 유형 | 조건 |
|------|---------|------|
| 1 | PostgreSQL (Docker) | Docker 설치 + 실행 중 |
| 2 | SQLite | Docker 없음 (폴백) |

---

## 2. 시스템 아키텍처

### 2.1 전체 구조

```mermaid
flowchart TB
    subgraph Backend["NestJS Backend"]
        A[DatabaseModule]
        B[DockerService]
        C[PostgresContainerService]
        D[SqliteService]
        E[DatabaseProviderFactory]
    end

    subgraph External["외부 시스템"]
        F[Docker Engine]
        G[PostgreSQL Container]
        H[SQLite File]
    end

    A --> E
    E --> B
    E --> C
    E --> D
    B --> F
    C --> G
    D --> H
```

### 2.2 모듈 구조

```mermaid
flowchart LR
    subgraph DatabaseModule
        A[DatabaseController]
        B[DatabaseService]
        C[DockerService]
        D[PostgresContainerService]
        E[SqliteService]
        F[DatabaseProviderFactory]
    end

    A --> B
    B --> F
    F --> C
    F --> D
    F --> E
    D --> C
```

---

## 3. 상세 설계

### 3.1 Docker 감지 흐름

```mermaid
sequenceDiagram
    participant App as Application
    participant DS as DockerService
    participant Docker as Docker Engine

    App->>DS: checkDockerAvailable()
    DS->>Docker: docker version
    alt Docker 실행 중
        Docker-->>DS: version info
        DS-->>App: { available: true, version: "..." }
    else Docker 없음/중지
        Docker-->>DS: error
        DS-->>App: { available: false }
    end
```

### 3.2 프로젝트별 DB 생성 흐름

```mermaid
sequenceDiagram
    participant PS as ProjectService
    participant DF as DatabaseProviderFactory
    participant PCS as PostgresContainerService
    participant SS as SqliteService

    PS->>DF: createDatabase(projectId)
    DF->>DF: checkDockerAvailable()

    alt Docker 사용 가능
        DF->>PCS: createContainer(projectId)
        PCS->>PCS: docker run postgres
        PCS->>PCS: waitForReady()
        PCS-->>DF: { type: "postgres", url: "..." }
    else Docker 없음
        DF->>SS: createDatabase(projectId)
        SS->>SS: create file: project.db
        SS-->>DF: { type: "sqlite", url: "..." }
    end

    DF-->>PS: DatabaseConfig
```

### 3.3 컨테이너 라이프사이클

```mermaid
stateDiagram-v2
    [*] --> NotExist
    NotExist --> Creating: createContainer()
    Creating --> Running: container started
    Running --> Stopped: stopContainer()
    Stopped --> Running: startContainer()
    Stopped --> NotExist: removeContainer()
    Running --> NotExist: removeContainer()
```

---

## 4. 데이터 모델

### 4.1 DatabaseProvider Enum

```typescript
enum DatabaseProvider {
  POSTGRES_DOCKER = "postgres_docker",
  SQLITE = "sqlite",
}
```

### 4.2 Project 모델 확장

```prisma
model Project {
  id               String           @id @default(uuid())
  name             String
  projectType      ProjectType
  backendFramework BackendFramework @default(NONE)
  path             String
  description      String?

  // 신규 필드
  databaseProvider DatabaseProvider @default(SQLITE)
  databaseUrl      String?
  dockerContainerId String?

  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  messages         Message[]
}

enum DatabaseProvider {
  POSTGRES_DOCKER
  SQLITE
}
```

### 4.3 컨테이너 설정

```typescript
interface PostgresContainerConfig {
  projectId: string;
  containerName: string;  // claudeship-db-{projectId}
  port: number;           // 동적 할당 (5432-5500 범위)
  database: string;       // claudeship
  username: string;       // claudeship
  password: string;       // 자동 생성
}
```

---

## 5. 서비스 상세

### 5.1 DockerService

```typescript
@Injectable()
export class DockerService {
  // Docker 설치 및 실행 확인
  async checkAvailable(): Promise<DockerStatus> {
    try {
      const { stdout } = await exec('docker version --format json');
      return { available: true, version: JSON.parse(stdout) };
    } catch {
      return { available: false };
    }
  }

  // 컨테이너 실행
  async runContainer(config: ContainerConfig): Promise<string> {
    const args = [
      'run', '-d',
      '--name', config.name,
      '-p', `${config.port}:5432`,
      '-e', `POSTGRES_USER=${config.username}`,
      '-e', `POSTGRES_PASSWORD=${config.password}`,
      '-e', `POSTGRES_DB=${config.database}`,
      '-v', `${config.volumeName}:/var/lib/postgresql/data`,
      'postgres:16-alpine'
    ];

    const { stdout } = await exec(`docker ${args.join(' ')}`);
    return stdout.trim(); // container ID
  }

  // 컨테이너 상태 확인
  async getContainerStatus(containerId: string): Promise<ContainerStatus>

  // 컨테이너 시작/중지/삭제
  async startContainer(containerId: string): Promise<void>
  async stopContainer(containerId: string): Promise<void>
  async removeContainer(containerId: string): Promise<void>
}
```

### 5.2 PostgresContainerService

```typescript
@Injectable()
export class PostgresContainerService {
  constructor(private dockerService: DockerService) {}

  // 프로젝트용 PostgreSQL 컨테이너 생성
  async createForProject(projectId: string): Promise<DatabaseConfig> {
    const port = await this.findAvailablePort();
    const password = this.generatePassword();

    const containerId = await this.dockerService.runContainer({
      name: `claudeship-db-${projectId}`,
      port,
      username: 'claudeship',
      password,
      database: 'claudeship',
      volumeName: `claudeship-data-${projectId}`,
    });

    // PostgreSQL 준비 대기
    await this.waitForReady(port, password);

    return {
      provider: DatabaseProvider.POSTGRES_DOCKER,
      url: `postgresql://claudeship:${password}@localhost:${port}/claudeship`,
      containerId,
    };
  }

  // PostgreSQL 준비 상태 확인
  private async waitForReady(port: number, password: string): Promise<void> {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        await exec(`docker exec claudeship-db-* pg_isready`);
        return;
      } catch {
        await sleep(1000);
      }
    }
    throw new Error('PostgreSQL container failed to start');
  }

  // 사용 가능한 포트 찾기 (5432-5500 범위)
  private async findAvailablePort(): Promise<number>

  // 안전한 비밀번호 생성
  private generatePassword(): string
}
```

### 5.3 SqliteService

```typescript
@Injectable()
export class SqliteService {
  // 프로젝트용 SQLite 데이터베이스 생성
  async createForProject(projectId: string, projectPath: string): Promise<DatabaseConfig> {
    const dbPath = path.join(projectPath, 'data', 'dev.db');

    // 디렉토리 생성
    await fs.mkdir(path.dirname(dbPath), { recursive: true });

    return {
      provider: DatabaseProvider.SQLITE,
      url: `file:${dbPath}`,
      containerId: null,
    };
  }
}
```

### 5.4 DatabaseProviderFactory

```typescript
@Injectable()
export class DatabaseProviderFactory {
  constructor(
    private dockerService: DockerService,
    private postgresService: PostgresContainerService,
    private sqliteService: SqliteService,
  ) {}

  async createDatabase(
    projectId: string,
    projectPath: string,
  ): Promise<DatabaseConfig> {
    // Docker 사용 가능 여부 확인
    const dockerStatus = await this.dockerService.checkAvailable();

    if (dockerStatus.available) {
      try {
        return await this.postgresService.createForProject(projectId);
      } catch (error) {
        // PostgreSQL 실패 시 SQLite로 폴백
        console.warn('PostgreSQL container failed, falling back to SQLite', error);
        return await this.sqliteService.createForProject(projectId, projectPath);
      }
    }

    // Docker 없으면 SQLite 사용
    return await this.sqliteService.createForProject(projectId, projectPath);
  }
}
```

---

## 6. API 명세

### 6.1 Database API

| Method | Endpoint | 설명 | Response |
|--------|----------|------|----------|
| GET | /api/database/status | Docker/DB 상태 조회 | DatabaseStatus |
| POST | /api/projects/:id/database | 프로젝트 DB 생성 | DatabaseConfig |
| POST | /api/projects/:id/database/start | DB 시작 | DatabaseConfig |
| POST | /api/projects/:id/database/stop | DB 중지 | void |
| DELETE | /api/projects/:id/database | DB 삭제 | void |

### 6.2 Response 형식

```typescript
// Docker 상태
interface DockerStatus {
  available: boolean;
  version?: string;
  error?: string;
}

// DB 상태
interface DatabaseStatus {
  docker: DockerStatus;
  defaultProvider: DatabaseProvider;
}

// DB 설정
interface DatabaseConfig {
  provider: DatabaseProvider;
  url: string;
  containerId?: string;
  status: 'running' | 'stopped' | 'creating' | 'error';
}
```

---

## 7. UI 변경사항

### 7.1 프로젝트 생성 시 DB 정보 표시

```
┌─────────────────────────────────────────┐
│  새 프로젝트 생성                         │
├─────────────────────────────────────────┤
│  프로젝트 이름: [my-app          ]        │
│                                          │
│  데이터베이스:                            │
│  ✅ Docker 감지됨 - PostgreSQL 사용       │
│  또는                                    │
│  ⚠️ Docker 없음 - SQLite 사용            │
│                                          │
│                      [취소] [생성]         │
└─────────────────────────────────────────┘
```

### 7.2 설정 페이지 DB 섹션

```
┌─────────────────────────────────────────┐
│  데이터베이스 설정                        │
├─────────────────────────────────────────┤
│  Docker 상태: ✅ 실행 중 (v24.0.7)        │
│                                          │
│  기본 DB: PostgreSQL (Docker)            │
│  [Docker 없을 때 SQLite 자동 사용]        │
│                                          │
│  활성 컨테이너: 2개                       │
│  - claudeship-db-abc123 (running)        │
│  - claudeship-db-def456 (stopped)        │
└─────────────────────────────────────────┘
```

---

## 8. 파일 변경 목록

### 8.1 신규 파일

| 파일 | 설명 |
|------|------|
| `apps/server/src/database/database.module.ts` | DB 모듈 |
| `apps/server/src/database/database.controller.ts` | DB API 컨트롤러 |
| `apps/server/src/database/database.service.ts` | DB 서비스 |
| `apps/server/src/database/docker.service.ts` | Docker 관리 |
| `apps/server/src/database/postgres-container.service.ts` | PostgreSQL 컨테이너 |
| `apps/server/src/database/sqlite.service.ts` | SQLite 관리 |
| `apps/server/src/database/database-provider.factory.ts` | Provider 팩토리 |
| `apps/server/src/database/dto/*.ts` | DTO 정의 |

### 8.2 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `apps/server/prisma/schema.prisma` | DatabaseProvider enum, 필드 추가 |
| `apps/server/src/project/project.service.ts` | DB 생성 연동 |
| `apps/server/src/app.module.ts` | DatabaseModule import |
| `apps/web/src/components/project/CreateProjectModal.tsx` | DB 상태 표시 |
| `apps/web/src/app/settings/page.tsx` | DB 설정 섹션 |

---

## 9. 구현 순서

```mermaid
gantt
    title 구현 계획
    dateFormat X
    axisFormat %s

    section Phase 1: 기반
    DockerService 구현           :p1, 0, 1
    SQLite 폴백 구현             :p2, after p1, 1

    section Phase 2: PostgreSQL
    PostgresContainerService     :p3, after p2, 2
    DatabaseProviderFactory      :p4, after p3, 1

    section Phase 3: 통합
    Project 연동                 :p5, after p4, 1
    API 구현                     :p6, after p5, 1

    section Phase 4: UI
    설정 페이지                   :p7, after p6, 1
    프로젝트 생성 UI              :p8, after p7, 1
```

---

## 10. 보안 고려사항

| 위험 | 대응 |
|------|------|
| DB 비밀번호 노출 | 프로젝트별 랜덤 생성, 환경변수로만 전달 |
| 컨테이너 권한 | 최소 권한 원칙, 네트워크 격리 |
| 포트 충돌 | 동적 포트 할당, 범위 제한 |
| 데이터 유실 | Docker 볼륨으로 영속화 |

---

## 11. 참고 자료

- [Replit PostgreSQL 관리](https://docs.replit.com/cloud-services/storage-and-databases/postgresql-on-replit)
- [Docker PostgreSQL 이미지](https://hub.docker.com/_/postgres)
- [Testcontainers 패턴](https://testcontainers.com/modules/postgresql/)
