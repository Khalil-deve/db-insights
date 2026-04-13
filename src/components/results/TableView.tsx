'use client';

import { useState } from 'react';
import { QueryResult } from '@/types';

interface TableViewProps {
    result: QueryResult;
}

const PAGE_SIZE = 20;

export function TableView({ result }: TableViewProps) {
    const [page, setPage] = useState(0);

    const totalPages = Math.ceil(result.rows.length / PAGE_SIZE);
    const pageRows = result.rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className="flex flex-col w-full">
            {/* ── Horizontal scroll is ONLY on this wrapper ── */}
            <div
                className="w-full"
                style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
            >
                <table className="results-table text-left w-full" style={{ minWidth: 'max-content' }}>
                    <thead>
                        <tr className="bg-white/5">
                            <th className="text-center text-slate-500 font-bold px-3 py-2.5 text-[11px] uppercase tracking-wider sticky left-0 bg-[#0f1628] z-10 border-r border-white/5 w-10">
                                #
                            </th>
                            {result.columns.map(col => (
                                <th
                                    key={col}
                                    className="px-3 py-2.5 text-slate-300 font-bold text-[11px] uppercase tracking-wider border-l border-white/5 whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                        {pageRows.map((row, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                <td className="text-center text-slate-600 text-[11px] px-3 py-2 font-medium sticky left-0 bg-[#0f1628]/98 z-10 border-r border-white/5">
                                    {page * PAGE_SIZE + i + 1}
                                </td>
                                {result.columns.map(col => (
                                    <td
                                        key={col}
                                        className="px-3 py-2 text-[12px] sm:text-[13px] border-l border-white/5 text-slate-300 font-medium"
                                    >
                                        {row[col] === null || row[col] === undefined ? (
                                            <span className="text-slate-600 italic text-[11px]">NULL</span>
                                        ) : typeof row[col] === 'number' ? (
                                            <span className="text-blue-400 font-semibold font-mono whitespace-nowrap">
                                                {Number.isInteger(row[col])
                                                    ? (row[col] as number).toLocaleString()
                                                    : (row[col] as number).toFixed(2)}
                                            </span>
                                        ) : (
                                            <span
                                                className="block whitespace-nowrap max-w-[200px] sm:max-w-[300px] truncate"
                                                title={String(row[col])}
                                            >
                                                {String(row[col])}
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination — always full width, never scrolls ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-t border-white/5 bg-black/20 flex-shrink-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, result.rows.length)}{' '}
                        <span className="opacity-50">of</span> {result.rows.length}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Prev
                        </button>

                        <span className="text-[11px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {page + 1} / {totalPages}
                        </span>

                        <button
                            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
