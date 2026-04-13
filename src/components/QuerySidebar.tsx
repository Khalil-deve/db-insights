'use client';

import React from 'react';
import { SchemaInfo, HistoryEntry } from '@/types';
import { SchemaViewer } from '@/components/SchemaViewer';
import { QueryHistory } from '@/components/QueryHistory';
import { Database, ChevronLeft, LayoutDashboard, History, BookOpen, Trophy, Package, BarChart3, Globe } from 'lucide-react';

type SidePanel = 'schema' | 'history';

const SAMPLE_QUESTIONS = [
    { icon: <Trophy size={12} className="text-amber-400" />, text: 'Show top 10 customers by total revenue' },
    { icon: <Package size={12} className="text-blue-400" />, text: 'What are the best selling products?' },
    { icon: <BarChart3 size={12} className="text-purple-400" />, text: 'Count orders grouped by status' },
    { icon: <Globe size={12} className="text-emerald-400" />, text: 'Revenue breakdown by country' },
];

interface QuerySidebarProps {
    isOpen: boolean;
    schema: SchemaInfo | null;
    isDemo: boolean;
    sidePanel: SidePanel;
    history: HistoryEntry[];
    onPanelChange: (panel: SidePanel) => void;
    onClose: () => void;       // just closes the drawer without navigating away
    onHistorySelect: (entry: HistoryEntry) => void;
    onHistoryClear: () => void;
    onSampleQuestion: (question: string) => void;
}

export function QuerySidebar({
    isOpen,
    schema,
    isDemo,
    sidePanel,
    history,
    onPanelChange,
    onClose,
    onHistorySelect,
    onHistoryClear,
    onSampleQuestion,
}: QuerySidebarProps) {
    return (
        <>
            {/* ═══════════════════════════════════════════
                MOBILE: Bottom Drawer (< sm)
            ═══════════════════════════════════════════ */}

            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            {/* Mobile bottom drawer */}
            <div
                className={`sm:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#0a0e1a]/98 border-t border-white/10 backdrop-blur-3xl shadow-2xl rounded-t-3xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'
                    }`}
                style={{ maxHeight: '80vh' }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>

                {/* Drawer Header */}
                <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
                        <Database size={15} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-100 uppercase tracking-tight">DB Insights</div>
                        <div className="text-[11px] text-slate-500 truncate font-medium">
                            {isDemo ? '🎮 Demo Mode' : schema?.databaseName}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="Close"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all active:scale-90"
                    >
                        <ChevronLeft size={18} className="-rotate-90" />
                    </button>
                </div>

                {/* Panel Tabs */}
                <div className="flex px-4 pt-3 pb-2 gap-2 shrink-0">
                    {[
                        { id: 'schema' as SidePanel, icon: <LayoutDashboard size={13} />, label: 'Schema' },
                        { id: 'history' as SidePanel, icon: <History size={13} />, label: 'History' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onPanelChange(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 ${sidePanel === tab.id
                                ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/5'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
                    {sidePanel === 'schema' && schema && (
                        <div className="p-2">
                            <SchemaViewer schema={schema} />
                        </div>
                    )}
                    {sidePanel === 'history' && (
                        <QueryHistory
                            entries={history}
                            onSelect={entry => { onHistorySelect(entry); onPanelChange('schema'); }}
                            onClear={onHistoryClear}
                        />
                    )}
                </div>

                {/* Sample Questions (demo only) */}
                {isDemo && sidePanel === 'schema' && (
                    <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
                        <div className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen size={10} className="text-blue-500" />
                            Sample Questions
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {SAMPLE_QUESTIONS.map(q => (
                                <button
                                    key={q.text}
                                    onClick={() => { onSampleQuestion(q.text); onClose(); }}
                                    className="p-2.5 text-left text-[11px] font-medium text-slate-400 bg-white/5 border border-white/5 rounded-xl transition-all duration-200 hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400 active:scale-[0.97] flex items-center gap-2"
                                >
                                    <span className="shrink-0">{q.icon}</span>
                                    <span className="truncate">{q.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════
                DESKTOP: Left Fixed Sidebar (sm+)
            ═══════════════════════════════════════════ */}
            <aside
                className={`hidden sm:flex fixed top-0 left-0 h-screen z-50 flex-col bg-[#0a0e1a]/95 border-r border-white/10 backdrop-blur-3xl transition-all duration-300 shadow-2xl overflow-hidden ${isOpen ? 'w-[280px]' : 'w-0'
                    }`}
            >
                <div className="flex flex-col h-full w-[280px]">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/10">
                            <Database size={15} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-100 uppercase tracking-tight">DB Insights</div>
                            <div className="text-[11px] text-slate-500 truncate font-medium">
                                {isDemo ? '🎮 Demo Mode' : schema?.databaseName}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            title="Close sidebar"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all active:scale-90"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    </div>

                    {/* Panel Tabs */}
                    <div className="flex p-3 gap-1.5 shrink-0">
                        {[
                            { id: 'schema' as SidePanel, icon: <LayoutDashboard size={13} />, label: 'Schema' },
                            { id: 'history' as SidePanel, icon: <History size={13} />, label: 'History' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onPanelChange(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200 ${sidePanel === tab.id
                                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {sidePanel === 'schema' && schema && (
                            <div className="p-2">
                                <SchemaViewer schema={schema} />
                            </div>
                        )}
                        {sidePanel === 'history' && (
                            <QueryHistory
                                entries={history}
                                onSelect={entry => { onHistorySelect(entry); onPanelChange('schema'); }}
                                onClear={onHistoryClear}
                            />
                        )}
                    </div>

                    {/* Sample Questions (desktop demo only) */}
                    {isDemo && sidePanel === 'schema' && (
                        <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
                            <div className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen size={10} className="text-blue-500" />
                                Sample Questions
                            </div>
                            <div className="flex flex-col gap-2">
                                {SAMPLE_QUESTIONS.map(q => (
                                    <button
                                        key={q.text}
                                        onClick={() => onSampleQuestion(q.text)}
                                        className="p-2.5 text-left text-[11px] font-medium text-slate-400 bg-white/5 border border-white/5 rounded-xl transition-all duration-200 hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                                    >
                                        <span className="shrink-0">{q.icon}</span>
                                        <span className="truncate">{q.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
