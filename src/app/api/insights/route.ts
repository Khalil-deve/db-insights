import { NextRequest, NextResponse } from 'next/server';
import { QueryResult, SchemaInfo } from '@/types';

// ===== LLM Insight Generation API =====
// Supports: Groq, OpenRouter, Gemini
// Credentials are read from .env.local automatically.

type Provider = 'groq' | 'gemini' | 'openrouter';

function resolveProvider(p?: string): Provider {
    return (p || process.env.LLM_PROVIDER || 'groq') as Provider;
}
function resolveApiKey(provider: Provider, clientKey?: string): string {
    if (clientKey) return clientKey;
    const map: Record<Provider, string | undefined> = {
        groq: process.env.GROQ_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
        openrouter: process.env.OPENROUTER_API_KEY,
    };
    return map[provider] || '';
}
function resolveModel(provider: Provider, clientModel?: string): string {
    if (clientModel) return clientModel;
    const map: Record<Provider, string> = {
        groq: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        gemini: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        openrouter: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    };
    return map[provider];
}

function buildInsightPrompt(question: string, result: QueryResult): string {
    const rowSample = result.rows.slice(0, 10);
    const resultSummary = JSON.stringify({ columns: result.columns, rows: rowSample, totalRows: result.rowCount }, null, 2);

    return `You are a data analyst. The user asked: "${question}"

Query returned ${result.rowCount} rows in ${result.executionTimeMs}ms.

Sample data (first ${Math.min(10, result.rowCount)} rows):
${resultSummary}

Provide a concise analysis as JSON (no markdown, no code fences, raw JSON only):
{"summary":"2-3 sentence overview of findings","keyFindings":["finding 1","finding 2","finding 3"],"recommendation":"Optional actionable recommendation or null"}`;
}


async function callOpenAICompatible(prompt: string, apiKey: string, model: string, baseUrl: string): Promise<string> {
    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 512,
        }),
        signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
            }),
            signal: AbortSignal.timeout(30000),
        }
    );
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function generateBasicInsight(question: string, result: QueryResult) {
    const { rowCount, executionTimeMs, columns, rows } = result;
    const findings: string[] = [
        `Query returned ${rowCount.toLocaleString()} ${rowCount === 1 ? 'record' : 'records'}`,
        `Execution completed in ${executionTimeMs}ms`,
    ];

    if (rows.length > 0 && columns.length > 0) {
        const numericCols = columns.filter(col =>
            rows.slice(0, 5).every(row => {
                const val = row[col];
                return typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)));
            })
        );
        if (numericCols.length > 0) {
            const col = numericCols[0];
            const values = rows.map(r => Number(r[col])).filter(n => !isNaN(n));
            if (values.length > 0) {
                const max = Math.max(...values);
                const min = Math.min(...values);
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                findings.push(`"${col}": max=${max.toLocaleString()}, min=${min.toLocaleString()}, avg=${avg.toFixed(2)}`);
            }
        }
    }

    return {
        summary: `The query for "${question}" completed successfully, returning ${rowCount} result${rowCount !== 1 ? 's' : ''} in ${executionTimeMs}ms.`,
        keyFindings: findings,
        recommendation: rowCount === 0 ? 'No data found. Consider adjusting your filters or date ranges.' : undefined,
    };
}

export async function POST(req: NextRequest) {
    let bodyCache: { question?: string; result?: QueryResult; schema?: SchemaInfo; ollamaUrl?: string; model?: string; provider?: string; apiKey?: string } | null = null;

    try {
        const body = await req.json() as {
            question: string;
            result: QueryResult;
            schema?: SchemaInfo;
            ollamaUrl?: string;
            model?: string;
            provider?: 'ollama' | 'groq' | 'openai' | 'gemini' | 'openrouter';
            apiKey?: string;
        };
        bodyCache = body;

        const { question, result, ollamaUrl, model, provider, apiKey } = body;

        if (!result) return NextResponse.json({ error: 'Result data is required' }, { status: 400 });

        const prompt = buildInsightPrompt(question, result);
        const activeProvider = resolveProvider(provider);
        const resolvedKey = resolveApiKey(activeProvider, apiKey);
        const resolvedModel = resolveModel(activeProvider, model);

        let rawText = '';

        switch (activeProvider) {
            case 'groq':
                rawText = await callOpenAICompatible(prompt, resolvedKey, resolvedModel, 'https://api.groq.com/openai/v1');
                break;
            case 'openrouter':
                rawText = await callOpenAICompatible(prompt, resolvedKey, resolvedModel, 'https://openrouter.ai/api/v1');
                break;
            case 'gemini':
                rawText = await callGemini(prompt, resolvedKey, resolvedModel);
                break;
        }

        // Parse JSON from response
        const fenceMatch = rawText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
        const cleanText = fenceMatch ? fenceMatch[1] : rawText;
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const insight = JSON.parse(jsonMatch[0]);
            return NextResponse.json({ success: true, insight });
        }

        // Fallback to basic insight
        return NextResponse.json({ success: true, insight: generateBasicInsight(question, result) });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Insight API Error]', message);

        // Always return basic insight on failure
        if (bodyCache?.result) {
            return NextResponse.json({
                success: true,
                insight: generateBasicInsight(bodyCache.question || '', bodyCache.result),
            });
        }
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
