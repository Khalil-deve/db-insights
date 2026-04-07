'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Github,
    Twitter,
    Linkedin,
    Database,
    MessageSquare,
    Shield,
    BarChart3,
    Sparkles,
    Mail,
    ExternalLink,
    Heart,
} from 'lucide-react';
import logo from '../../public/logo.png';

// ── Link groups ──────────────────────────────────────────────────────────────

const PRODUCT_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Try Demo', href: '/?demo=true' },
];

const COMPANY_LINKS = [
    { label: 'About Us', href: '/about' },
    { label: 'Sign In', href: '/auth' },
    { label: 'Get Started', href: '/auth?tab=signup' },
];

const FEATURE_LINKS = [
    { label: 'Plain-English Queries', icon: <MessageSquare size={13} />, href: '/#features' },
    { label: 'Read-Only Safety', icon: <Shield size={13} />, href: '/#features' },
    { label: 'Instant Visualisations', icon: <BarChart3 size={13} />, href: '/#features' },
    { label: 'Any Database', icon: <Sparkles size={13} />, href: '/#features' },
];

const SOCIAL_LINKS = [
    {
        label: 'GitHub',
        href: 'https://github.com/',
        icon: <Github size={18} />,
        hoverColor: 'hover:text-white hover:bg-white/10',
    },
    {
        label: 'Twitter / X',
        href: 'https://twitter.com/',
        icon: <Twitter size={18} />,
        hoverColor: 'hover:text-sky-400 hover:bg-sky-400/10',
    },
    {
        label: 'LinkedIn',
        href: 'https://linkedin.com/',
        icon: <Linkedin size={18} />,
        hoverColor: 'hover:text-blue-400 hover:bg-blue-400/10',
    },
    {
        label: 'Email',
        href: 'mailto:contact@dbinsights.dev',
        icon: <Mail size={18} />,
        hoverColor: 'hover:text-emerald-400 hover:bg-emerald-400/10',
    },
];

// ────────────────────────────────────────────────────────────────────────────

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative mt-0 border-t border-white/8 bg-[#070b15]">

            {/* ── Subtle top glow ── */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 35%, rgba(139,92,246,0.5) 65%, transparent 100%)',
                }}
            />

            {/* ── Main grid ── */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-10">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

                    {/* ── Brand column ── */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col gap-5">
                        <Link href="/" className="flex items-center gap-2.5 group w-fit">
                            <Image
                                src={logo}
                                alt="DB Insights logo"
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain"
                            />
                            <span className="text-[15px] font-black tracking-tight text-white leading-none">
                                DB<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"> Insights</span>
                            </span>
                        </Link>

                        <p className="text-[13px] leading-relaxed text-slate-500 max-w-[260px]">
                            Ask questions in plain English and get instant database insights —
                            no SQL knowledge required.
                        </p>

                        {/* Social icons */}
                        <div className="flex items-center gap-2 mt-1">
                            {SOCIAL_LINKS.map(s => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl border border-white/8 text-slate-500 transition-all duration-200 ${s.hoverColor}`}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Product column ── */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Product
                        </h3>
                        <ul className="flex flex-col gap-2.5">
                            {PRODUCT_LINKS.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[13px] text-slate-500 hover:text-white transition-colors duration-150 flex items-center gap-1.5 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors duration-150" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Company column ── */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Company
                        </h3>
                        <ul className="flex flex-col gap-2.5">
                            {COMPANY_LINKS.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[13px] text-slate-500 hover:text-white transition-colors duration-150 flex items-center gap-1.5 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-purple-500 transition-colors duration-150" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Features column ── */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Features
                        </h3>
                        <ul className="flex flex-col gap-2.5">
                            {FEATURE_LINKS.map(link => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-[13px] text-slate-500 hover:text-white transition-colors duration-150 flex items-center gap-2 group"
                                    >
                                        <span className="text-slate-600 group-hover:text-blue-400 transition-colors duration-150">
                                            {link.icon}
                                        </span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Divider ── */}
                <div className="mt-14 border-t border-white/6" />

                {/* ── Bottom bar ── */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[12px] text-slate-600 flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                        © {year} DB Insights. Made with
                        <Heart size={11} className="text-rose-500 fill-rose-500" />
                        by{' '}
                        <a
                            href="https://github.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors duration-150 flex items-center gap-0.5"
                        >
                            Muhammad Khalil
                            <ExternalLink size={10} className="ml-0.5 opacity-60" />
                        </a>
                        . All rights reserved.
                    </p>

                    <div className="flex items-center gap-4 text-[12px] text-slate-600">
                        <a
                            href="https://github.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-slate-300 transition-colors duration-150"
                        >
                            <Github size={13} />
                            Source on GitHub
                        </a>
                        <span className="w-px h-3 bg-white/10" />
                        <span className="flex items-center gap-1.5">
                            <Database size={12} className="text-blue-500" />
                            Open Source
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
