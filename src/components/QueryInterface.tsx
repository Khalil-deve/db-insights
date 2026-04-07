'use client';

import { useState, useCallback } from 'react';
import {
    DatabaseConfig, SchemaInfo, PipelineStep, GeneratedQuery,
    QueryValidationResult, QueryResult, LLMInsight, LLMProvider,
} from '@/types';
import { Pipeline } from './Pipeline';
import { ResultsViewer } from './ResultsViewer';
import {
    Send, AlertTriangle, Shield, ShieldCheck, ShieldX, Sparkles,
    Settings2, Loader2, RefreshCw, Copy, Check, ChevronDown, ChevronUp, Command,
} from 'lucide-react';

interface QueryInterfaceProps {
    schema: SchemaInfo;
    config: DatabaseConfig | null;
    isDemo: boolean;
    ollamaUrl: string;
    model: string;
    provider: LLMProvider;
    apiKey: string;
    onSaveHistory: (entry: { question: string; query: string; rowCount: number; success: boolean }) => void;
    initialQuestion?: string;
}

const INITIAL_STEPS: PipelineStep[] = [
    { id: 'schema', label: 'Schema', icon: '🗄️', status: 'idle' },
    { id: 'generate', label: 'Generate', icon: '🤖', status: 'idle' },
    { id: 'validate', label: 'Validate', icon: '🛡️', status: 'idle' },
    { id: 'execute', label: 'Execute', icon: '⚡', status: 'idle' },
    { id: 'insights', label: 'Insights', icon: '✨', status: 'idle' },
];

function resetSteps(): PipelineStep[] {
    return INITIAL_STEPS.map(s => ({ ...s, status: 'idle' as const }));
}

