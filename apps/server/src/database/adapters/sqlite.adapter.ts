import Database from "better-sqlite3";
import {
  DatabaseAdapter,
  TableInfo,
  ColumnInfo,
  TableData,
} from "./database-adapter.interface";

const INTERNAL_TABLE_PREFIXES = ["sqlite_", "_prisma_"];

export class SqliteAdapter implements DatabaseAdapter {
  private db: Database.Database;

  constructor(filePath: string) {
    this.db = new Database(filePath, { readonly: false });
    this.db.pragma("journal_mode = WAL");
  }

  async getTables(): Promise<TableInfo[]> {
    const tables = this.db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'`,
      )
      .all() as { name: string }[];

    return tables.map((t) => {
      const row = this.db
        .prepare(`SELECT COUNT(*) as count FROM "${t.name}"`)
        .get() as { count: number };
      return { name: t.name, rowCount: row.count };
    });
  }

  async getTableSchema(tableName: string): Promise<ColumnInfo[]> {
    const columns = this.db.pragma(
      `table_info("${tableName}")`,
    ) as {
      cid: number;
      name: string;
      type: string;
      notnull: number;
      pk: number;
    }[];

    return columns.map((col) => ({
      name: col.name,
      type: col.type,
      nullable: col.notnull === 0,
      primaryKey: col.pk === 1,
    }));
  }

  async getTableData(
    tableName: string,
    page: number,
    pageSize: number,
  ): Promise<TableData> {
    const columns = await this.getTableSchema(tableName);
    const countRow = this.db
      .prepare(`SELECT COUNT(*) as count FROM "${tableName}"`)
      .get() as { count: number };
    const total = countRow.count;

    const offset = (page - 1) * pageSize;
    const rows = this.db
      .prepare(`SELECT * FROM "${tableName}" LIMIT ? OFFSET ?`)
      .all(pageSize, offset) as Record<string, unknown>[];

    return { columns, rows, total, page, pageSize };
  }

  async executeQuery(query: string): Promise<Record<string, unknown>[]> {
    const stmt = this.db.prepare(query);
    if (stmt.reader) {
      return stmt.all() as Record<string, unknown>[];
    }
    stmt.run();
    return [];
  }

  async insertRow(
    tableName: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");
    const sql = `INSERT INTO "${tableName}" ("${keys.join('", "')}") VALUES (${placeholders})`;
    this.db.prepare(sql).run(...Object.values(data));
  }

  async updateRow(
    tableName: string,
    primaryKey: string,
    primaryKeyValue: unknown,
    data: Record<string, unknown>,
  ): Promise<void> {
    const setClause = Object.keys(data)
      .map((k) => `"${k}" = ?`)
      .join(", ");
    const sql = `UPDATE "${tableName}" SET ${setClause} WHERE "${primaryKey}" = ?`;
    this.db.prepare(sql).run(...Object.values(data), primaryKeyValue);
  }

  async deleteRow(
    tableName: string,
    primaryKey: string,
    primaryKeyValue: unknown,
  ): Promise<void> {
    const sql = `DELETE FROM "${tableName}" WHERE "${primaryKey}" = ?`;
    this.db.prepare(sql).run(primaryKeyValue);
  }

  close(): void {
    this.db.close();
  }
}
