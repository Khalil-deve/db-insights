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
        <div className="flex items-center justify-between p-2.5 sm:p-4 border-b border-white/5 bg-black/10 gap-2 flex-wrap">
            {/* Left: tabs + stats */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                {/* View switcher */}
                <div className="flex bg-black/30 p-1 rounded-xl border border-white/5 shadow-inner">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onViewChange(tab.id)}
                            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all ${
                                view === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-[10px] sm:text-[11px] text-emerald-400 font-black uppercase tracking-widest whitespace-nowrap">
                            {result.rowCount.toLocaleString()} rows
                        </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 whitespace-nowrap">
                        <span className="text-blue-500/70 font-mono">{result.executionTimeMs}ms</span>
                    </div>
                </div>
            </div>

            {/* Right: export */}
            <button
                onClick={onDownloadCSV}
                className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-[10px] sm:text-[11px] uppercase tracking-widest transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98] whitespace-nowrap"
            >
                <Download size={12} />
                <span>CSV</span>
            </button>
        </div>
    );
}
