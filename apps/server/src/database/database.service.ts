import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SqliteInfraService } from "./infra/sqlite-infra.service";
import {
  DatabaseAdapter,
  TableInfo,
  ColumnInfo,
  TableData,
} from "./adapters/database-adapter.interface";
import { SqliteAdapter } from "./adapters/sqlite.adapter";
import { PostgresAdapter } from "./adapters/postgres.adapter";

export { TableInfo, ColumnInfo, TableData };

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private prisma: PrismaService,
    private sqliteInfraService: SqliteInfraService,
  ) {}

  private async createAdapter(projectId: string): Promise<DatabaseAdapter> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Case 1: Explicit POSTGRES_DOCKER provider
    if (project.databaseProvider === "POSTGRES_DOCKER" && project.databaseUrl) {
      return new PostgresAdapter(project.databaseUrl);
    }

    // Case 2: Explicit SQLITE provider with databaseUrl
    if (project.databaseProvider === "SQLITE" && project.databaseUrl) {
      const filePath = project.databaseUrl.replace(/^file:/, "");
      return new SqliteAdapter(filePath);
    }

    // Case 3: Fallback - search for SQLite database in project directory
    const dbPath = await this.sqliteInfraService.findDatabasePath(project.path);
    if (dbPath) {
      return new SqliteAdapter(dbPath);
    }

    throw new NotFoundException("No database found for project");
  }

  private async withAdapter<T>(
    projectId: string,
    fn: (adapter: DatabaseAdapter) => Promise<T>,
  ): Promise<T> {
    const adapter = await this.createAdapter(projectId);
    try {
      return await fn(adapter);
    } finally {
      adapter.close();
    }
  }

  async getTables(projectId: string): Promise<TableInfo[]> {
    return this.withAdapter(projectId, (adapter) => adapter.getTables());
  }

  async getTableSchema(
    projectId: string,
    tableName: string,
  ): Promise<ColumnInfo[]> {
    return this.withAdapter(projectId, (adapter) =>
      adapter.getTableSchema(tableName),
    );
  }

  async getTableData(
    projectId: string,
    tableName: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<TableData> {
    return this.withAdapter(projectId, (adapter) =>
      adapter.getTableData(tableName, page, pageSize),
    );
  }

  async executeQuery(
    projectId: string,
    query: string,
  ): Promise<Record<string, unknown>[]> {
    const normalizedQuery = query.trim().toUpperCase();
    if (
      normalizedQuery.includes("DROP TABLE") ||
      normalizedQuery.includes("DROP DATABASE") ||
      normalizedQuery.includes("TRUNCATE")
    ) {
      throw new BadRequestException("Destructive queries are not allowed");
    }

    return this.withAdapter(projectId, (adapter) =>
      adapter.executeQuery(query),
    );
  }

  async insertRow(
    projectId: string,
    tableName: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    return this.withAdapter(projectId, (adapter) =>
      adapter.insertRow(tableName, data),
    );
  }

  async updateRow(
    projectId: string,
    tableName: string,
    primaryKey: string,
    primaryKeyValue: unknown,
    data: Record<string, unknown>,
  ): Promise<void> {
    return this.withAdapter(projectId, (adapter) =>
      adapter.updateRow(tableName, primaryKey, primaryKeyValue, data),
    );
  }

  async deleteRow(
    projectId: string,
    tableName: string,
    primaryKey: string,
    primaryKeyValue: unknown,
  ): Promise<void> {
    return this.withAdapter(projectId, (adapter) =>
      adapter.deleteRow(tableName, primaryKey, primaryKeyValue),
    );
  }
}
