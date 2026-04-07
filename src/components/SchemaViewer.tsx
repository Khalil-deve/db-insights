'use client';

import { SchemaInfo, TableInfo, ColumnInfo } from '@/types';
import { Database, Key, Link, ChevronRight, Table2 } from 'lucide-react';
import { useState } from 'react';

interface SchemaViewerProps {
    schema: SchemaInfo;
}

// ─── DB-type colour map ────────────────────────────────────────────────────────
const DB_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    mysql: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    postgresql: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    sqlite: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
};
const DB_LABELS: Record<string, string> = {
    mysql: 'MySQL', postgresql: 'PostgreSQL', sqlite: 'SQLite',
};
const FALLBACK_COLOR = { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' };

// ─── ColumnRow ─────────────────────────────────────────────────────────────────
function ColumnRow({ col }: { col: ColumnInfo }) {
    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2 px-3 border-b border-white/[0.03] text-[11px] group hover:bg-white/[0.02] transition-colors">
            {/* Key / FK icon */}
            <span className="w-5 h-5 flex items-center justify-center shrink-0">
                {col.isPrimaryKey ? (
                    <Key size={12} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                ) : col.isForeignKey ? (
                    <Link size={12} className="text-blue-400  drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]" />
                ) : null}
            </span>

            {/* Column name */}
            <span className="text-slate-200 font-mono flex-1 min-w-0 truncate group-hover:text-white transition-colors">
                {col.name}
            </span>

            {/* Type badge */}
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 shrink-0">
                {col.type}
            </span>

            {/* FK reference (full-width second line on very narrow containers) */}
            {col.isForeignKey && col.references && (
                <span className="flex items-center gap-1 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 max-w-full truncate">
                    <span className="opacity-50">→</span>
                    <span className="truncate">{col.references.table}.{col.references.column}</span>
                </span>
            )}

            {/* Required badge */}
            {!col.nullable && (
                <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-tighter bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                    Req
                </span>
            )}
        </div>
    );
}

// ─── TableRow ──────────────────────────────────────────────────────────────────
function TableRow({ table }: { table: TableInfo }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border-b border-white/[0.04] last:border-0 relative group">
            {/* Active left accent bar */}
            {expanded && (
                <div className="absolute left-0 top-0 w-0.5 h-full bg-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            )}

            {/* Table header row */}
            <div
                role="button"
                onClick={() => setExpanded(v => !v)}
                className={`flex items-center gap-2 px-3 py-3 cursor-pointer transition-all select-none ${expanded ? 'bg-indigo-500/5' : 'hover:bg-white/[0.03]'
                    }`}
            >
                {/* Chevron */}
                <ChevronRight
                    size={13}
                    className={`text-slate-500 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                />

                {/* Table icon */}
                <span className={`p-1 rounded-md shrink-0 transition-colors ${expanded ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 group-hover:text-slate-300'
                    }`}>
                    <Table2 size={13} />
                </span>

                {/* Table name — truncates cleanly */}
                <span className={`text-[12px] font-mono flex-1 min-w-0 truncate transition-colors ${expanded ? 'text-white font-bold' : 'text-slate-300 font-medium'
                    }`}>
                    {table.name}
                </span>

                {/* Meta badges — wrap on very narrow containers */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <span className="text-[9px] font-black text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full border border-white/5 uppercase tracking-tight whitespace-nowrap">
                        {table.columns.length} <span className="opacity-60">col</span>
                    </span>
                    {table.rowCount !== undefined && (
                        <span className="text-[9px] font-bold text-slate-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full border border-indigo-500/20 whitespace-nowrap">
                            ~{table.rowCount.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Expanded columns list */}
            {expanded && (
                <div className="bg-black/20 animate-in slide-in-from-top-1 duration-200 border-t border-white/[0.04]">
                    {table.columns.map(col => (
                        <ColumnRow key={col.name} col={col} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── SchemaViewer ──────────────────────────────────────────────────────────────
export function SchemaViewer({ schema }: SchemaViewerProps) {
    const color = DB_COLORS[schema.databaseType] ?? FALLBACK_COLOR;
    const label = DB_LABELS[schema.databaseType] ?? schema.databaseType;

    return (
        <div className="flex flex-col rounded-xl border border-white/8 bg-[#0f1628]/70 shadow-xl overflow-hidden h-full">

            {/* ── Header ── */}
            <div className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    {/* DB icon */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shrink-0">
                        <Database size={15} className="text-blue-400" />
                    </div>

                    {/* DB name + table count */}
                    <div className="min-w-0">
                        <div className="text-[13px] font-black text-white tracking-tight leading-none mb-1 truncate">
                            {schema.databaseName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            {schema.tables.length} Tables · Synced
                        </div>
                    </div>
                </div>

                {/* DB type badge */}
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg border shrink-0 ${color.bg} ${color.text} ${color.border} uppercase tracking-widest`}>
                    {label}
                </span>
            </div>

            {/* ── Table list ── */}
            <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                {schema.tables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                        <Database size={32} className="text-slate-700 mb-3 opacity-40" />
                        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">No tables found</p>
                    </div>
                ) : (
                    schema.tables.map(table => (
                        <TableRow key={table.name} table={table} />
                    ))
                )}
            </div>

            {/* ── Footer ── */}
            <div className="px-3 sm:px-4 py-2.5 border-t border-white/[0.05] bg-black/20 flex items-center justify-between shrink-0">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">
                    Read-Only
                </span>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    Cache active
                </div>
            </div>
        </div>
    );
}
