// ===== Core Types for DB Insights =====

export type DatabaseType = 'mysql' | 'postgresql' | 'mongodb';

export type LLMProvider = 'groq' | 'gemini' | 'openrouter';

export interface DatabaseConfig {
    type: DatabaseType;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    uri?: string; // for MongoDB
}

export interface ColumnInfo {
    name: string;
    type: string;
    nullable: boolean;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    references?: {
        table: string;
        column: string;
    };
}

export interface TableInfo {
    name: string;
    columns: ColumnInfo[];
    rowCount?: number;
}

export interface SchemaInfo {
    tables: TableInfo[];
    databaseType: DatabaseType;
    databaseName: string;
}

export type QueryValidationStatus = 'safe' | 'warning' | 'blocked';

export interface QueryValidationResult {
    status: QueryValidationStatus;
    message: string;
    issues: string[];
}

export interface GeneratedQuery {
    sql: string;
    explanation: string;
    confidence: number; // 0-1
}

export interface QueryResult {
    columns: string[];
    rows: Record<string, unknown>[];
    rowCount: number;
    executionTimeMs: number;
}

export interface LLMInsight {
    summary: string;
    keyFindings: string[];
    recommendation?: string;
}

export type PipelineStepStatus = 'idle' | 'active' | 'done' | 'error';

export interface PipelineStep {
    id: string;
    label: string;
    icon: string;
    status: PipelineStepStatus;
    detail?: string;
}

export interface QuerySession {
    id: string;
    question: string;
    schema?: SchemaInfo;
    generatedQuery?: GeneratedQuery;
    validation?: QueryValidationResult;
    result?: QueryResult;
    insight?: LLMInsight;
    error?: string;
    timestamp: Date;
    pipelineSteps: PipelineStep[];
}

export interface HistoryEntry {
    id: string;
    question: string;
    query: string;
    rowCount: number;
    timestamp: Date;
    success: boolean;
}

export type ViewMode = 'table' | 'json' | 'chart';
