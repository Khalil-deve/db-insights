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
        <div className="relative group">
            {/* Copy button — appears on hover */}
            <button
                onClick={copy}
                className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold text-[11px] uppercase tracking-widest transition-all duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] opacity-0 group-hover:opacity-100 shadow-xl backdrop-blur-md"
            >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                {copied ? 'COPIED!' : 'COPY JSON'}
            </button>

            {/* JSON output with both axes scrollable */}
            <pre
                className="p-4 sm:p-6 bg-black/40 text-[12px] sm:text-[13px] text-blue-300/80 font-mono leading-relaxed max-h-[500px] overflow-x-auto overflow-y-auto scrollbar-thin"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {json}
            </pre>
        </div>
    );
}
