"use client";

import { useMemo } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   1. STATS CARD WITH SPARKLINE
   ═══════════════════════════════════════════════════════════════ */

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: { value: number; label: string };
    sparklineData?: number[];
    color?: string;
    icon?: React.ReactNode;
}

export function StatsCardWithSparkline({
    title, value, subtitle, trend, sparklineData = [], color = "#3b82f6", icon,
}: StatsCardProps) {
    const chartData = useMemo(
        () => sparklineData.map((v, i) => ({ i, v })),
        [sparklineData]
    );

    return (
        <div className="bg-card rounded-xl border py-5 px-5 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: trend.value < 0 ? "rotate(180deg)" : "none" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                {trend.value >= 0 ? "+" : ""}{trend.value}%
                            </span>
                            <span className="text-xs text-muted-foreground">{trend.label}</span>
                        </div>
                    )}
                    {subtitle && !trend && (
                        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2">
                    {icon && (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                            <span style={{ color }}>{icon}</span>
                        </div>
                    )}
                    {chartData.length > 1 && (
                        <div className="w-24 h-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                                    <defs>
                                        <linearGradient id={`sp-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="v"
                                        stroke={color}
                                        strokeWidth={1.5}
                                        fill={`url(#sp-${color.replace("#", "")})`}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   2. OVERVIEW AREA CHART
   ═══════════════════════════════════════════════════════════════ */

interface OverviewChartProps {
    data: { name: string; value: number }[];
    title: string;
    subtitle?: string;
    color?: string;
    tabs?: { label: string; key: string }[];
    activeTab?: string;
    onTabChange?: (key: string) => void;
}

export function OverviewAreaChart({
    data, title, subtitle, color = "#3b82f6", tabs, activeTab, onTabChange,
}: OverviewChartProps) {
    return (
        <div className="bg-card rounded-xl border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div>
                    <h3 className="text-lg font-bold">{title}</h3>
                    {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
                </div>
                {tabs && (
                    <div className="flex bg-muted rounded-lg p-1 gap-0.5 self-start">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange?.(tab.key)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === tab.key
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                        <defs>
                            <linearGradient id="overview-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            className="fill-muted-foreground"
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            className="fill-muted-foreground"
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: "12px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                            itemStyle={{ color: "hsl(var(--muted-foreground))" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2.5}
                            fill="url(#overview-fill)"
                            dot={false}
                            activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   3. DONUT / PIE CHART
   ═══════════════════════════════════════════════════════════════ */

interface DonutChartProps {
    data: { name: string; value: number; color: string }[];
    title: string;
    subtitle?: string;
    centerLabel?: string;
    centerValue?: string | number;
}

export function StatusDonutChart({
    data, title, subtitle, centerLabel, centerValue,
}: DonutChartProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="bg-card rounded-xl border p-6">
            <div className="mb-4">
                <h3 className="text-lg font-bold">{title}</h3>
                {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex flex-col items-center">
                <div className="relative w-44 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                                isAnimationActive={true}
                                animationDuration={600}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold">{centerValue ?? total}</span>
                        <span className="text-xs text-muted-foreground">{centerLabel ?? "Total"}</span>
                    </div>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 w-full max-w-[260px]">
                    {data.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-muted-foreground flex-1 truncate">{entry.name}</span>
                            <span className="text-xs font-semibold">
                                {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   4. GOAL / PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */

interface GoalProps {
    label: string;
    current: number;
    target: number;
    color?: string;
}

export function GoalProgressBar({ label, current, target, color = "#3b82f6" }: GoalProps) {
    const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

    return (
        <div className="mb-5 last:mb-0">
            <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-semibold">{label}</p>
                <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] text-muted-foreground">{current.toLocaleString()}</span>
                <span className="text-[11px] text-muted-foreground">Target: {target.toLocaleString()}</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   5. MONTHLY GOALS CARD
   ═══════════════════════════════════════════════════════════════ */

interface MonthlyGoalsProps {
    title: string;
    subtitle?: string;
    goals: GoalProps[];
}

export function MonthlyGoalsCard({ title, subtitle, goals }: MonthlyGoalsProps) {
    return (
        <div className="bg-card rounded-xl border p-6">
            <div className="mb-5">
                <h3 className="text-lg font-bold">{title}</h3>
                {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {goals.map((goal, i) => (
                <GoalProgressBar key={i} {...goal} />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   6. HELPER: Build monthly histogram from date records
   ═══════════════════════════════════════════════════════════════ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function buildMonthlyData(dates: string[], year?: number): { name: string; value: number }[] {
    const y = year ?? new Date().getFullYear();
    const counts = Array(12).fill(0);
    for (const d of dates) {
        const dt = new Date(d);
        if (dt.getFullYear() === y) counts[dt.getMonth()]++;
    }
    return MONTHS.map((m, i) => ({ name: m, value: counts[i] }));
}

/** Build last N days sparkline from dates */
export function buildDailySparkline(dates: string[], days = 14): number[] {
    const now = new Date();
    const counts = Array(days).fill(0);
    for (const d of dates) {
        const dt = new Date(d);
        const diff = Math.floor((now.getTime() - dt.getTime()) / 86400000);
        if (diff >= 0 && diff < days) counts[days - 1 - diff]++;
    }
    return counts;
}
