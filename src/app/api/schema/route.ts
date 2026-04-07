import { NextRequest, NextResponse } from 'next/server';
import { DatabaseConfig, SchemaInfo, TableInfo, ColumnInfo } from '@/types';

// ===== Database Schema Discovery API =====
// Connects to the user's database and extracts full schema information

async function getMySQLSchema(config: DatabaseConfig): Promise<SchemaInfo> {
    const mysql2 = await import('mysql2/promise');
    const conn = await mysql2.createConnection({
        host: config.host || '127.0.0.1',
        port: config.port || 3306,
        user: config.username,
        password: config.password,
        database: config.database,
        connectTimeout: 10000,
    });

    try {
        // Get all tables
        const [tablesResult] = await conn.query(
            `SELECT TABLE_NAME, TABLE_ROWS 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
            [config.database]
        ) as [Array<{ TABLE_NAME: string; TABLE_ROWS: number }>, unknown];

        const tables: TableInfo[] = [];

        for (const table of tablesResult) {
            const tableName = table.TABLE_NAME;

            // Get columns + FK info
            const [colResult] = await conn.query(
                `SELECT 
          c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE, c.COLUMN_KEY,
          k.REFERENCED_TABLE_NAME, k.REFERENCED_COLUMN_NAME
         FROM information_schema.COLUMNS c
         LEFT JOIN information_schema.KEY_COLUMN_USAGE k
           ON c.TABLE_SCHEMA = k.TABLE_SCHEMA
           AND c.TABLE_NAME = k.TABLE_NAME
           AND c.COLUMN_NAME = k.COLUMN_NAME
           AND k.REFERENCED_TABLE_NAME IS NOT NULL
         WHERE c.TABLE_SCHEMA = ? AND c.TABLE_NAME = ?
         ORDER BY c.ORDINAL_POSITION`,
                [config.database, tableName]
            ) as [Array<{
                COLUMN_NAME: string; DATA_TYPE: string; IS_NULLABLE: string;
                COLUMN_KEY: string; REFERENCED_TABLE_NAME: string | null; REFERENCED_COLUMN_NAME: string | null;
            }>, unknown];

            const columns: ColumnInfo[] = colResult.map(col => ({
                name: col.COLUMN_NAME,
                type: col.DATA_TYPE,
                nullable: col.IS_NULLABLE === 'YES',
                isPrimaryKey: col.COLUMN_KEY === 'PRI',
                isForeignKey: !!col.REFERENCED_TABLE_NAME,
                references: col.REFERENCED_TABLE_NAME ? {
                    table: col.REFERENCED_TABLE_NAME,
                    column: col.REFERENCED_COLUMN_NAME!,
                } : undefined,
            }));

            tables.push({ name: tableName, columns, rowCount: table.TABLE_ROWS });
        }

        await conn.end();
        return { tables, databaseType: 'mysql', databaseName: config.database! };
    } catch (err) {
        await conn.end();
        throw err;
    }
}

async function getPostgreSQLSchema(config: DatabaseConfig): Promise<SchemaInfo> {
    const { Pool } = await import('pg');
    const pool = new Pool({
        host: config.host || '127.0.0.1',
        port: config.port || 5432,
        user: config.username,
        password: config.password,
        database: config.database,
        connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();

    try {
        // Get all tables in public schema
        const tablesRes = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);

        const tables: TableInfo[] = [];

        for (const row of tablesRes.rows) {
            const tableName = row.tablename;

            const colRes = await client.query(`
        SELECT 
          c.column_name, c.data_type, c.is_nullable,
          tc.constraint_type,
          ccu.table_name AS foreign_table,
          ccu.column_name AS foreign_column
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage kcu
          ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name
          AND c.table_schema = kcu.table_schema
        LEFT JOIN information_schema.table_constraints tc
          ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
        LEFT JOIN information_schema.referential_constraints rc
          ON tc.constraint_name = rc.constraint_name
        LEFT JOIN information_schema.key_column_usage ccu
          ON rc.unique_constraint_name = ccu.constraint_name
        WHERE c.table_schema = 'public' AND c.table_name = $1
        ORDER BY c.ordinal_position
      `, [tableName]);

            const countRes = await client.query(`SELECT COUNT(*) as cnt FROM "${tableName}"`);

            const columns: ColumnInfo[] = colRes.rows.map((col: {
                column_name: string; data_type: string; is_nullable: string;
                constraint_type: string | null; foreign_table: string | null; foreign_column: string | null;
            }) => ({
                name: col.column_name,
                type: col.data_type,
                nullable: col.is_nullable === 'YES',
                isPrimaryKey: col.constraint_type === 'PRIMARY KEY',
                isForeignKey: col.constraint_type === 'FOREIGN KEY',
                references: col.foreign_table ? {
                    table: col.foreign_table,
                    column: col.foreign_column!,
                } : undefined,
            }));

            tables.push({
                name: tableName,
                columns,
                rowCount: parseInt(countRes.rows[0].cnt),
            });
        }

        client.release();
        await pool.end();
        return { tables, databaseType: 'postgresql', databaseName: config.database! };
    } catch (err) {
        client.release();
        await pool.end();
        throw err;
    }
}

async function getMongoDBSchema(config: DatabaseConfig): Promise<SchemaInfo> {
    const { MongoClient } = await import('mongodb');
    if (!config.uri) {
        throw new Error('MongoDB URI is required');
    }
    
    const client = new MongoClient(config.uri, { serverSelectionTimeoutMS: 5000 });

    try {
        await client.connect();
        const db = client.db();
        
        const collections = await db.listCollections().toArray();
        const tables: TableInfo[] = [];

        for (const col of collections) {
            // MongoDB is schemaless, so we just provide a basic placeholder for columns
            const columns: ColumnInfo[] = [
                {
                    name: '_id',
                    type: 'ObjectId',
                    nullable: false,
                    isPrimaryKey: true,
                    isForeignKey: false,
                }
            ];

            let rowCount = 0;
            try {
                rowCount = await db.collection(col.name).estimatedDocumentCount();
            } catch { /* ignore */ }

            tables.push({ name: col.name, columns, rowCount });
        }

        await client.close();
        return {
            tables,
            databaseType: 'mongodb',
            databaseName: db.databaseName || 'mongodb',
        };
    } catch (err) {
        await client.close();
        throw err;
    }
}

export async function POST(req: NextRequest) {
    try {
        const config: DatabaseConfig = await req.json();

        if (!config.type) {
            return NextResponse.json({ error: 'Database type is required' }, { status: 400 });
        }

        let schema: SchemaInfo;

        switch (config.type) {
            case 'mysql':
                schema = await getMySQLSchema(config);
                break;
            case 'postgresql':
                schema = await getPostgreSQLSchema(config);
                break;
            case 'mongodb':
                schema = await getMongoDBSchema(config);
                break;
            default:
                return NextResponse.json({ error: 'Unsupported database type' }, { status: 400 });
        }

        return NextResponse.json({ success: true, schema });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('[Schema API Error]', message);
        return NextResponse.json(
            { success: false, error: `Connection failed: ${message}` },
            { status: 500 }
        );
    }
}
