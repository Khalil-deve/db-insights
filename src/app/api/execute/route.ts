import { NextRequest, NextResponse } from 'next/server';
import { DatabaseConfig, QueryResult } from '@/types';

// ===== Query Execution API =====
// Safely executes validated SELECT queries and returns structured results

const MAX_ROWS = 1000;
const QUERY_TIMEOUT_MS = 30000;

async function executeMySQLQuery(sql: string, config: DatabaseConfig): Promise<QueryResult> {
    const mysql2 = await import('mysql2/promise');
    const conn = await mysql2.createConnection({
        host: config.host || '127.0.0.1',
        port: config.port || 3306,
        user: config.username,
        password: config.password,
        database: config.database,
        connectTimeout: 10000,
    });

    const start = Date.now();

    try {
        // Set query timeout
        await conn.query(`SET SESSION MAX_EXECUTION_TIME=${QUERY_TIMEOUT_MS}`);

        const [rows, fields] = await conn.query(sql) as [
            Record<string, unknown>[],
            Array<{ name: string }>
        ];

        const executionTimeMs = Date.now() - start;
        const columns = fields.map(f => f.name);
        const limitedRows = rows.slice(0, MAX_ROWS);

        await conn.end();
        return {
            columns,
            rows: limitedRows,
            rowCount: rows.length,
            executionTimeMs,
        };
    } catch (err) {
        await conn.end();
        throw err;
    }
}

async function executePostgreSQLQuery(sql: string, config: DatabaseConfig): Promise<QueryResult> {
    const { Pool } = await import('pg');
    const pool = new Pool({
        host: config.host || '127.0.0.1',
        port: config.port || 5432,
        user: config.username,
        password: config.password,
        database: config.database,
        connectionTimeoutMillis: 10000,
        statement_timeout: QUERY_TIMEOUT_MS,
    });

    const client = await pool.connect();
    const start = Date.now();

    try {
        const result = await client.query(sql);
        const executionTimeMs = Date.now() - start;

        const columns = result.fields.map(f => f.name);
        const limitedRows = result.rows.slice(0, MAX_ROWS);

        client.release();
        await pool.end();

        return {
            columns,
            rows: limitedRows,
            rowCount: result.rowCount || result.rows.length,
            executionTimeMs,
        };
    } catch (err) {
        client.release();
        await pool.end();
        throw err;
    }
}

async function executeMongoDBQuery(sql: string, config: DatabaseConfig): Promise<QueryResult> {
    throw new Error('Query execution for MongoDB is not currently supported via SQL. Support coming soon.');
}

// Re-implement validation inline to avoid cross-route import issues
function isQuerySafe(sql: string): boolean {
    const BLOCKED_PATTERNS = [
        /\bDROP\b/i, /\bDELETE\b/i, /\bUPDATE\b/i, /\bINSERT\b/i,
        /\bTRUNCATE\b/i, /\bALTER\b/i, /\bCREATE\b/i, /\bREPLACE\b/i,
        /\bGRANT\b/i, /\bREVOKE\b/i, /\bEXEC\b/i,
    ];
    for (const p of BLOCKED_PATTERNS) {
        if (p.test(sql)) return false;
    }
    const normalized = sql.trim().toUpperCase().replace(/\s+/, ' ');
    if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH') && !normalized.startsWith('EXPLAIN')) {
        return false;
    }
    // Check for multiple statements
    if (sql.split(';').filter(s => s.trim()).length > 1) return false;
    return true;
}

export async function POST(req: NextRequest) {
    try {
        const { sql, config } = await req.json() as {
            sql: string;
            config: DatabaseConfig;
        };

        if (!sql || !config) {
            return NextResponse.json({ error: 'SQL and database config are required' }, { status: 400 });
        }

        // Double-check safety before execution
        if (!isQuerySafe(sql)) {
            return NextResponse.json(
                { success: false, error: 'Query blocked by server-side safety check' },
                { status: 403 }
            );
        }

        let result: QueryResult;

        switch (config.type) {
            case 'mysql':
                result = await executeMySQLQuery(sql, config);
                break;
            case 'postgresql':
                result = await executePostgreSQLQuery(sql, config);
                break;
            case 'mongodb':
                result = await executeMongoDBQuery(sql, config);
                break;
            default:
                return NextResponse.json({ error: 'Unsupported database type' }, { status: 400 });
        }

        return NextResponse.json({ success: true, result });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Execute API Error]', message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
