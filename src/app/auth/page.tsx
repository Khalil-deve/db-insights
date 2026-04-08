'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
    Database, Eye, EyeOff, Mail, Lock, User, ArrowRight,
    Chrome, Github, CheckCircle2, Zap,
} from 'lucide-react';

// ─── Feature list shown on the right panel ────────────────────────────────────
const PERKS = [
    'Plain-English SQL — no syntax needed',
    'Local AI for complete data privacy',
    'MySQL, PostgreSQL & SQLite support',
    'Query history & instant CSV export',
];

// ─── Inner component (needs useSearchParams) ──────────────────────────────────
function AuthForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { signUp, signIn } = useAuth();
    
    const [tab, setTab] = useState<'signin' | 'signup'>(
        searchParams.get('tab') === 'signup' ? 'signup' : 'signin',
    );

    const [showPass, setShowPass] = useState(false);
    const [showPass2, setShowPass2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirm: '',
    });

    // Sync tab when URL param changes
    useEffect(() => {
        const p = searchParams.get('tab');
        if (p === 'signup') setTab('signup');
        else setTab('signin');
    }, [searchParams]);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (tab === 'signup') {
                // Validate password match
                if (form.password !== form.confirm) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                
                // Validate password length
                if (form.password.length < 8) {
                    setError('Password must be at least 8 characters');
                    setLoading(false);
                    return;
                }

                await signUp(form.email, form.password, form.name);
                setError(null);
                // Redirect to query interface after successful signup
                router.push('/');
            } else {
                await signIn(form.email, form.password);
                setError(null);
                // Redirect to query interface after successful signin
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a] flex">
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[130px] -top-48 -right-32" />
                <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px] bottom-0 -left-32" />
            </div>

            {/* ── Left: form panel ── */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group w-fit">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <Database size={17} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-[17px] font-extrabold tracking-tight text-white">
                        DB<span className="text-blue-400"> Insights</span>
                    </span>
                </Link>

                {/* Heading */}
                <div className="mb-7">
                    <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                        {tab === 'signin' ? 'Welcome back' : 'Create your account'}
                    </h1>
                    <p className="text-[14px] text-slate-400 mt-1.5">
                        {tab === 'signin'
                            ? 'Sign in to access your DB Insights dashboard.'
                            : 'Get started free — no credit card required.'}
                    </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6 max-w-sm">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[12px] text-slate-600 font-medium">or continue with email</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Error message */}
                {error && (
                    <div className="w-full max-w-sm mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[13px]">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
                    {tab === 'signup' && (
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-400 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={set('name')}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[12px] font-semibold text-slate-400 mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={set('email')}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-slate-400 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder={tab === 'signup' ? 'Min 8 characters' : '••••••••'}
                                value={form.password}
                                onChange={set('password')}
                                required
                                minLength={8}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-[14px] text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(v => !v)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {tab === 'signup' && (
                        <div>
                            <label className="block text-[12px] font-semibold text-slate-400 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showPass2 ? 'text' : 'password'}
                                    placeholder="Repeat password"
                                    value={form.confirm}
                                    onChange={set('confirm')}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 py-3 text-[14px] text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass2(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPass2 ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {tab === 'signin' && (
                        <div className="flex justify-end -mt-2">
                            <Link href="#" className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {tab === 'signin' ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={15} />
                            </>
                        )}
                    </button>

                    {tab === 'signup' && (
                        <p className="text-[11px] text-slate-600 text-center">
                            By signing up, you agree to our{' '}
                            <Link href="#" className="text-blue-500 hover:underline">Terms</Link>
                            {' '}and{' '}
                            <Link href="#" className="text-blue-500 hover:underline">Privacy Policy</Link>.
                        </p>
                    )}
                </form>

                {/* Switch tab link */}
                <p className="mt-6 text-[13px] text-slate-500 max-w-sm">
                    {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
                        className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                    >
                        {tab === 'signin' ? 'Sign up free' : 'Sign in'}
                    </button>
                </p>
            </div>

            {/* ── Right: feature panel (hidden on mobile) ── */}
            <div className="hidden lg:flex relative z-10 flex-1 items-center justify-center bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-l border-white/8">
                <div className="max-w-md px-12">

                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-4">
                        Your database,<br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            your language
                        </span>
                    </h2>

                    <p className="text-[15px] text-slate-400 leading-relaxed mb-8">
                        Stop relying on engineers for every data question. DB Insights lets you ask
                        anything in plain English and get answers instantly.
                    </p>

                    <ul className="space-y-3.5">
                        {PERKS.map(perk => (
                            <li key={perk} className="flex items-center gap-3 text-[14px] text-slate-300">
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                                {perk}
                            </li>
                        ))}
                    </ul>

                    {/* Decorative query box */}
                    <div className="mt-10 rounded-xl bg-black/30 border border-white/8 p-4">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Example query</div>
                        <p className="text-[14px] text-blue-300 font-medium italic">
                            &ldquo;Show me the top 10 customers by revenue this month&rdquo;
                        </p>
                        <div className="mt-2 text-[11px] font-mono text-slate-500">
                            → SELECT customer, SUM(revenue) …
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page (wrap in Suspense for useSearchParams) ──────────────────────────────
export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        }>
            <AuthForm />
        </Suspense>
    );
}
