'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    Database,
    Shield,
    Zap,
    Users,
    Heart,
    Globe,
    ArrowRight,
    CheckCircle2,
    Star,
    MessageSquare,
    Lock,
    BarChart3,
    Sparkles,
    Code2,
    Eye,
    Target,
    Lightbulb,
    TrendingUp,
    Award,
    Github,
    Twitter,
    Linkedin,
    Mail,
    ExternalLink,
    ChevronRight,
    Quote,
    Play,
} from 'lucide-react';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import logo from '../../../public/logo.png';

/* ──────────────────────────────────────────────────
   ANIMATED COUNTER HOOK
────────────────────────────────────────────────── */
function useCountUp(target: number, duration: number = 2000, startOnView: boolean = true) {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!startOnView) {
            setHasStarted(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasStarted, startOnView]);

    useEffect(() => {
        if (!hasStarted) return;

        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // easeOutQuart
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [hasStarted, target, duration]);

    return { count, ref };
}

/* ──────────────────────────────────────────────────
   SCROLL REVEAL HOOK
────────────────────────────────────────────────── */
function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsVisible(true);
            },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
}

/* ──────────────────────────────────────────────────
   DATA
────────────────────────────────────────────────── */
const STATS = [
    { value: 10000, suffix: '+', label: 'Queries Processed', icon: <Database size={20} /> },
    { value: 99, suffix: '.9%', label: 'Uptime Guarantee', icon: <Shield size={20} /> },
    { value: 500, suffix: '+', label: 'Active Users', icon: <Users size={20} /> },
    { value: 3, suffix: '', label: 'Database Types', icon: <Sparkles size={20} /> },
];

const VALUES = [
    {
        icon: <Eye size={24} />,
        title: 'Transparency',
        desc: 'Open-source and fully auditable. Your data never leaves your infrastructure. Every query is visible and traceable.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        glow: 'rgba(59,130,246,0.15)',
    },
    {
        icon: <Shield size={24} />,
        title: 'Security First',
        desc: 'Read-only access with SELECT-only guardrails. We never store your credentials or your data. Everything runs locally.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'rgba(16,185,129,0.15)',
    },
    {
        icon: <Lightbulb size={24} />,
        title: 'Simplicity',
        desc: 'Built for everyone—not just developers. Ask questions in plain English and get actionable insights immediately.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'rgba(245,158,11,0.15)',
    },
    {
        icon: <Target size={24} />,
        title: 'Accessibility',
        desc: 'Normal users can query databases without SQL knowledge. We bridge the gap between your data and the people who need it.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        glow: 'rgba(168,85,247,0.15)',
    },
];

//         quote: "DB Insights completely changed how our marketing team accesses customer data. No more waiting for engineering—they just ask questions!",
//         name: 'Emily Johnson',
//         role: 'Head of Marketing, DataFlow Inc.',
//         image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
//         stars: 5,
//     },
//     {
//         quote: "Finally, a tool that lets non-technical employees explore our databases safely. The read-only guard rails give me complete peace of mind.",
//         name: 'Michael Park',
//         role: 'CTO, NexaCloud',
//         image: 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=200&h=200&fit=crop&crop=face',
//         stars: 5,
//     },
//     {
//         quote: "We went from 50 SQL requests a day to zero. Everyone on the team can now pull their own reports. Game changer.",
//         name: 'Laura Williams',
//         role: 'VP of Operations, ScaleUp',
//         image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
//         stars: 5,
//     },
// ];

const items = [
    {
        step: '01',
        title: 'Connect your database',
        desc: 'Enter your database credentials or use our demo mode. We support MySQL, PostgreSQL, and SQLite.',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
    },
    {
        step: '02',
        title: 'Ask in plain English',
        desc: 'Type questions like "Show me top 10 customers by revenue" or "What were last month\'s sales?"',
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
    },
    {
        step: '03',
        title: 'Get instant results',
        desc: 'AI writes the SQL, runs it safely (read-only), and presents results with charts and summaries.',
        color: 'text-purple-400',
        borderColor: 'border-purple-500/30',
    },
]

