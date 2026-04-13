'use client';

import { useState } from 'react';
import { QueryResult, ViewMode } from '@/types';
import { ResultsHeader } from '@/components/results/ResultsHeader';
import { TableView } from '@/components/results/TableView';
import { ChartView } from '@/components/results/ChartView';
import { JsonView } from '@/components/results/JsonView';

interface ResultsViewerProps {
    result: QueryResult;
}

function buildCSV(result: QueryResult): string {
    const header = result.columns.join(',');
    const rows = result.rows.map(row =>
        result.columns.map(col => {
            const v = row[col];
            if (v === null || v === undefined) return '';
            const s = String(v);
            return s.includes(',') || s.includes('"')
                ? `"${s.replace(/"/g, '""')}"`
                : s;
        }).join(','),
    );
    return [header, ...rows].join('\n');
}

export function ResultsViewer({ result }: ResultsViewerProps) {
    const [view, setView] = useState<ViewMode>('table');

    const downloadCSV = () => {
        const csv = buildCSV(result);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `query-results-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        /* The card itself must NOT overflow — clip it */
        <div className="glass-card animate-slide-up shadow-2xl ring-1 ring-white/5 overflow-hidden w-full">
            {/* Tab bar — always responsive, never scrolls */}
            <ResultsHeader
                result={result}
                view={view}
                onViewChange={setView}
                onDownloadCSV={downloadCSV}
            />

            {/* View pane — inner scroll handled per-view */}
            <div className="w-full min-h-[400px] overflow-hidden bg-[#0f1628]/30">
                {view === 'table' && <TableView result={result} />}
                {view === 'chart' && <ChartView result={result} />}
                {view === 'json' && <JsonView result={result} />}
            </div>
        </div>
    );
}
