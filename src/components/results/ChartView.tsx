'use client';

import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { QueryResult } from '@/types';
import { useEffect } from 'react';
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
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <BarChart3 size={36} className="text-slate-700 mb-3 opacity-30" />
            <div className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-widest">
                No visualisable data
            </div>
            <div className="text-xs text-slate-600 max-w-[240px]">
                This result set doesn&apos;t contain numeric columns suitable for charting.
            </div>
        </div>
    );
}

// ─── Axis / grid props shared between Bar and Line charts ─────────────────────
const AXIS_TICK = { fill: '#64748b', fontSize: 10, fontWeight: 600 } as const;
const AXIS_PROPS = { axisLine: false, tickLine: false, tick: AXIS_TICK } as const;

// ─── Main component ────────────────────────────────────────────────────────────
export function ChartView({ result }: ChartViewProps) {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
        // Force a resize event to ensure Recharts calculates dimensions correctly
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const numericCols = useMemo(() => detectNumericColumns(result), [result]);
    const labelCol = useMemo(() => detectLabelColumn(result, numericCols), [result, numericCols]);

    const [chartType, setChartType] = useState<ChartType>('bar');
    const [metric, setMetric] = useState('');

    // Sync metric when numeric columns change
    useEffect(() => {
        if (numericCols.length > 0 && (!metric || !numericCols.includes(metric))) {
            setMetric(numericCols[0]);
        }
    }, [numericCols, metric]);

    const chartData = useMemo(() => {
        if (!metric && numericCols.length > 0) return [];
        
        return result.rows.slice(0, 20).map((row, i) => {
            const rawLabel = labelCol ? row[labelCol] : null;
            const name = rawLabel !== null && rawLabel !== undefined 
                ? String(rawLabel).slice(0, 15) 
                : `Row ${i + 1}`;
            
            const cleanNumber = (val: any) => {
                if (val === null || val === undefined) return 0;
                const clean = String(val).replace(/[$,%\s]/g, '');
                const num = Number(clean);
                return isNaN(num) ? 0 : num;
            };
                
            return {
                name,
                value: cleanNumber(row[metric]),
                // Include other numeric columns for potential tooltips or stacking
                ...Object.fromEntries(numericCols.map(c => [c, cleanNumber(row[c])])),
            };
        });
    }, [result.rows, labelCol, metric, numericCols]);

    if (!isMounted) return <div className="h-[260px] w-full animate-pulse bg-white/5 rounded-2xl" />;
    if (!numericCols.length) return <NoChartData />;
    if (!metric) return <div className="p-10 text-center opacity-50">Initializing visualizer...</div>;

    return (
        <div className="p-3 sm:p-6 w-full overflow-hidden">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
                {/* Chart type switcher */}
                <div className="flex items-center gap-1 p-1 bg-black/30 border border-white/5 rounded-xl">
                    {(['bar', 'line', 'pie'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setChartType(type)}
                            className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all ${
                                chartType === type
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Metric selector */}
                {numericCols.length > 1 && (
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest shrink-0">Metric:</span>
                        <select
                            value={metric}
                            onChange={e => setMetric(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold text-blue-400 outline-none focus:ring-1 ring-blue-500/40 max-w-[150px] truncate"
                        >
                            {numericCols.map(col => (
                                <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Chart canvas — fixed height, ResponsiveContainer handles width */}
            <div className="w-full min-w-0" style={{ height: '300px' }}>
                {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="name" {...AXIS_PROPS} angle={-30} textAnchor="end" interval={0} />
                            <YAxis {...AXIS_PROPS} width={50} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{value}</span>} />
                            <Bar dataKey="value" name={metric} radius={[4, 4, 0, 0]} barSize={24}>
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {chartType === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="name" {...AXIS_PROPS} angle={-30} textAnchor="end" interval={0} />
                            <YAxis {...AXIS_PROPS} width={50} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{value}</span>} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                name={metric}
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {chartType === 'pie' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={40}
                                paddingAngle={4}
                                stroke="none"
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
                                    <span className="text-[10px] font-bold text-slate-500 ml-1">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
