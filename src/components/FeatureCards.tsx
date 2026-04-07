'use client';

import Image from 'next/image';
import { MessageSquare, Shield, BarChart3, Sparkles, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: <MessageSquare size={22} />,
    title: 'Plain-English Queries',
    desc: 'Ask anything in natural language — "Show top customers by revenue" — the AI writes perfect SQL for you every time. No SQL knowledge needed.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    badge: 'AI-Powered',
    dotColor: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.25)',
    gradientFrom: '#3b82f6',
    gradientTo: '#06b6d4',
    image: '/query2.png',
    imageAlt: 'Natural language to SQL query generation',
  },
  {
    icon: <Shield size={22} />,
    title: 'Safe by Design',
    desc: 'Only SELECT queries are allowed. DELETE, DROP, UPDATE, and all mutations are blocked before they ever reach your database — automatically.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    badge: 'Read-Only',
    dotColor: '#10b981',
    glowColor: 'rgba(16,185,129,0.25)',
    gradientFrom: '#10b981',
    gradientTo: '#34d399',
    image: '/safety.png',
    imageAlt: 'SQL query safety and validation',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Instant Visualisations',
    desc: 'Results render as interactive tables, bar charts, or raw JSON. AI generates a plain-English summary with key findings and recommendations.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    badge: 'Charts + CSV',
    dotColor: '#a855f7',
    glowColor: 'rgba(168,85,247,0.25)',
    gradientFrom: '#a855f7',
    gradientTo: '#c084fc',
    image: '/visualization.png',
    imageAlt: 'Data visualization and charts',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Any Database',
    desc: 'Connect MySQL, PostgreSQL, or SQLite — local or remote. Schema is auto-detected so the AI always understands your exact table structure.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badge: 'Universal',
    dotColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.25)',
    gradientFrom: '#f59e0b',
    gradientTo: '#fbbf24',
    image: '/db-connection.png',
    imageAlt: 'Database connection setup',
  },
];

export function FeatureCards() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 relative">

      {/* ── Section header ── */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-5 bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400 uppercase tracking-widest">
          <Zap size={12} className="fill-current" />
          Everything you need
        </div>
        <h2 className="text-[clamp(26px,4vw,40px)] font-black tracking-tight leading-tight mb-4">
          Built for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
            speed &amp; simplicity
          </span>
        </h2>
        <p className="text-base text-slate-400 leading-relaxed max-w-md mx-auto">
          Every feature is designed to get you from question to insight as fast as possible.
        </p>
      </div>

       <div className="flex flex-col gap-20">

      {FEATURES.map((feature, index) => {
        const isReverse = index % 2 !== 0; // alternate layout

        return (
          <div
            key={feature.title}
            className={`flex flex-col md:flex-row items-center gap-16 ${
              isReverse ? 'md:flex-row-reverse' : ''
            }`}
          >

            {/* CONTENT */}
            <div className="flex-1 max-w-xl">
              <div className="adaptive-card p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">

                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${feature.bg} ${feature.border} border flex items-center justify-center ${feature.color}`}
                  >
                    {feature.icon}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${feature.bg} ${feature.border} border ${feature.color}`}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold mb-3">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>

            {/* IMAGE */}
            <div className="flex-1 flex justify-center ">
              <Image
                src={feature.image}
                alt={feature.imageAlt}
                width={500}
                height={400}
                className="w-full max-w-md h-auto object-contain rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
              />
            </div>

          </div>
        );
      })}

    </div>
    </section>
  );
}
