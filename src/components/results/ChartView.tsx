'use client';

import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { QueryResult } from '@/types';
import { CHART_COLORS, detectNumericColumns, detectLabelColumn } from './chartUtils';

type ChartType = 'bar' | 'line' | 'pie';

interface ChartViewProps {
    result: QueryResult;
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────
interface TooltipPayloadItem {
    value: number;
}

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card p-3 ring-1 ring-blue-500/30 border-blue-500/20 shadow-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-black text-blue-400 font-mono">
                {payload[0].value > 1000
                    ? payload[0].value.toLocaleString()
                    : payload[0].value}
            </p>
        </div>
    );
}

// ─── Empty state ───────────────────────────────────────────────────────────────
function NoChartData() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <BarChart3 size={40} className="text-slate-700 mb-4 opacity-30" />
            <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">
                No visualisable data
            </div>
            <div className="text-xs text-slate-600 max-w-[240px]">
                This result set doesn't contain numeric columns suitable for charting.
            </div>
        </div>
    );
}

// ─── Axis / grid props shared between Bar and Line charts ─────────────────────
const AXIS_TICK = { fill: '#64748b', fontSize: 10, fontWeight: 600 } as const;
const AXIS_PROPS = { axisLine: false, tickLine: false, tick: AXIS_TICK } as const;

// ─── Main component ────────────────────────────────────────────────────────────
export function ChartView({ result }: ChartViewProps) {
    const numericCols = detectNumericColumns(result);
    const labelCol = detectLabelColumn(result, numericCols);

    const [chartType, setChartType] = useState<ChartType>('bar');
    const [metric, setMetric] = useState(numericCols[0] || '');

    const chartData = useMemo(() =>
        result.rows.slice(0, 20).map((row, i) => ({
            name: labelCol ? String(row[labelCol]).slice(0, 20) : `Row ${i + 1}`,
            value: Number(row[metric]) || 0,
            ...Object.fromEntries(numericCols.map(c => [c, Number(row[c]) || 0])),
        })),
        [result.rows, labelCol, metric, numericCols],
    );

    if (!numericCols.length) return <NoChartData />;

    return (
        <div className="p-4 sm:p-6">
            {/* ── Controls ──────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6 sm:mb-10">
                {/* Chart type switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-black/30 border border-white/5 rounded-xl">
                    {(['bar', 'line', 'pie'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`px-3 sm:px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${chartType === type
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Metric selector (only when multiple numeric cols) */}
                {numericCols.length > 1 && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Metric:</span>
                        <select
                            value={metric}
                            onChange={e => setMetric(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold text-blue-400 outline-none focus:ring-1 ring-blue-500/40"
                        >
                            {numericCols.map(col => (
                                <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* ── Chart canvas ──────────────────────────────────── */}
            <div className="w-full h-[320px]">
                {chartType === 'bar' && (
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="name" {...AXIS_PROPS} angle={-30} textAnchor="end" interval={0} />
                            <YAxis {...AXIS_PROPS} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {chartType === 'line' && (
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="name" {...AXIS_PROPS} angle={-30} textAnchor="end" interval={0} />
                            <YAxis {...AXIS_PROPS} />
                            <Tooltip content={<ChartTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {chartType === 'pie' && (
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                innerRadius={60}
                                paddingAngle={5}
                                stroke="none"
                                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                labelLine={false}
                            >
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                iconType="circle"
                                formatter={value => (
                                    <span className="text-[11px] font-bold text-slate-500 ml-2">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
