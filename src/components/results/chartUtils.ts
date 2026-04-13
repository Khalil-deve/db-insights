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
    if (!result.rows.length || !result.columns.length) return [];
    
    return result.columns.filter(col => {
        const vals = result.rows.slice(0, 100).map(r => r[col]);
        const validNumbers = vals.filter(v => {
            if (v === null || v === undefined || v === '') return false;
            if (typeof v === 'object') return false;
            // Clean up common numeric strings (strip $, %, commas, and letters like units)
            const clean = String(v).replace(/[$,%\sA-Za-z]/g, '');
            return !isNaN(Number(clean)) && clean !== '';
        });
        
        const nonNullCount = vals.filter(v => v !== null && v !== undefined).length;
        if (nonNullCount === 0) return false;
        
        // At least 30% of non-null values should be numeric to qualify
        return validNumbers.length > 0 && validNumbers.length >= nonNullCount * 0.3;
    });
}

export function detectLabelColumn(
    result: QueryResult,
    numericCols: string[],
): string | null {
    const nonNumeric = result.columns.filter(c => !numericCols.includes(c));
    return nonNumeric[0] || null;
}
