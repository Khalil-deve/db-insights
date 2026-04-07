'use client';

import { Database, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ConnectNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`sticky top-0 z-[100] flex items-center justify-between px-8 transition-all duration-300 ${scrolled
                    ? 'py-3 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/10 shadow-lg'
                    : 'py-5 bg-transparent border-b border-transparent'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Database size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-white">
                    DB Insights
                </span>
            </div>

            {/* Badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 shadow-sm shadow-blue-500/5">
                <Zap size={12} className="fill-current" />
                AI-Powered
            </div>
        </nav>
    );
}
