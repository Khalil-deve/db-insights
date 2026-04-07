'use client';

import { useState, useCallback } from 'react';
import { DatabaseConfig, SchemaInfo, HistoryEntry } from '@/types';

// ── Page-level components ──────────────────────
import { Navbar } from '@/components/Navbar';
import { ConnectHero } from '@/components/ConnectHero';
import { DbConnect } from '@/components/DbConnect';
import { HowItWorks } from '@/components/HowItWorks';
import { FeatureCards } from '@/components/FeatureCards';
import { Footer } from '@/components/Footer';

// ── Query-screen components ────────────────────
import { QuerySidebar } from '@/components/QuerySidebar';
import { QueryTopBar } from '@/components/QueryTopBar';
import { QueryInterface } from '@/components/QueryInterface';
import { ArrowRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────
type AppScreen = 'connect' | 'query';
type SidePanel = 'schema' | 'history';
// ─────────────────────────────────────────────────────────

export default function HomePage() {
  /* ── State ─────────────────────────────────── */
  const [screen, setScreen] = useState<AppScreen>('connect');
  const [schema, setSchema] = useState<SchemaInfo | null>(null);
  const [dbConfig, setDbConfig] = useState<DatabaseConfig | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [sidePanel, setSidePanel] = useState<SidePanel>('schema');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  /* ── Handlers ──────────────────────────────── */
  const handleConnect = (config: DatabaseConfig, schemaData: unknown) => {
    setDbConfig(config);
    setSchema(schemaData as SchemaInfo);
    setIsDemo(false);
    setScreen('query');
  };

  const handleDemoMode = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch('/api/demo');
      const data = await res.json();
      if (data.success) {
        setSchema(data.schema);
        setDbConfig(null);
        setIsDemo(true);
        setScreen('query');
      }
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSaveHistory = useCallback((entry: {
    question: string; query: string; rowCount: number; success: boolean;
  }) => {
    setHistory(prev => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      ...entry,
    }, ...prev.slice(0, 49)]);
  }, []);

  const handleBack = () => {
    setScreen('connect');
    setSchema(null);
    setDbConfig(null);
  };

  /* ════════════════════════════════════════════
     CONNECT SCREEN
  ════════════════════════════════════════════ */
  if (screen === 'connect') {
    return (
      <div className="min-h-screen relative overflow-hidden">


        {/* Navbar */}
        <Navbar />

        {/* Two-column hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT — hero copy + demo CTA */}
            <ConnectHero demoLoading={demoLoading} onDemoMode={handleDemoMode} />

            {/* RIGHT — DB connection form */}
            <div className="pb-12">
              <div className="text-[11px] text-slate-500 font-bold tracking-[0.15em] uppercase mb-5 flex items-center gap-2">
                <ArrowRight size={14} className="text-blue-500" />
                Or connect your own database
              </div>
              <DbConnect onConnect={handleConnect} onDemoMode={handleDemoMode} />
            </div>
          </div>
        </div>

        {/* ③ How it Works & Features (Light Zone) */}
        <div className="relative z-10 mt-12 bg-dark-400 ">
          <div className="border-t border-slate-100">
            <HowItWorks />
          </div>
          <div className="border-t border-slate-100">
            <FeatureCards />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  /* ════════════════════════════════════════════
     QUERY SCREEN
  ════════════════════════════════════════════ */
  return (
    <div className="flex min-h-screen relative z-10">

      {/* ① Collapsible sidebar */}
      <QuerySidebar
        isOpen={sidebarOpen}
        schema={schema}
        isDemo={isDemo}
        sidePanel={sidePanel}
        history={history}
        onPanelChange={setSidePanel}
        onBack={handleBack}
        onClose={() => setSidebarOpen(false)}
        onHistorySelect={entry => setCurrentQuestion(entry.question)}
        onHistoryClear={() => setHistory([])}
        onSampleQuestion={setCurrentQuestion}
      />

      {/* ② Main content area */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'sm:ml-[280px]' : 'sm:ml-0'
        }`}>
        {/* ③ Sticky top bar + help overlay */}
        <QueryTopBar
          schema={schema}
          isDemo={isDemo}
          sidebarOpen={sidebarOpen}
          showHelp={showHelp}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          onToggleHelp={() => setShowHelp(h => !h)}
        />

        {/* ④ Query interface */}
        <div className="flex-1 px-4 sm:px-8 py-6 max-w-4xl w-full mx-auto pb-24 sm:pb-6">
          {schema && (
            <QueryInterface
              schema={schema}
              config={dbConfig}
              isDemo={isDemo}
              ollamaUrl=""
              model=""
              provider="groq"
              apiKey=""
              onSaveHistory={handleSaveHistory}
              initialQuestion={currentQuestion}
              key={`${isDemo}-${schema.databaseName}-${currentQuestion}`}
            />
          )}
        </div>
      </main>
    </div>
  );
}
