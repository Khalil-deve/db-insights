'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { QueryResult } from '@/types';

interface JsonViewProps {
    result: QueryResult;
}

export function JsonView({ result }: JsonViewProps) {
    const [copied, setCopied] = useState(false);
    const json = JSON.stringify(result.rows, null, 2);

    const copy = () => {
        navigator.clipboard.writeText(json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group w-full">
            {/* Copy button */}
            <button
                onClick={copy}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-slate-300 font-bold text-[10px] uppercase tracking-widest transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] opacity-0 group-hover:opacity-100 shadow-xl backdrop-blur-md"
            >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* JSON — ONLY this scrolls horizontally */}
            <div
                className="w-full"
                style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
            >
                <pre
                    className="p-4 bg-black/40 text-[11px] sm:text-[12px] text-blue-300/80 font-mono leading-relaxed max-h-[420px] overflow-y-auto scrollbar-thin"
                    style={{ minWidth: 'max-content' }}
                >
                    {json}
                </pre>
            </div>
        </div>
    );
}