export function QueryInterface({
    schema, config, isDemo, ollamaUrl, model, provider, apiKey, onSaveHistory, initialQuestion,
}: QueryInterfaceProps) {
    const [question, setQuestion] = useState(initialQuestion || '');
    const [steps, setSteps] = useState<PipelineStep[]>(resetSteps());
    const [isRunning, setIsRunning] = useState(false);
    const [generatedQuery, setGeneratedQuery] = useState<GeneratedQuery | null>(null);
    const [validation, setValidation] = useState<QueryValidationResult | null>(null);
    const [result, setResult] = useState<QueryResult | null>(null);
    const [insight, setInsight] = useState<LLMInsight | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showQuery, setShowQuery] = useState(true);
    const [showInsights, setShowInsights] = useState(true);
    const [customSQL, setCustomSQL] = useState('');
    const [editingSQL, setEditingSQL] = useState(false);
    const [copiedSQL, setCopiedSQL] = useState(false);

    const updateStep = (id: string, updates: Partial<PipelineStep>) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const runQuery = useCallback(async (questionText: string, sqlOverride?: string) => {
        if (!questionText.trim() && !sqlOverride) return;
        setIsRunning(true);
        setError(null);
        setGeneratedQuery(null);
        setValidation(null);
        setResult(null);
        setInsight(null);
        setSteps(resetSteps());

        try {
            // Step 1: Schema (already done, just show it)
            updateStep('schema', { status: 'active', detail: 'Reading schema...' });
            await new Promise(r => setTimeout(r, 300));
            updateStep('schema', { status: 'done', detail: `${schema.tables.length} tables` });

            let sql = sqlOverride || '';

            if (!sqlOverride) {
                // Step 2: Generate SQL via LLM
                updateStep('generate', { status: 'active', detail: 'Thinking...' });

                const generatePayload = { question: questionText, schema, ollamaUrl, model, provider, apiKey };

                let genData;
                if (isDemo) {
                    // In demo mode, try cloud/LLM generation first
                    const genRes = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(generatePayload),
                    });
                    genData = await genRes.json();

                    if (!genData.success) {
                        // Fallback: basic SELECT for demo
                        genData = {
                            success: true,
                            query: {
                                sql: `SELECT * FROM ${schema.tables[0]?.name || 'users'} LIMIT 10;`,
                                explanation: 'Fallback query — LLM not available.',
                                confidence: 0.5,
                            },
                        };
                    }
                } else {
                    const genRes = await fetch('/api/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(generatePayload),
                    });
                    genData = await genRes.json();
                }

                if (!genData.success) {
                    updateStep('generate', { status: 'error', detail: 'Failed' });
                    throw new Error(genData.error || 'Failed to generate query');
                }

                sql = genData.query.sql;
                setGeneratedQuery(genData.query);
                updateStep('generate', { status: 'done', detail: `${Math.round(genData.query.confidence * 100)}% confident` });
            } else {
                setGeneratedQuery({ sql: sqlOverride, explanation: 'Custom SQL query', confidence: 1 });
                updateStep('generate', { status: 'done', detail: 'Custom SQL' });
            }

            // Step 3: Validate
            updateStep('validate', { status: 'active', detail: 'Checking safety...' });
            const valRes = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql }),
            });
            const valData = await valRes.json();

            if (!valData.success) {
                updateStep('validate', { status: 'error', detail: 'Error' });
                throw new Error(valData.error || 'Validation failed');
            }

            const valResult: QueryValidationResult = valData.validation;
            setValidation(valResult);

            if (valResult.status === 'blocked') {
                updateStep('validate', { status: 'error', detail: 'Blocked!' });
                throw new Error(`🚫 ${valResult.message}`);
            }

            updateStep('validate', {
                status: 'done',
                detail: valResult.status === 'warning' ? 'Warnings' : 'Safe',
            });

            // Step 4: Execute
            updateStep('execute', { status: 'active', detail: 'Running query...' });

            let execData;
            if (isDemo) {
                const execRes = await fetch('/api/demo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sql }),
                });
                execData = await execRes.json();
            } else {
                const execRes = await fetch('/api/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sql, config }),
                });
                execData = await execRes.json();
            }

            if (!execData.success) {
                updateStep('execute', { status: 'error', detail: 'Failed' });
                throw new Error(execData.error || 'Query execution failed');
            }

            const qResult: QueryResult = execData.result;
            setResult(qResult);
            updateStep('execute', { status: 'done', detail: `${qResult.rowCount} rows · ${qResult.executionTimeMs}ms` });

            // Step 5: Insights (optional, may fail if Ollama not available)
            updateStep('insights', { status: 'active', detail: 'Analyzing...' });

            try {
                const insightRes = await fetch('/api/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: questionText, result: qResult, schema, ollamaUrl, model, provider, apiKey }),
                });
                const insightData = await insightRes.json();

                if (insightData.success && insightData.insight) {
                    setInsight(insightData.insight);
                    updateStep('insights', { status: 'done', detail: 'Ready' });
                } else {
                    updateStep('insights', { status: 'done', detail: 'Basic' });
                }
            } catch {
                updateStep('insights', { status: 'done', detail: 'Skipped' });
            }

            // Save to history
            onSaveHistory({
                question: questionText,
                query: sql,
                rowCount: qResult.rowCount,
                success: true,
            });

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            onSaveHistory({
                question: questionText,
                query: '',
                rowCount: 0,
                success: false,
            });
        } finally {
            setIsRunning(false);
        }
    }, [schema, config, isDemo, ollamaUrl, model, onSaveHistory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSQL && customSQL) {
            runQuery(question || 'Custom SQL', customSQL);
        } else {
            runQuery(question);
        }
    };

    const copySQL = () => {
        if (generatedQuery?.sql) {
            navigator.clipboard.writeText(generatedQuery.sql);
            setCopiedSQL(true);
            setTimeout(() => setCopiedSQL(false), 2000);
        }
    };

    const validationIcon = validation?.status === 'safe'
        ? <ShieldCheck size={16} className="text-emerald-400" />
        : validation?.status === 'warning'
            ? <AlertTriangle size={16} className="text-amber-400" />
            : <ShieldX size={16} className="text-rose-400" />;

    const validationClasses = validation?.status === 'safe'
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : validation?.status === 'warning'
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400';

    return (
        <div className="flex flex-col gap-6">
            {/* Query Input */}
            <div className="glass-card p-8 ring-1 ring-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] opacity-50 group-hover:opacity-100 transition-opacity" />

                <form onSubmit={handleSubmit} className="relative z-10">
                    <div className="mb-6 relative">
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-lg font-medium text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none min-h-[120px] scrollbar-thin"
                            placeholder="Ask anything about your data... e.g. 'Show me top 10 customers by revenue last month'"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                            <Command size={10} />
                            <span>+ Enter to run</span>
                        </div>
                    </div>

                    {/* SQL Editor Toggle */}
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setEditingSQL(!editingSQL)}
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest group"
                        >
                            <Settings2 size={12} className="group-hover:rotate-45 transition-transform" />
                            {editingSQL ? 'Hide SQL editor' : 'Write SQL manually (expert)'}
                        </button>

                        {editingSQL && (
                            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="bg-black/60 rounded-xl border border-white/5 overflow-hidden">
                                    <div className="px-4 py-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Custom SQL Buffer</span>
                                        <span className="text-[9px] font-medium text-amber-500/80">⚠️ Safety validation still enforced</span>
                                    </div>
                                    <textarea
                                        className="w-full bg-transparent p-4 font-mono text-sm text-blue-300 outline-none resize-y min-h-[100px]"
                                        placeholder="SELECT * FROM users LIMIT 10;"
                                        value={customSQL}
                                        onChange={e => setCustomSQL(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {isRunning ? 'Processing Engine' : 'Engine Ready'}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="relative group overflow-hidden bg-blue-600 hover:bg-blue-500 text-white px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:grayscale disabled:opacity-50"
                            disabled={isRunning || (!question.trim() && !customSQL.trim())}
                        >
                            <div className="relative z-10 flex items-center gap-3">
                                {isRunning ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>Execute Intelligence</span>
                                    </>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Pipeline Progress */}
            {steps.some(s => s.status !== 'idle') && (
                <div className="glass-card p-4 ring-1 ring-white/5 shadow-xl">
                    <Pipeline steps={steps} />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="animate-slide-up flex items-start gap-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 ring-1 ring-rose-500/10">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-rose-400" />
                    </div>
                    <div>
                        <div className="text-xs font-black text-rose-400 uppercase tracking-[0.2em] mb-1">Execution Failed</div>
                        <div className="text-slate-300 font-medium leading-relaxed">{error}</div>
                    </div>
                </div>
            )}

            {/* Generated SQL */}
            {generatedQuery && (
                <div className="glass-card animate-slide-up overflow-hidden ring-1 ring-white/5 shadow-2xl">
                    <div
                        onClick={() => setShowQuery(!showQuery)}
                        className="flex items-center gap-4 px-6 py-4 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <Shield size={16} className="text-indigo-400" />
                        </div>
                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex-1">
                            Generated SQL Protocol
                        </span>

                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-tight">
                                {Math.round(generatedQuery.confidence * 100)}% Confidence
                            </span>

                            <button
                                onClick={e => { e.stopPropagation(); copySQL(); }}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                                title="Copy SQL"
                            >
                                {copiedSQL ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>

                            <div className="text-slate-500 ml-2">
                                {showQuery ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                        </div>
                    </div>

                    {showQuery && (
                        <div className="border-t border-white/5 animate-in fade-in duration-300">
                            <pre className="p-6 bg-black/60 font-mono text-sm text-blue-300/90 leading-relaxed overflow-x-auto scrollbar-thin">
                                {generatedQuery.sql}
                            </pre>

                            {generatedQuery.explanation && (
                                <div className="px-6 py-4 bg-indigo-500/5 text-xs font-medium text-slate-400 border-t border-white/5 italic">
                                    💡 {generatedQuery.explanation}
                                </div>
                            )}

                            {/* Validation indicator */}
                            {validation && (
                                <div className={`flex items-start gap-4 px-6 py-4 border-t ${validationClasses}`}>
                                    <div className="shrink-0 mt-0.5">
                                        {validationIcon}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[11px] font-black uppercase tracking-widest block mb-1">Safety Report</span>
                                        <p className="text-sm font-bold">{validation.message}</p>
                                        {validation.issues.length > 0 && (
                                            <ul className="mt-3 space-y-1.5 opacity-80">
                                                {validation.issues.map((issue, i) => (
                                                    <li key={i} className="text-[11px] flex items-center gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-current" />
                                                        {issue}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Re-run button */}
                            <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex gap-4">
                                <button
                                    onClick={() => runQuery(question, generatedQuery.sql)}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-[11px] uppercase tracking-widest transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isRunning}
                                >
                                    <RefreshCw size={14} className={isRunning ? 'animate-spin' : ''} />
                                    <span>Force Execution</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            {result && <ResultsViewer result={result} />}

            {/* AI Insights */}
            {insight && (
                <div className="glass-card animate-slide-up overflow-hidden ring-1 ring-purple-500/20 shadow-2xl relative shadow-purple-500/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />

                    <div
                        onClick={() => setShowInsights(!showInsights)}
                        className="flex items-center gap-4 px-6 py-5 cursor-pointer bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                            <Sparkles size={18} className="text-purple-400 animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em] block mb-0.5">Artificial Intelligence</span>
                            <span className="text-sm font-black text-slate-200 uppercase tracking-tight">Executive Summary & Findings</span>
                        </div>
                        <div className="text-slate-500">
                            {showInsights ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>

                    {showInsights && (
                        <div className="p-8 border-t border-purple-500/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <p className="text-lg font-medium text-slate-100 leading-relaxed mb-10 first-letter:text-4xl first-letter:font-black first-letter:text-purple-500 first-letter:mr-3 first-letter:float-left">
                                {insight.summary}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {insight.keyFindings.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1 border-l-2 border-purple-500">
                                            Key Discovery Points
                                        </div>
                                        <div className="space-y-4">
                                            {insight.keyFindings.map((finding, i) => (
                                                <div key={i} className="flex items-start gap-4 group">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 shadow-lg group-hover:scale-110 transition-transform">
                                                        <span className="text-[10px] font-black text-purple-400">{i + 1}</span>
                                                    </div>
                                                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed group-hover:text-slate-200 transition-colors">
                                                        {finding}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {insight.recommendation && (
                                    <div className="space-y-6">
                                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] pl-1 border-l-2 border-amber-500">
                                            Strategic Recommendation
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-colors rounded-2xl" />
                                            <div className="relative p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                                                <span className="text-2xl shrink-0 opacity-80 group-hover:scale-125 transition-transform duration-500">💡</span>
                                                <p className="text-[13px] text-amber-500/90 font-bold leading-relaxed">
                                                    {insight.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
