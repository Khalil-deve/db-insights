'use client';

import { HistoryEntry } from '@/types';
import { History, CheckCircle, XCircle, Clock, Trash2, Database } from 'lucide-react';

interface QueryHistoryProps {
    entries: HistoryEntry[];
    onSelect: (entry: HistoryEntry) => void;
    onClear: () => void;
}

function timeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function QueryHistory({ entries, onSelect, onClear }: QueryHistoryProps) {
    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 shadow-inner pointer-events-none">
                    <History size={28} className="text-slate-600 opacity-40" />
                </div>
                <div className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-2">Workspace Empty</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-60">Your query architecture will start here</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black/10">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <History size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.15em]">
                        Query Log <span className="ml-1 opacity-50 font-medium">({entries.length})</span>
                    </span>
                </div>

                <button
                    onClick={onClear}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all group"
                >
                    <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Wipe</span>
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {entries.map(entry => (
                    <div
                        key={entry.id}
                        onClick={() => onSelect(entry)}
                        className="p-4 border-b border-white/[0.04] last:border-0 cursor-pointer transition-all hover:bg-white/[0.03] group relative overflow-hidden active:bg-white/[0.05]"
                    >
                        {/* Status underline decoration */}
                        <div className={`absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-300 ${entry.success ? 'bg-emerald-500/30' : 'bg-rose-500/30'
                            }`} />

                        <div className="flex gap-4">
                            <div className={`mt-0.5 w-8 h-8 shrink-0 rounded-xl flex items-center justify-center border transition-all ${entry.success
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/10'
                                    : 'bg-rose-500/5 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/10'
                                }`}>
                                {entry.success ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-200 group-hover:text-white transition-colors truncate mb-2">
                                    {entry.question}
                                </p>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                        <Clock size={10} className="text-slate-600" />
                                        {timeAgo(entry.timestamp)}
                                    </div>

                                    {entry.success && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500/70 uppercase tracking-tighter">
                                            <Database size={10} />
                                            {entry.rowCount.toLocaleString()} Rows
                                        </div>
                                    )}

                                    {!entry.success && (
                                        <span className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest">Failed Execution</span>
                                    )}
                                </div>
                            </div>

                            <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                <div className="p-1 px-2 rounded bg-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/30">
                                    Select
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Info */}
            <div className="px-5 py-3 bg-black/20 border-t border-white/[0.04]">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    Encrypted Session History
                </div>
            </div>
        </div>
    );
}
