import { QueryResult } from '@/types';

export const CHART_COLORS = [
    '#3b82f6',
    '#8b5cf6',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
];

export function detectNumericColumns(result: QueryResult): string[] {
    if (!result.rows.length) return [];
    return result.columns.filter(col => {
        const vals = result.rows.slice(0, 10).map(r => r[col]);
        return vals.every(v => v !== null && v !== undefined && !isNaN(Number(v)));
    });
}

export function detectLabelColumn(
    result: QueryResult,
    numericCols: string[],
): string | null {
    const nonNumeric = result.columns.filter(c => !numericCols.includes(c));
    return nonNumeric[0] || null;
}
