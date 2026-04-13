'use client';

import { DatabaseConfig, DatabaseType } from '@/types';
import { useState, useEffect } from 'react';
import { Database, Server, Lock, Eye, EyeOff, TestTube, CheckCircle, XCircle, Loader2, ChevronDown } from 'lucide-react';

interface DbConnectProps {
    onConnect: (config: DatabaseConfig, schema: unknown) => void;
    onDemoMode: () => void;
}

const DB_DEFAULTS: Record<DatabaseType, Partial<DatabaseConfig>> = {
    mysql: { host: 'localhost', port: 3306 },
    postgresql: { host: 'localhost', port: 5432 },
    mongodb: { uri: 'mongodb://localhost:27017' },
};

type DbCategory = 'relational' | 'non-relational';
type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export function DbConnect({ onConnect, onDemoMode }: DbConnectProps) {
    const [dbCategory, setDbCategory] = useState<DbCategory>('relational');
    const [dbType, setDbType] = useState<DatabaseType>('mysql');
    const [config, setConfig] = useState<DatabaseConfig>({ type: 'mysql', host: 'localhost', port: 3306 });
    const [showPwd, setShowPwd] = useState(false);
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [testMessage, setTestMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const updateConfig = (updates: Partial<DatabaseConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
        setTestStatus('idle');
    };

    const handleCategoryChange = (category: DbCategory) => {
        setDbCategory(category);
        const newType = category === 'relational' ? 'mysql' : 'mongodb';
        setDbType(newType);
        setConfig({ type: newType, ...DB_DEFAULTS[newType] });
        setTestStatus('idle');
    };

    const handleTypeChange = (type: DatabaseType) => {
        setDbType(type);
        setConfig({ type, ...DB_DEFAULTS[type] });
        setTestStatus('idle');
    };

    const testConnection = async () => {
        setTestStatus('testing');
        setTestMessage('Connecting...');

        try {
            const res = await fetch('/api/schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            const data = await res.json();

            if (data.success) {
                setTestStatus('success');
                setTestMessage(`Connected! Found ${data.schema.tables.length} collections/tables.`);
            } else {
                setTestStatus('error');
                setTestMessage(data.error || 'Connection failed');
            }
        } catch (err) {
            setTestStatus('error');
            setTestMessage('Network error — check your connection');
        }
    };

    const connect = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            const data = await res.json();

            if (data.success) {
                onConnect(config, data.schema);
            } else {
                setTestStatus('error');
                setTestMessage(data.error || 'Connection failed');
            }
        } catch {
            setTestStatus('error');
            setTestMessage('Failed to connect to database');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {/* Database Category and Type Selectors */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 min-w-0">
                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">
                        Database Engine
                    </label>
                    <div className="relative">
                        <select
                            value={dbCategory}
                            onChange={(e) => handleCategoryChange(e.target.value as DbCategory)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all focus:border-blue-500/50 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none"
                        >
                            <option value="relational">Relational</option>
                            <option value="non-relational">Non-Relational</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">
                        Database Type
                    </label>
                    <div className="relative">
                        <select
                            value={dbType}
                            onChange={(e) => handleTypeChange(e.target.value as DatabaseType)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all focus:border-blue-500/50 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none"
                        >
                            {dbCategory === 'relational' ? (
                                <>
                                    <option value="mysql">MySQL</option>
                                    <option value="postgresql">PostgreSQL</option>
                                </>
                            ) : (
                                <option value="mongodb">MongoDB</option>
                            )}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Connection Form */}
            <div className="glass-card p-5 border border-white/10 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-2 mb-6">
                    <Server size={16} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                        {dbType === 'mongodb' ? 'MongoDB URI' : 'Connection Details'}
                    </span>
                </div>

                {dbType === 'mongodb' ? (
                    <div className="mb-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">
                            Connection String (URI)
                        </label>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/10"
                            placeholder="mongodb+srv://user:pass@cluster.mongodb.net/test"
                            value={config.uri || ''}
                            onChange={e => updateConfig({ uri: e.target.value })}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">
                                    Host
                                </label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="localhost"
                                    value={config.host || ''}
                                    onChange={e => updateConfig({ host: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">
                                    Port
                                </label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/10"
                                    type="number"
                                    value={config.port || ''}
                                    onChange={e => updateConfig({ port: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">
                                Database Name
                            </label>
                            <input
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/10"
                                placeholder="my_database"
                                value={config.database || ''}
                                onChange={e => updateConfig({ database: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">
                                    Username
                                </label>
                                <input
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="root"
                                    value={config.username || ''}
                                    onChange={e => updateConfig({ username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-slate-200 outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/60 focus:ring-4 focus:ring-blue-500/10"
                                        type={showPwd ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={config.password || ''}
                                        onChange={e => updateConfig({ password: e.target.value })}
                                    />
                                    <button
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                     </div>
                )}

                {/* Security note */}
                <div className="flex items-start gap-2.5 mt-6 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 transition-colors hover:bg-blue-500/10">
                    <Lock size={12} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                        Credentials stay local — only <span className="text-blue-400 font-bold">READ</span> queries are executed. No data is sent externally.
                    </p>
                </div>

                {/* Test status */}
                {testStatus !== 'idle' && (
                    <div className={`mt-4 p-3.5 rounded-xl border flex items-center gap-3 text-sm font-medium transition-all animate-slide-up ${testStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        testStatus === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                        {testStatus === 'testing' && <Loader2 size={16} className="animate-spin" />}
                        {testStatus === 'success' && <CheckCircle size={16} />}
                        {testStatus === 'error' && <XCircle size={16} />}
                        {testMessage}
                    </div>
                )}

                {/* Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                    <button
                        onClick={testConnection}
                        className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={testStatus === 'testing'}
                    >
                        <TestTube size={15} />
                        Test Connection
                    </button>
                    <button
                        onClick={connect}
                        className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Database size={15} />}
                        Connect & Explore
                    </button>
                </div>
            </div>
        </div>
    );
}
