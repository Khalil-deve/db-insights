'use client';

import React from 'react';
import { ViewMode, QueryResult } from '@/types';
import { Table2, Code2, BarChart3, Download } from 'lucide-react';

interface ResultsHeaderProps {
    result: QueryResult;
    view: ViewMode;
    onViewChange: (v: ViewMode) => void;
    onDownloadCSV: () => void;
}

const TABS: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
    { id: 'table', label: 'Table', icon: <Table2 size={13} /> },
    { id: 'chart', label: 'Chart', icon: <BarChart3 size={13} /> },
    { id: 'json', label: 'JSON', icon: <Code2 size={13} /> },
];

export function ResultsHeader({ result, view, onViewChange, onDownloadCSV }: ResultsHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 border-b border-white/5 bg-black/10 gap-3">
            {/* Left: tabs + stats */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-8">
                {/* View switcher */}
                <div className="flex bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onViewChange(tab.id)}
                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${view === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Stats: row count + execution time */}
                <div className="flex items-center gap-3 sm:gap-5">
                    <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-lg shadow-emerald-500/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] text-emerald-400 font-black uppercase tracking-widest">
                            {result.rowCount.toLocaleString()} RESULTS
                        </span>
                    </div>

                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        <span className="text-blue-500/60 font-mono">{result.executionTimeMs}ms</span>
                    </div>
                </div>
            </div>

            {/* Right: CSV export */}
            <button
                onClick={onDownloadCSV}
                className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-[11px] uppercase tracking-widest transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] shadow-lg"
            >
                <Download size={13} />
                <span className="hidden xs:inline">EXPORT</span> CSV
            </button>
        </div>
    );
}
