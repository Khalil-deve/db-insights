'use client';

import { Database, Menu, X, Zap, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/logo.png';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'About', href: '/about' },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            setMenuOpen(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    return (
        <>
            <nav
                className={`sticky top-0 z-[100] w-full transition-all duration-300 ${scrolled || menuOpen
                    ? 'bg-dark-900 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/20'
                    : 'bg-transparent border-b border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">

                    {/* ── Brand ── */}
                    <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 group shrink-0"
                    >
                        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/10 bg-[#050810] flex items-center justify-center p-1.5 shadow-inner transition-transform group-hover:scale-105">
                            <Image
                                src={logo}
                                alt="logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-contain transition-all duration-300 group-hover:brightness-125"
                            />
                        </div>
                        <span className="text-[17px] font-black tracking-tight text-white leading-none">
                            DB<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"> Insights</span>
                        </span>
                    </Link>

                    {/* ── Desktop nav links ── */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-2 rounded-lg text-[14px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* ── Desktop CTA buttons ── */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                
                                    <span className="px-4 py-2 rounded-lg text-[14px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200">
                                    {user.user_metadata?.full_name || user.email}
                                </span>
                                
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all duration-200"
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-300 hover:text-white hover:bg-white/8 border border-white/10 hover:border-white/20 transition-all duration-200"
                                >
                                    <LogIn size={14} />
                                    Sign In
                                </Link>

                                <Link
                                    href="/auth?tab=signup"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/20 transition-all duration-200 active:scale-[0.97]"
                                >
                                    <UserPlus size={14} />
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ── Mobile hamburger ── */}
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-90"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>

            {/* ── Mobile slide-down menu ── */}
            <div
                className={`md:hidden fixed inset-0 top-16 z-[99] transition-all duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMenuOpen(false)}
                />

                {/* Drawer panel */}
                <div
                    className={`absolute top-0 left-0 right-0 bg-[#0a0e1a]/98 border-b border-white/10 shadow-2xl transition-transform duration-300 ${menuOpen ? 'translate-y-0' : '-translate-y-4'
                        }`}
                >
                    <div className="px-5 py-4 flex flex-col gap-1">
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center px-4 py-3 rounded-xl text-[15px] font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="my-2 border-t border-white/8" />

                        {/* Auth buttons stacked */}
                        {user ? (
                            <>
                                <div className="px-4 py-2 text-[13px] text-slate-400">
                                    {user.user_metadata?.full_name || user.email}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
                                >
                                    <LogOut size={15} />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    <LogIn size={15} />
                                    Sign In
                                </Link>

                                <Link
                                    href="/auth?tab=signup"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                                >
                                    <UserPlus size={15} />
                                    Get Started Free
                                </Link>
                            </>
                        )}
                    </div>
                    </div>
                </div>
        </>
    );
}
