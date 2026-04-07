import { NextRequest, NextResponse } from 'next/server';
import { SchemaInfo, GeneratedQuery } from '@/types';

// ===== LLM Query Generation API =====
// Supports: Groq, OpenAI, or any OpenAI-compatible API

function buildSchemaPrompt(schema: SchemaInfo): string {
    const lines: string[] = [];
    lines.push(`Database type: ${schema.databaseType.toUpperCase()}`);
    lines.push(`Database name: ${schema.databaseName}`);
    lines.push('');
    lines.push('Schema:');

    for (const table of schema.tables) {
        const cols = table.columns.map(c => {
            let desc = `${c.name} ${c.type}`;
            if (c.isPrimaryKey) desc += ' PK';
            if (c.isForeignKey && c.references) desc += ` FK→${c.references.table}.${c.references.column}`;
            if (!c.nullable) desc += ' NOT NULL';
            return desc;
        }).join(', ');
        lines.push(`  ${table.name}(${cols})`);
        if (table.rowCount !== undefined) lines.push(`    -- ~${table.rowCount.toLocaleString()} rows`);
    }

    return lines.join('\n');
}

function buildSystemPrompt(schema: SchemaInfo): string {
    return `You are an expert ${schema.databaseType.toUpperCase()} query generator. Convert plain English questions into precise, efficient, and SAFE SQL queries.

RULES:
1. Generate ONLY SELECT queries. NEVER generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, or CREATE.
2. Always LIMIT results to max 1000 rows unless the user specifies otherwise.
3. Use proper JOINs based on foreign key relationships shown in the schema.
4. Use appropriate date/time functions for the target database type.
5. Format the SQL cleanly with uppercase keywords and proper indentation.
6. Return ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):

{"sql":"SELECT ...","explanation":"Brief explanation of what the query does","confidence":0.95}

IMPORTANT: Return ONLY the JSON object. Nothing before or after it.`;
}

function buildUserPrompt(question: string, schema: SchemaInfo): string {
    return `${buildSchemaPrompt(schema)}

User question: "${question}"

Generate the SQL query as JSON:`;
}

function extractJSON(text: string): string {
    // Strip markdown code fences if present
    const fenceMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (fenceMatch) return fenceMatch[1].trim();
    // Find raw JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return jsonMatch[0];
    return text.trim();
}

// ─── Env-var resolution ──────────────────────────────────────────────────────
// Reads from .env.local so the user only needs to edit that file.
type Provider = 'groq' | 'gemini' | 'openrouter';

function resolveProvider(clientProvider?: string): Provider {
    return (clientProvider || process.env.LLM_PROVIDER || 'groq') as Provider;
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

// ─── Provider: OpenAI-compatible (Groq, OpenAI, Together, etc.) ─────────────
async function callOpenAICompatible(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
    model: string,
    baseUrl: string,
): Promise<string> {
    const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            max_tokens: 1024,
        }),
        signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error ${res.status}: ${errText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

// ─── Provider: Google Gemini ────────────────────────────────────────────────
async function callGemini(systemPrompt: string, userPrompt: string, apiKey: string, model: string): Promise<string> {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
            }),
            signal: AbortSignal.timeout(60000),
        }
    );

    if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ─── Main Route Handler ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const { question, schema, model, provider, apiKey } = await req.json() as {
            question: string;
            schema: SchemaInfo;
            model?: string;
            provider?: Provider;
            apiKey?: string;
        };

        if (!question || !schema) {
            return NextResponse.json({ error: 'Question and schema are required' }, { status: 400 });
        }

        // Resolve from: client args → .env.local → built-in defaults
        const activeProvider = resolveProvider(provider);
        const resolvedKey = resolveApiKey(activeProvider, apiKey);
        const resolvedModel = resolveModel(activeProvider, model);

        const systemPrompt = buildSystemPrompt(schema);
        const userPrompt = buildUserPrompt(question, schema);

        let rawResponse = '';

        switch (activeProvider) {
            case 'groq':
                if (!resolvedKey) throw new Error('Groq API key missing. Add GROQ_API_KEY to .env.local.');
                rawResponse = await callOpenAICompatible(systemPrompt, userPrompt, resolvedKey, resolvedModel, 'https://api.groq.com/openai/v1');
                break;
            case 'openrouter':
                if (!resolvedKey) throw new Error('OpenRouter API key missing. Add OPENROUTER_API_KEY to .env.local.');
                rawResponse = await callOpenAICompatible(systemPrompt, userPrompt, resolvedKey, resolvedModel, 'https://openrouter.ai/api/v1');
                break;
            case 'gemini':
                if (!resolvedKey) throw new Error('Gemini API key missing. Add GEMINI_API_KEY to .env.local.');
                rawResponse = await callGemini(systemPrompt, userPrompt, resolvedKey, resolvedModel);
                break;
            default:
                throw new Error(`Unknown provider: ${activeProvider}`);
        }

        // Parse JSON from LLM response
        let parsed: GeneratedQuery;
        try {
            const jsonStr = extractJSON(rawResponse);
            parsed = JSON.parse(jsonStr);
            if (!parsed.sql) throw new Error('No SQL in response');
        } catch {
            // Fallback: try to extract raw SQL from text
            const sqlMatch = rawResponse.match(/```sql\n?([\s\S]*?)\n?```/) ||
                rawResponse.match(/SELECT[\s\S]*/i);
            if (sqlMatch) {
                parsed = {
                    sql: (sqlMatch[1] || sqlMatch[0]).trim(),
                    explanation: 'Query generated from your question.',
                    confidence: 0.7,
                };
            } else {
                throw new Error('Could not parse SQL from AI response. Try rephrasing your question.');
            }
        }

        // Normalize the SQL
        parsed.sql = parsed.sql.trim().replace(/;+$/, '') + ';';

        return NextResponse.json({ success: true, query: parsed });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Generate API Error]', message);

        const isConnectionError = message.includes('fetch failed') ||
            message.includes('ECONNREFUSED') ||
            message.includes('connect');

        if (isConnectionError) {
            return NextResponse.json(
                // SHOULD BE:
{ success: false, error: 'Could not connect to the AI provider. Check your API key or network connection.' },
                { status: 503 }
            );
        }

        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
