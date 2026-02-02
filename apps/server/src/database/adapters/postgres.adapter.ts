import { Pool } from "pg";
import {
  DatabaseAdapter,
  TableInfo,
  ColumnInfo,
  TableData,
} from "./database-adapter.interface";

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async getTables(): Promise<TableInfo[]> {
    const { rows: tables } = await this.pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_type = 'BASE TABLE'
         AND table_name NOT LIKE '_prisma_%'
       ORDER BY table_name`,
    );

    const result: TableInfo[] = [];
    for (const t of tables) {
      const { rows } = await this.pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM "${t.table_name}"`,
      );
      result.push({
        name: t.table_name,
        rowCount: parseInt(rows[0].count, 10),
      });
    }
    return result;
  }

  async getTableSchema(tableName: string): Promise<ColumnInfo[]> {
    const { rows } = await this.pool.query<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      is_pk: boolean;
    }>(
      `SELECT
         c.column_name,
         c.data_type,
         c.is_nullable,
         CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END as is_pk
       FROM information_schema.columns c
       LEFT JOIN information_schema.key_column_usage kcu
         ON c.table_name = kcu.table_name
         AND c.column_name = kcu.column_name
         AND c.table_schema = kcu.table_schema
       LEFT JOIN information_schema.table_constraints tc
         ON kcu.constraint_name = tc.constraint_name
         AND kcu.table_schema = tc.table_schema
         AND tc.constraint_type = 'PRIMARY KEY'
       WHERE c.table_name = $1
         AND c.table_schema = 'public'
       ORDER BY c.ordinal_position`,
      [tableName],
    );

    return rows.map((col) => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === "YES",
      primaryKey: col.is_pk,
    }));
  }

  async getTableData(
    tableName: string,
    page: number,
    pageSize: number,
  ): Promise<TableData> {
    const columns = await this.getTableSchema(tableName);

    const { rows: countRows } = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM "${tableName}"`,
    );
    const total = parseInt(countRows[0].count, 10);

    const offset = (page - 1) * pageSize;
    const { rows } = await this.pool.query(
      `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`,
      [pageSize, offset],
    );

    return { columns, rows, total, page, pageSize };
  }

  async executeQuery(query: string): Promise<Record<string, unknown>[]> {
    const { rows } = await this.pool.query(query);
    return rows;
  }

  async insertRow(
    tableName: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const keys = Object.keys(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO "${tableName}" ("${keys.join('", "')}") VALUES (${placeholders})`;
    await this.pool.query(sql, Object.values(data));
  }

  async updateRow(
    tableName: string,
    primaryKey: string,
    primaryKeyValue: unknown,
    data: Record<string, unknown>,
  ): Promise<void> {
    const keys = Object.keys(data);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
    const sql = `UPDATE "${tableName}" SET ${setClause} WHERE "${primaryKey}" = $${keys.length + 1}`;
    await this.pool.query(sql, [...Object.values(data), primaryKeyValue]);
  }

  async deleteRow(
    tableName: string,
    primaryKey: string,
    primaryKeyValue: unknown,
  ): Promise<void> {
    const sql = `DELETE FROM "${tableName}" WHERE "${primaryKey}" = $1`;
    await this.pool.query(sql, [primaryKeyValue]);
  }

  close(): void {
    this.pool.end();
  }
}
