'use client';

import { MessageSquare, Database, Sparkles, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';

const STEPS = [
    {
        num: '01',
        icon: <Database size={20} />,
        title: 'Connect Your Database',
        desc: 'Enter your MySQL, PostgreSQL, or SQLite credentials. Your data never leaves your machine — everything stays local.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
    },
    {
        num: '02',
        icon: <MessageSquare size={20} />,
        title: 'Ask in Plain English',
        desc: 'Type your question naturally — "Show top customers by revenue", "Which products are running low?" — no SQL needed.',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
    },
    {
        num: '03',
        icon: <Sparkles size={20} />,
        title: 'Generates & Validates SQL',
        desc: 'The AI converts your question to SQL, validates it for safety (no destructive queries allowed), and runs it instantly.',
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
    },
    {
        num: '04',
        icon: <BarChart3 size={20} />,
        title: 'See Results & Insights',
        desc: 'Results appear as interactive tables, charts, or JSON. AI generates a plain-English summary with key findings.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
    },
];

export function HowItWorks() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-20 relative">
            {/* Section header */}
            <div className="text-center mb-14">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-4 bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-500 uppercase tracking-widest">
                    <CheckCircle2 size={12} />
                    Simple 4-step workflow
                </div>
                <h2 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight leading-tight mb-4">
                    How it works
                </h2>
                <p className="text-base text-slate-500 leading-relaxed max-w-lg mx-auto">
                    From connection to insight in under 30 seconds — no SQL experience required.
                </p>
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {STEPS.map((step, i) => (
                    <div key={step.num} className="relative flex flex-col items-center group">
                        {/* Arrow between steps (desktop) */}
                        {i < STEPS.length - 1 && (
                            <div className="hidden lg:block absolute top-7 -right-3 z-10 text-slate-300">
                                <ArrowRight size={16} />
                            </div>
                        )}

                        {/* Icon circle */}
                        <div className={`w-14 h-14 rounded-full ${step.bg} border ${step.border} flex items-center justify-center ${step.color} mb-6 transition-all duration-300 group-hover:scale-110 shadow-lg shadow-black/5 relative z-10`}>
                            {step.icon}
                            {/* Step number badge */}
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#fff]">
                                {i + 1}
                            </div>
                        </div>

                        {/* Card */}
                        <div className="adaptive-card w-full p-6 text-center">
                            <div className={`text-[13px] font-bold ${step.color} mb-2 tracking-widest`}>
                                STEP {step.num}
                            </div>
                            <h3 className="text-lg font-extrabold mb-3 leading-snug">
                                {step.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-500">
                                {step.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
