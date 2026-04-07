'use client';

import { ArrowRight, Sparkles, Shield, Lock, CheckCircle2, Play } from 'lucide-react';

interface ConnectHeroProps {
    demoLoading: boolean;
    onDemoMode: () => void;
}

export function ConnectHero({ demoLoading, onDemoMode }: ConnectHeroProps) {
    return (
        <div className="flex flex-col justify-center lg:pr-12 lg:items-center items-center lg:text-left text-center pb-12 lg:pb-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 w-fit bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 group cursor-default">
                <Sparkles size={12} className="group-hover:animate-pulse" />
                Natural Language → SQL in seconds
            </div>

            {/* Heading */}
            <h1 className="text-[clamp(20px,5vw,40px)] font-black leading-[1.1] tracking-[-0.025em] mb-5">
                <span className="text-white/95 drop-shadow-sm">Stop writing SQL</span>
                <br />
                <span>
                    Start asking questions
                </span>
            </h1>

            {/* Sub-heading */}
            <p className="text-[clamp(14px,1.5vw,18px)] text-slate-400 leading-relaxed max-w-lg mb-8 mx-auto lg:mx-0">
                Connect your database and start asking questions in plain English.
                Our AI engine writes, validates, and runs the query securely — you get interactive insights instantly.
            </p>

            {/* Try Demo card */}
            <div
                className={`group relative flex sm:items-center items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer w-full max-w-lg ${demoLoading
                    ? 'bg-emerald-500/5 border-emerald-500/20 cursor-wait'
                    : 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1'
                    }`}
                onClick={!demoLoading ? onDemoMode : undefined}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && !demoLoading && onDemoMode()}
            >
                {/* Play icon / spinner */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {demoLoading
                        ? <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                        : <Play size={18} className="text-emerald-400 sm:ml-0.5 fill-current" />
                    }
                </div>

                {/* Text */}
                <div className="flex-1 text-left">
                    <div className="text-[14px] sm:text-[15px] font-bold text-emerald-400 mb-1">
                        Try Demo Mode — no setup needed
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                        Built-in e-commerce database with sample data. Explore all features instantly.
                    </div>
                </div>

                <ArrowRight size={18} className="text-emerald-400 shrink-0 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
                {[
                    { icon: <Lock size={11} />, text: 'Data stays local' },
                    { icon: <Shield size={11} />, text: 'SELECT-only guardrails' },
                    { icon: <CheckCircle2 size={11} />, text: 'Open source' },
                ].map(b => (
                    <div key={b.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-medium text-slate-400">
                        <span className="text-emerald-500/80">{b.icon}</span>
                        {b.text}
                    </div>
                ))}
            </div>
        </div>
    );
}
