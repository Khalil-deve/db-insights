import { NextRequest, NextResponse } from 'next/server';

// ===== Ollama Status & Model Check API =====

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const ollamaUrl = url.searchParams.get('url') || 'http://localhost:11434';

    try {
        const response = await fetch(`${ollamaUrl}/api/tags`, {
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            throw new Error(`Status ${response.status}`);
        }

        const data = await response.json();
        const models = (data.models || []).map((m: { name: string; size: number }) => ({
            name: m.name,
            size: m.size,
        }));

        return NextResponse.json({
            success: true,
            running: true,
            models,
            modelCount: models.length,
        });
    } catch {
        return NextResponse.json({
            success: false,
            running: false,
            models: [],
            error: 'Ollama is not running. Start it with: ollama serve',
        });
    }
}
