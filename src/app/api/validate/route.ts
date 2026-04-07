import { NextRequest, NextResponse } from 'next/server';
import { QueryValidationResult, DatabaseConfig } from '@/types';

// ===== Query Validation API =====
// Safety guardrails before executing any query

const BLOCKED_PATTERNS = [
    /\bDROP\b/i,
    /\bDELETE\b/i,
    /\bUPDATE\b/i,
    /\bINSERT\b/i,
    /\bTRUNCATE\b/i,
    /\bALTER\b/i,
    /\bCREATE\b/i,
    /\bREPLACE\b/i,
    /\bMERGE\b/i,
    /\bEXEC\b/i,
    /\bEXECUTE\b/i,
    /\bXP_\w+/i,
    /\bSP_\w+/i,
    /\bGRANT\b/i,
    /\bREVOKE\b/i,
    /\bLOAD\s+DATA/i,
    /\bINTO\s+OUTFILE/i,
    /\bINTO\s+DUMPFILE/i,
    /\b--\s*$/m,
    /;\s*DROP/i,
    /;\s*DELETE/i,
    /;\s*UPDATE/i,
    /UNION\s+SELECT.*FROM\s+information_schema\.users/i,
];

const WARNING_PATTERNS = [
    { pattern: /SELECT\s+\*/i, message: 'Using SELECT * — consider specifying columns for better performance' },
    { pattern: /(?<!LIMIT\s)\d+(?!\s*,)/i, message: 'Query may return large result set without LIMIT' },
];

const SUSPICIOUS_PATTERNS = [
    /\/\*.*\*\//s,  // Block comments can hide malicious SQL
    /;.*;/,          // Multiple statements
    /0x[0-9a-f]+/i, // Hex encoding
    /CHAR\s*\(/i,   // CHAR() function (common in injection)
    /CONCAT\s*\(/i, // Can be used in injection
];

function normalizeSQL(sql: string): string {
    return sql.replace(/\s+/g, ' ').trim().toUpperCase();
}

function validateQuery(sql: string, allowedTables?: string[]): QueryValidationResult {
    const issues: string[] = [];
    const normalized = normalizeSQL(sql);

    // Check for blocked patterns (destructive operations)
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(sql)) {
            return {
                status: 'blocked',
                message: `Query blocked: Contains restricted operation (${pattern.source.replace(/\\b|\\s\+|\[[^\]]*\]|\\w\+/g, '').replace(/[^A-Z ]/gi, '').trim()})`,
                issues: [`Dangerous SQL pattern detected: ${pattern.source}`],
            };
        }
    }

    // Check for suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(sql)) {
            issues.push(`Suspicious pattern detected — possible injection attempt`);
        }
    }

    // Must start with SELECT
    if (!normalized.trim().startsWith('SELECT') && !normalized.trim().startsWith('WITH') && !normalized.trim().startsWith('EXPLAIN')) {
        return {
            status: 'blocked',
            message: 'Query blocked: Only SELECT queries are allowed.',
            issues: ['Non-SELECT query detected'],
        };
    }

    // Check for multiple statements
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    if (statements.length > 1) {
        return {
            status: 'blocked',
            message: 'Query blocked: Multiple SQL statements are not allowed.',
            issues: ['Multiple statements detected — possible SQL injection'],
        };
    }

    // Warning checks
    if (!/(LIMIT\s+\d+)/i.test(sql)) {
        issues.push('No LIMIT clause — query may return very large result sets');
    }

    for (const warn of WARNING_PATTERNS) {
        if (warn.pattern.test(sql)) {
            issues.push(warn.message);
        }
    }

    // Validate against allowed tables if provided
    if (allowedTables && allowedTables.length > 0) {
        const tablePattern = /(?:FROM|JOIN)\s+([`"']?[\w.]+[`"']?)/gi;
        let match;
        while ((match = tablePattern.exec(sql)) !== null) {
            const tableName = match[1].replace(/[`"']/g, '').toLowerCase();
            if (!allowedTables.map(t => t.toLowerCase()).includes(tableName)) {
                issues.push(`Table "${tableName}" not found in schema`);
            }
        }
    }

    // Suspicious injection indicators
    if (issues.some(i => i.includes('injection'))) {
        return {
            status: 'blocked',
            message: 'Query blocked: Potential SQL injection detected.',
            issues,
        };
    }

    if (issues.length > 0) {
        return {
            status: 'warning',
            message: 'Query has warnings but can proceed.',
            issues,
        };
    }

    return {
        status: 'safe',
        message: 'Query passed all safety checks.',
        issues: [],
    };
}

export async function POST(req: NextRequest) {
    try {
        const { sql, config } = await req.json() as {
            sql: string;
            config?: DatabaseConfig;
        };

        if (!sql) {
            return NextResponse.json({ error: 'SQL query is required' }, { status: 400 });
        }

        // We could optionally get schema to validate table names
        // For now, validate the SQL syntax and safety
        const result = validateQuery(sql);

        return NextResponse.json({ success: true, validation: result });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// Export for use in execute route
export { validateQuery };
