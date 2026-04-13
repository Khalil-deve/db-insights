'use client';

import { PipelineStep as PipelineStepType, PipelineStepStatus } from '@/types';
import { CheckCircle, XCircle, Loader2, Database, Brain, Shield, Zap, Sparkles } from 'lucide-react';

interface PipelineProps {
    steps: PipelineStepType[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
    'db': <Database size={16} />,
    'brain': <Brain size={16} />,
    'shield': <Shield size={16} />,
    'zap': <Zap size={16} />,
    'sparkles': <Sparkles size={16} />,
};

const statusIcon = (status: PipelineStepStatus, iconKey: string) => {
    switch (status) {
        case 'done':
            return <CheckCircle size={16} className="text-emerald-400" />;
        case 'error':
            return <XCircle size={16} className="text-red-400" />;
        case 'active':
            return <Loader2 size={16} className="text-blue-400 animate-spin" />;
        default:
            return <span className="text-slate-500">{ICON_MAP[iconKey] || iconKey}</span>;
    }
};

const statusColors: Record<PipelineStepStatus, string> = {
    idle: 'bg-slate-800/50 border-slate-700 text-slate-500',
    active: 'bg-blue-500/20 border-blue-500/50 text-blue-400 ring-4 ring-blue-500/10 animate-pulse',
    done: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
};

const textColors: Record<PipelineStepStatus, string> = {
    idle: 'text-slate-500',
    active: 'text-blue-400',
    done: 'text-emerald-400',
    error: 'text-red-400',
};

export function Pipeline({ steps }: PipelineProps) {
    return (
        <div className="flex items-start gap-1 py-5">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-start flex-1">
                    <div className="flex flex-col items-center flex-1">
                        {/* Icon circle */}
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center mb-3 transition-all duration-300 ${statusColors[step.status]}`}>
                            {statusIcon(step.status, step.icon)}
                        </div>

                        {/* Label */}
                        <div className="text-center">
                            <div className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap px-1 ${textColors[step.status]}`}>
                                {step.label}
                            </div>
                            {step.detail && (
                                <div className="text-[9px] text-slate-500 mt-0.5 max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap mx-auto">
                                    {step.detail}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Connector line */}
                    {index < steps.length - 1 && (
                        <div className={`h-[1px] flex-1 mt-5 transition-all duration-700 ${step.status === 'done'
                                ? 'bg-gradient-to-r from-emerald-500/50 to-emerald-500/20'
                                : 'bg-gradient-to-r from-slate-700 to-slate-800'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export function MiniPipeline({ steps }: PipelineProps) {
    return (
        <div className="flex items-center gap-3">
            {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <span className={`${textColors[step.status]}`}>
                            {step.status === 'active' ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : step.status === 'done' ? (
                                <CheckCircle size={12} />
                            ) : (
                                <span className="text-[10px] opacity-50">○</span>
                            )}
                        </span>
                        <span className={`text-[11px] ${textColors[step.status]} ${step.status !== 'idle' ? 'font-bold' : 'font-medium'}`}>
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <span className="text-slate-700 text-[10px]">→</span>
                    )}
                </div>
            ))}
        </div>
    );
}
