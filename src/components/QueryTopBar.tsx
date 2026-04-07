'use client';

import { SchemaInfo } from '@/types';
import { LayoutDashboard, HelpCircle, X, PanelLeft } from 'lucide-react';

interface QueryTopBarProps {
    schema: SchemaInfo | null;
    isDemo: boolean;
    sidebarOpen: boolean;
    showHelp: boolean;
    onToggleSidebar: () => void;
    onToggleHelp: () => void;
}

const HELP_STEPS = [
    { num: 1, title: 'Connect', desc: 'Enter your database credentials or try Demo Mode.' },
    { num: 2, title: 'Ask', desc: 'Type your question in plain English in the query box.' },
    { num: 3, title: 'AI Generates SQL', desc: 'The AI writes, validates, and runs the query safely.' },
    { num: 4, title: 'See Insights', desc: 'View results as table, chart, or JSON with AI summary.' },
];

export function QueryTopBar({
    schema, isDemo, sidebarOpen, showHelp,
    onToggleSidebar, onToggleHelp,
}: QueryTopBarProps) {
    return (
        <>
            {/* Sticky header */}
            <header className="sticky top-0 z-40 bg-[#0a0e1a]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-5 py-2.5 flex items-center gap-3 shadow-sm">
                {/* Sidebar toggle — visible on desktop only */}
                <button
                    onClick={onToggleSidebar}
                    title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold transition-all hover:bg-white/10 hover:text-slate-200 hover:border-white/20 active:scale-95 group"
                >
                    <LayoutDashboard size={14} className="group-hover:text-blue-400 transition-colors" />
                    <span className="hidden sm:inline">Menu</span>
                </button>

                {/* DB info */}
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium truncate">
                        {isDemo ? (
                            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                🎮 Demo — E-Commerce Database
                            </span>
                        ) : (
                            <span className="text-slate-400">
                                <span className="font-bold text-slate-300">{schema?.databaseType?.toUpperCase()}</span>
                                <span className="mx-1.5 opacity-30">·</span>
                                {schema?.databaseName}
                                <span className="mx-1.5 opacity-30">·</span>
                                <span className="font-bold text-slate-300">{schema?.tables.length}</span> tables
                            </span>
                        )}
                    </div>
                </div>

                {/* Help button */}
                <button
                    onClick={onToggleHelp}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold transition-all hover:bg-white/10 hover:text-slate-200 hover:border-white/20 active:scale-95 group"
                >
                    <HelpCircle size={14} className="group-hover:text-amber-400 transition-colors" />
                    <span className="hidden sm:inline">How to use</span>
                </button>
            </header>

            {/* Mobile FAB — opens bottom drawer on small screens */}
            <button
                onClick={onToggleSidebar}
                title="Open menu"
                className="sm:hidden fixed bottom-6 right-5 z-[60] w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 active:scale-[0.92] transition-all border border-white/10"
            >
                {sidebarOpen
                    ? <X size={22} className="text-white" />
                    : <PanelLeft size={22} className="text-white" />
                }
            </button>

            {/* Help overlay */}
            {showHelp && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200"
                    onClick={onToggleHelp}
                >
                    <div
                        className="glass-card max-w-[480px] w-full p-8 relative overflow-hidden ring-1 ring-white/20 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Decorative background orb */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <span className="text-blue-500">How to Use</span> DB Insights
                            </h2>
                            <button
                                onClick={onToggleHelp}
                                className="text-slate-500 hover:text-white transition-colors p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Steps */}
                        <div className="flex flex-col gap-6">
                            {HELP_STEPS.map(item => (
                                <div key={item.num} className="flex gap-5 group">
                                    <div className="w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-black text-white shadow-lg transition-transform group-hover:scale-110">
                                        {item.num}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors">
                                            {item.title}
                                        </div>
                                        <div className="text-[13px] text-slate-500 leading-relaxed font-medium">
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tip */}
                        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                            <span className="text-lg shrink-0">💡</span>
                            <p className="text-[12px] text-amber-500/90 leading-relaxed font-medium">
                                <strong className="text-amber-500">Tip:</strong> Try Demo Mode for instant access — no database credentials required to get started!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