const TIMELINE = [
    {
        year: '2024',
        title: 'The Idea',
        desc: 'Born from frustration with SQL bottlenecks in small teams. The idea: let AI translate plain English to SQL.',
        icon: <Lightbulb size={18} />,
        color: '#f59e0b',
    },
    {
        year: '2024',
        title: 'First Prototype',
        desc: 'Built the initial MVP with Ollama integration. Supported MySQL with basic natural language queries.',
        icon: <Code2 size={18} />,
        color: '#3b82f6',
    },
    {
        year: '2025',
        title: 'Multi-DB Support',
        desc: 'Added PostgreSQL and SQLite. Implemented schema auto-detection and read-only safety guardrails.',
        icon: <Database size={18} />,
        color: '#10b981',
    },
    {
        year: '2025',
        title: 'Public Launch',
        desc: 'Open-sourced the project. Growing community of users who believe data access should be a right, not a privilege.',
        icon: <Globe size={18} />,
        color: '#a855f7',
    },
];

/* ──────────────────────────────────────────────────
   PAGE COMPONENT
────────────────────────────────────────────────── */
export default function AboutPage() {
    const heroReveal = useScrollReveal();
    const missionReveal = useScrollReveal();
    const valuesReveal = useScrollReveal();
    const statsReveal = useScrollReveal();
    const timelineReveal = useScrollReveal();



    return (
        <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
            {/* ── Global background effects ── */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/3 rounded-full blur-[200px]" />
            </div>

            <Navbar />

            {/* ═══════════════════════════════════════════
                HERO SECTION
            ═══════════════════════════════════════════ */}
            <section
                ref={heroReveal.ref}
                className="relative z-10 pt-20 pb-24"
            >
                {/* Decorative grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className={`max-w-5xl mx-auto px-6 text-center transition-all duration-1000 ${heroReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <Heart size={14} className="text-rose-400 fill-rose-400 animate-pulse" />
                        <span className="text-[12px] font-bold text-blue-300 tracking-wider uppercase">About DB Insights</span>
                    </div>

                    <h1 className="text-[clamp(25px,6vw,30px)] font-black leading-[1.05] tracking-[-0.03em] mb-6">
                        <span className="text-white">Making databases </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-green-500">
                            accessible to everyone
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                        We believe every person in your organization should be able to access and understand their data —
                        without writing a single line of SQL. DB Insights bridges the gap between powerful databases
                        and the people who need answers.
                    </p>

                    {/* Hero image */}
                    <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10 group">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop"
                            alt="Team working on database solutions"
                            className="w-full h-[300px] sm:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-wrap gap-3">
                            {[
                                { icon: <Lock size={12} />, text: 'Your data stays local' },
                                { icon: <Shield size={12} />, text: 'Read-only safety' },
                                { icon: <Globe size={12} />, text: 'Open source' },
                            ].map(tag => (
                                <div
                                    key={tag.text}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a0e1a]/80 backdrop-blur-md border border-white/10 text-[12px] font-semibold text-white"
                                >
                                    <span className="text-emerald-400">{tag.icon}</span>
                                    {tag.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                MISSION SECTION
            ═══════════════════════════════════════════ */}
            <section ref={missionReveal.ref} className="relative z-10 py-24">
                <div className={`max-w-6xl mx-auto px-6 transition-all duration-1000 delay-200 ${missionReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left — Image */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                <img
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                                    alt="Team brainstorming and collaborating"
                                    className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent" />
                            </div>

                            {/* Floating metric card */}
                            <div className="absolute -bottom-5 -right-5 bg-[#0f1628]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl animate-bounce-slow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                                        <TrendingUp size={18} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-white">10x</div>
                                        <div className="text-[11px] text-slate-500 font-medium">Faster Insights</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right — Mission text */}
                        <div className='text-center'>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 bg-blue-500/10 border border-blue-500/20">
                                <Target size={13} className="text-blue-400" />
                                <span className="text-[11px] font-bold text-blue-400 tracking-wider uppercase">Our Mission</span>
                            </div>

                            <h2 className="text-[clamp(24px,4vw,30px)] font-black tracking-tight leading-tight mb-6 text-white">
                                Democratizing{' '}
                                <span className="text-transparent bg-clip-text bg-green-500">
                                    data access
                                </span>
                                {' '}for everyone
                            </h2>

                            <p className="text-base text-slate-400 leading-relaxed mb-6">
                                Most powerful data sits locked behind SQL queries that only a handful of engineers can write.
                                We&apos;re changing that. <strong className="text-white/90">DB Insights lets any user</strong> — marketers,
                                managers, analysts, or founders — ask questions in plain English and get instant, accurate results
                                from their databases.
                            </p>

                            <p className="text-base text-slate-400 leading-relaxed mb-8">
                                No SQL knowledge. No data engineering requests. No waiting. Just connect your database and start
                                asking questions. Our AI understands your schema, writes safe read-only queries, and delivers
                                results with interactive charts alongside plain-English summaries.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {[
                                    'MySQL',
                                    'PostgreSQL',
                                    'SQLite',
                                    'AI-Powered',
                                    'Open Source',
                                ].map(tag => (
                                    <span
                                        key={tag}
                                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[12px] font-semibold text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                VALUES SECTION
            ═══════════════════════════════════════════ */}
            <section ref={valuesReveal.ref} className="relative z-10 py-24">
                <div className={`max-w-7xl mx-auto px-6 transition-all duration-1000 delay-200 ${valuesReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-emerald-500/10 border border-emerald-500/20">
                            <Award size={13} className="text-emerald-400" />
                            <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">Our Values</span>
                        </div>
                        <h2 className="text-[clamp(24px,4vw,30px)] font-black tracking-tight leading-tight mb-4 text-white">
                            Built on principles that{' '}
                            <span className="text-transparent bg-clip-text bg-green-500">
                                matter
                            </span>
                        </h2>
                        <p className="text-base text-slate-500 max-w-md mx-auto">
                            Everything we build is guided by these four core values.
                        </p>
                    </div>

                    {/* Values grid — single row on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map((value, i) => (
                            <div
                                key={value.title}
                                className="glass-card p-6 group relative overflow-hidden hover:-translate-y-2 transition-all duration-300"
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                {/* Glow on hover */}
                                <div
                                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl"
                                    style={{ background: value.glow }}
                                />

                                {/* Top accent line */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
                                    style={{
                                        background: `linear-gradient(90deg, transparent, ${value.glow.replace('0.15', '0.6')}, transparent)`,
                                    }}
                                />

                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl ${value.bg} border ${value.border} flex items-center justify-center mb-4 ${value.color} group-hover:scale-110 transition-transform`}>
                                        {value.icon}
                                    </div>
                                    <h3 className="text-[16px] font-extrabold text-white mb-2">{value.title}</h3>
                                    <p className="text-[13px] text-slate-400 leading-relaxed">{value.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                HOW NORMAL USERS CAN ACCESS DBS
            ═══════════════════════════════════════════ */}
            <section className="relative z-10 py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center justify-center">
                        {/* Left — explanatory text */}
                        <div className='text-center '>
                            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full mb-6 bg-purple-500/10 border border-purple-500/20">
                                <Users size={13} className="text-purple-400" />
                                <span className="text-[11px] font-bold text-purple-400 tracking-wider uppercase">For Everyone</span>
                            </div>

                            <h2 className="text-[clamp(24px,4vw,30px)] font-black tracking-tight leading-tight mb-6 text-white">
                                How{' '}
                                <span className="text-transparent bg-clip-text bg-green-500">
                                    normal users
                                </span>
                                {' '}access databases
                            </h2>

                            <div className="space-y-5">
                                {items.map((item) => (
                                    <div
                                        key={item.step}
                                        className={`flex gap-4 p-5 rounded-2xl bg-white/[0.02] border ${item.borderColor} hover:bg-white/[0.05] transition-all duration-300 group cursor-default`}
                                    >
                                        <div className={`text-2xl font-black ${item.color} shrink-0 w-10 group-hover:scale-110 transition-transform`}>
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-bold text-white mb-1">{item.title}</h4>
                                            <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — Image of a non-technical user */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                <img
                                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop"
                                    alt="Non-technical user querying a database with natural language"
                                    className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/30 to-transparent" />

                                {/* Floating query bubble */}
                                <div className="absolute bottom-8 left-6 right-6 bg-[#0f1628]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                                            <MessageSquare size={14} className="text-purple-400" />
                                        </div>
                                        <span className="text-[12px] font-semibold text-slate-300">Natural Language Query</span>
                                    </div>
                                    <p className="text-[14px] text-white/90 font-medium italic">
                                        &ldquo;Show me the top 5 products by sales this month&rdquo;
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                                        <CheckCircle2 size={12} />
                                        Results returned in 1.2 seconds
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                TIMELINE / OUR JOURNEY SECTION
            ═══════════════════════════════════════════ */}
            <section ref={timelineReveal.ref} className="relative z-10 py-24 overflow-hidden">
                <div className={`max-w-7xl mx-auto px-6 transition-all duration-1000 delay-200 ${timelineReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Header */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-amber-500/10 border border-amber-500/20">
                            <Zap size={13} className="text-amber-400 fill-amber-400" />
                            <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">Our Journey</span>
                        </div>
                        <h2 className="text-[clamp(24px,4vw,30px)] font-black tracking-tight leading-tight mb-4 text-white">
                            From idea to{' '}
                            <span className="text-transparent bg-clip-text bg-green-500">
                                impact
                            </span>
                        </h2>
                        <p className="text-base text-slate-500 max-w-md mx-auto">
                            Every great product starts with a spark. Here&apos;s how we got here.
                        </p>
                    </div>

                    {/* ── Horizontal timeline (desktop) ── */}
                    <div className="hidden md:block relative">
                        {/* Connecting horizontal line */}
                        <div
                            className="absolute top-[38px] left-[12%] right-[12%] h-[2px]"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.3) 15%, rgba(148,163,184,0.3) 85%, transparent 100%)',
                            }}
                        />
                        {/* Animated glow overlay on the line */}
                        <div
                            className="absolute top-[37px] left-[12%] right-[12%] h-[4px] blur-sm opacity-40"
                            style={{
                                background: 'linear-gradient(90deg, #f59e0b, #3b82f6, #10b981, #a855f7)',
                            }}
                        />

                        <div className="grid grid-cols-4 gap-8">
                            {TIMELINE.map((item, i) => (
                                <div
                                    key={i}
                                    className="relative flex flex-col items-center group"
                                    style={{ animationDelay: `${i * 150}ms` }}
                                >
                                    {/* Glowing dot */}
                                    <div className="relative z-10 mb-8">
                                        <div
                                            className="w-[18px] h-[18px] rounded-full border-[3px] flex items-center justify-center transition-transform duration-300 group-hover:scale-150"
                                            style={{
                                                borderColor: item.color,
                                                backgroundColor: `${item.color}30`,
                                                boxShadow: `0 0 16px 4px ${item.color}30`,
                                            }}
                                        >
                                            <div
                                                className="w-[6px] h-[6px] rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                        </div>
                                        {/* Pulse ring on hover */}
                                        <div
                                            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            style={{
                                                boxShadow: `0 0 0 8px ${item.color}15`,
                                            }}
                                        />
                                    </div>

                                    {/* Card */}
                                    <div className="glass-card p-6 w-full hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                                        {/* Top color accent bar */}
                                        <div
                                            className="absolute top-0 left-0 right-0 h-[3px]"
                                            style={{
                                                background: `linear-gradient(90deg, ${item.color}, ${item.color}50)`,
                                            }}
                                        />

                                        {/* Year badge */}
                                        <div
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-4"
                                            style={{
                                                backgroundColor: `${item.color}12`,
                                                color: item.color,
                                                border: `1px solid ${item.color}25`,
                                            }}
                                        >
                                            {item.icon}
                                            {item.year}
                                        </div>

                                        <h3 className="text-[16px] font-extrabold text-white mb-2">{item.title}</h3>
                                        <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>

                                        {/* Hover glow */}
                                        <div
                                            className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
                                            style={{ background: `${item.color}15` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Vertical timeline (mobile) ── */}
                    <div className="md:hidden relative pl-10">
                        {/* Vertical line */}
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent" />

                        <div className="space-y-10">
                            {TIMELINE.map((item, i) => (
                                <div key={i} className="relative">
                                    {/* Dot */}
                                    <div
                                        className="absolute -left-[25px] top-6 w-3 h-3 rounded-full border-2 z-10"
                                        style={{
                                            borderColor: item.color,
                                            backgroundColor: item.color,
                                            boxShadow: `0 0 10px ${item.color}40`,
                                        }}
                                    />

                                    {/* Card */}
                                    <div className="glass-card p-5 relative overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 w-full h-[2px]"
                                            style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                                        />
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                            >
                                                {item.icon}
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-500">{item.year}</span>
                                        </div>
                                        <h3 className="text-[15px] font-extrabold text-white mb-1.5">{item.title}</h3>
                                        <p className="text-[12px] text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* ── FOOTER ── */}
            <Footer />

            {/* ── Inline keyframe for bounce-slow ── */}
            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}