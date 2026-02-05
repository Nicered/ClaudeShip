export interface TableInfo {
  name: string;
  rowCount: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
}

export interface TableData {
  columns: ColumnInfo[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DatabaseAdapter {
  getTables(): Promise<TableInfo[]>;
  getTableSchema(tableName: string): Promise<ColumnInfo[]>;
  getTableData(
    tableName: string,
    page: number,
    pageSize: number,
  ): Promise<TableData>;
  executeQuery(query: string): Promise<Record<string, unknown>[]>;
  insertRow(tableName: string, data: Record<string, unknown>): Promise<void>;
  updateRow(
    tableName: string,
    primaryKey: string,
    primaryKeyValue: unknown,
    data: Record<string, unknown>,
  ): Promise<void>;
  deleteRow(
    tableName: string,
    primaryKey: string,
    primaryKeyValue: unknown,
  ): Promise<void>;
  close(): void;
}
