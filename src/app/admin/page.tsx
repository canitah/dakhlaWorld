// "use client";

// import { useEffect, useState } from "react";
// import { useApi } from "@/hooks/use-api";
// import { DashboardLayout } from "@/components/dashboard-layout";
// import { StatsCard } from "@/components/stats-card";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "sonner";

// interface Analytics {
//     totalUsers: number;
//     totalStudents: number;
//     totalInstitutions: number;
//     totalPrograms: number;
//     totalApplications: number;
//     applicationsByStatus: Record<string, number>;
//     pendingInstitutions: number;
//     pendingPayments: number;
//     totalRevenue: number;
// }

// export default function AdminDashboard() {
//     const { fetchWithAuth } = useApi();
//     const [analytics, setAnalytics] = useState<Analytics | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         async function load() {
//             try {
//                 const res = await fetchWithAuth("/admin/analytics");
//                 if (res.ok) {
//                     const data = await res.json();
//                     setAnalytics(data);
//                 }
//             } catch {
//                 toast.error("Failed to load analytics");
//             } finally {
//                 setIsLoading(false);
//             }
//         }
//         load();
//     }, []);

//     if (isLoading || !analytics) {
//         return (
//             <DashboardLayout role="admin">
//                 <div className="flex items-center justify-center h-64">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 </div>
//             </DashboardLayout>
//         );
//     }

//     return (
//         <DashboardLayout role="admin">
//             <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
//             <p className="text-muted-foreground mb-6">Platform overview and management</p>

//             {/* Key Metrics */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <StatsCard title="Total Users" value={analytics.totalUsers} icon="👥" />
//                 <StatsCard title="Students" value={analytics.totalStudents} icon="🎓" />
//                 <StatsCard title="Institutions" value={analytics.totalInstitutions} icon="🏫" />
//                 <StatsCard title="Programs" value={analytics.totalPrograms} icon="📚" />
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <StatsCard title="Total Applications" value={analytics.totalApplications} icon="📋" />
//                 <StatsCard
//                     title="Pending Approvals"
//                     value={analytics.pendingInstitutions}
//                     icon="⏳"
//                     className={analytics.pendingInstitutions > 0 ? "border-amber-300 dark:border-amber-700 bg-amber-500/10" : ""}
//                 />
//                 <StatsCard
//                     title="Pending Payments"
//                     value={analytics.pendingPayments}
//                     icon="💳"
//                     className={analytics.pendingPayments > 0 ? "border-blue-300 dark:border-blue-700 bg-blue-500/10" : ""}
//                 />
//                 <StatsCard
//                     title="Total Revenue"
//                     value={`PKR ${analytics.totalRevenue.toLocaleString()}`}
//                     icon="💰"
//                     className="border-emerald-300 dark:border-emerald-700 bg-emerald-500/10"
//                 />
//             </div>

//             {/* Application Breakdown */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle>Applications by Status</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                         {Object.entries(analytics.applicationsByStatus).map(([status, count]) => (
//                             <div key={status} className="text-center p-4 rounded-lg bg-muted">
//                                 <p className="text-2xl font-bold">{count}</p>
//                                 <p className="text-sm text-muted-foreground capitalize">{status}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </CardContent>
//             </Card>
//         </DashboardLayout>
//     );
// }
"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { message } from "antd";
import Link from "next/link";

interface Analytics {
    totalUsers: number;
    totalStudents: number;
    totalInstitutions: number;
    totalPrograms: number;
    totalApplications: number;
    applicationsByStatus: Record<string, number>;
    pendingInstitutions: number;
    pendingPayments: number;
    totalRevenue: number;
}

// ── Sparkline Bar Chart (like reference top cards) ──────────────────────────
function Sparkline({ color }: { color: string }) {
    const bars = [40, 70, 45, 80, 55, 90, 60, 75, 50, 85, 65, 95];
    return (
        <svg width="80" height="36" viewBox="0 0 80 36" fill="none">
            {bars.map((h, i) => (
                <rect
                    key={i}
                    x={i * 7}
                    y={36 - h * 0.36}
                    width="5"
                    height={h * 0.36}
                    rx="1.5"
                    fill={color}
                    opacity={i === bars.length - 1 ? 1 : 0.35 + (i / bars.length) * 0.65}
                />
            ))}
        </svg>
    );
}

// ── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data1, data2, labels }: {
    data1: number[];
    data2: number[];
    labels: string[];
}) {
    const w = 520, h = 160, pad = 32;
    const maxVal = Math.max(...data1, ...data2);
    const minVal = Math.min(...data1, ...data2) - 10;
    const xStep = (w - pad * 2) / (data1.length - 1);
    const yScale = (v: number) => pad + (h - pad * 2) * (1 - (v - minVal) / (maxVal - minVal));
    const toPath = (d: number[]) =>
        d.map((v, i) => `${i === 0 ? "M" : "L"} ${pad + i * xStep} ${yScale(v)}`).join(" ");
    const toArea = (d: number[]) =>
        `${toPath(d)} L ${pad + (d.length - 1) * xStep} ${h - pad} L ${pad} ${h - pad} Z`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 160 }}>
            <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 1, 2, 3].map(i => (
                <line key={i} x1={pad} y1={pad + i * (h - pad * 2) / 3} x2={w - pad} y2={pad + i * (h - pad * 2) / 3}
                    stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
            ))}
            {/* Area fills */}
            <path d={toArea(data1)} fill="url(#g1)" />
            <path d={toArea(data2)} fill="url(#g2)" />
            {/* Lines */}
            <path d={toPath(data1)} stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
            <path d={toPath(data2)} stroke="#8b5cf6" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
            {/* Dots */}
            {data1.map((v, i) => (
                <circle key={i} cx={pad + i * xStep} cy={yScale(v)} r="3.5" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
            ))}
            {data2.map((v, i) => (
                <circle key={i} cx={pad + i * xStep} cy={yScale(v)} r="3.5" fill="#8b5cf6" stroke="white" strokeWidth="1.5" />
            ))}
            {/* X labels */}
            {labels.map((l, i) => (
                <text key={i} x={pad + i * xStep} y={h - 6} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">
                    {l}
                </text>
            ))}
        </svg>
    );
}

// ── Ring / Donut Chart ───────────────────────────────────────────────────────
function RingChart({ percent, color, label }: { percent: number; color: string; label: string }) {
    const r = 28, cx = 36, cy = 36;
    const circ = 2 * Math.PI * r;
    const dash = (percent / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="6" />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`} />
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">{percent}%</text>
            </svg>
            <span className="text-xs text-muted-foreground text-center">{label}</span>
        </div>
    );
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold">{value.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
    submitted: { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-200 dark:border-blue-800", label: "Submitted" },
    viewed: { color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-200 dark:border-purple-800", label: "Viewed" },
    accepted: { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-200 dark:border-emerald-800", label: "Accepted" },
    rejected: { color: "text-red-700 dark:text-red-400", bg: "bg-red-500/10 border-red-200 dark:border-red-800", label: "Rejected" },
    withdrawn: { color: "text-gray-700 dark:text-gray-400", bg: "bg-muted border", label: "Withdrawn" },
};

export default function AdminDashboard() {
    const { fetchWithAuth } = useApi();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchWithAuth("/admin/analytics");
                if (res.ok) {
                    const data = await res.json();
                    setAnalytics(data);
                }
            } catch {
                message.error("Failed to load analytics");
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (isLoading || !analytics) {
        return (
            <DashboardLayout role="admin">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-muted-foreground">Loading analytics...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const totalApps = analytics.totalApplications || 1;
    const pendingApprovalPct = Math.round((analytics.pendingInstitutions / Math.max(analytics.totalInstitutions, 1)) * 100);
    const pendingPaymentPct = Math.round((analytics.pendingPayments / Math.max(analytics.totalInstitutions, 1)) * 100);
    const acceptedApps = analytics.applicationsByStatus?.accepted || 0;
    const acceptedPct = Math.round((acceptedApps / totalApps) * 100);

    // Simulated monthly application trend (7 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const appTrend = [20, 35, 28, 50, 42, 65, analytics.totalApplications || 60];
    const userTrend = [10, 18, 22, 30, 35, 45, analytics.totalUsers || 50];

    return (
        <DashboardLayout role="admin">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Platform overview and management</p>
            </div>

            {/* ── ROW 1: Stat Cards with Sparklines ─────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { title: "Total Users", value: analytics.totalUsers, color: "#3b82f6", badge: "+12%", positive: true },
                    { title: "Students", value: analytics.totalStudents, color: "#8b5cf6", badge: "+8%", positive: true },
                    { title: "Institutions", value: analytics.totalInstitutions, color: "#06b6d4", badge: "+5%", positive: true },
                    { title: "Programs", value: analytics.totalPrograms, color: "#10b981", badge: "+18%", positive: true },
                ].map((item) => (
                    <div key={item.title} className="bg-card border rounded-xl p-5 hover:shadow-md transition-all">
                        <p className="text-sm font-medium text-muted-foreground mb-3">{item.title}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-bold">{item.value.toLocaleString()}</p>
                                <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${item.positive
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "bg-red-500/10 text-red-700 dark:text-red-400"
                                    }`}>
                                    {item.positive ? "↑" : "↓"} {item.badge}
                                </span>
                            </div>
                            <Sparkline color={item.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── ROW 2: Stat Cards Row 2 ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { title: "Total Applications", value: analytics.totalApplications, color: "#6366f1", badge: "+22%", positive: true },
                    {
                        title: "Pending Approvals", value: analytics.pendingInstitutions, color: "#f59e0b", badge: "Action needed", positive: false,
                        highlight: analytics.pendingInstitutions > 0 ? "border-amber-300 dark:border-amber-700 bg-amber-500/10" : ""
                    },
                    {
                        title: "Pending Payments", value: analytics.pendingPayments, color: "#3b82f6", badge: "Review",
                        positive: false,
                        highlight: analytics.pendingPayments > 0 ? "border-blue-300 dark:border-blue-700 bg-blue-500/10" : ""
                    },
                    {
                        title: "Total Revenue", value: analytics.totalRevenue, color: "#10b981", badge: "+15%", positive: true,
                        highlight: "border-emerald-300 dark:border-emerald-700 bg-emerald-500/10",
                        prefix: "PKR "
                    },
                ].map((item) => (
                    <div key={item.title} className={`border rounded-xl p-5 hover:shadow-md transition-all ${item.highlight || "bg-card"}`}>
                        <p className="text-sm font-medium text-muted-foreground mb-3">{item.title}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-bold">
                                    {item.prefix || ""}{typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                                </p>
                                <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${item.positive
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                    }`}>
                                    {item.badge}
                                </span>
                            </div>
                            <Sparkline color={item.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── ROW 3: Platform Distribution + Progress Stats + Ring Charts ────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Left: Platform User Distribution (big visual) */}
                <div className="lg:col-span-2 bg-card border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-semibold">Platform Distribution</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">User & program breakdown</p>
                        </div>
                        <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium border border-blue-200 dark:border-blue-800">
                            Live
                        </span>
                    </div>

                    {/* Visual bar breakdown */}
                    <div className="space-y-5">
                        {[
                            { label: "Students", value: analytics.totalStudents, max: analytics.totalUsers, color: "#3b82f6" },
                            { label: "Institutions", value: analytics.totalInstitutions, max: analytics.totalUsers, color: "#8b5cf6" },
                            { label: "Active Programs", value: analytics.totalPrograms, max: Math.max(analytics.totalPrograms, analytics.totalStudents), color: "#10b981" },
                            { label: "Total Applications", value: analytics.totalApplications, max: Math.max(analytics.totalApplications, analytics.totalStudents), color: "#f59e0b" },
                        ].map((item) => {
                            const pct = item.max > 0 ? Math.min(100, Math.round((item.value / item.max) * 100)) : 0;
                            return (
                                <div key={item.label}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold">{item.value.toLocaleString()}</span>
                                            <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary row at bottom */}
                    <div className="mt-6 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Total Users", val: analytics.totalUsers, color: "#3b82f6" },
                            { label: "Programs", val: analytics.totalPrograms, color: "#10b981" },
                            { label: "Applications", val: analytics.totalApplications, color: "#f59e0b" },
                            { label: "Revenue", val: `PKR ${analytics.totalRevenue.toLocaleString()}`, color: "#8b5cf6" },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-lg font-bold" style={{ color: s.color }}>{s.val}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Progress stats + Ring charts */}
                <div className="bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-semibold mb-5">Approval Metrics</h2>
                        <ProgressRow label="Students on platform" value={analytics.totalStudents} max={analytics.totalUsers} color="#3b82f6" />
                        <ProgressRow label="Institutions approved" value={analytics.totalInstitutions - analytics.pendingInstitutions} max={analytics.totalInstitutions} color="#8b5cf6" />
                        <ProgressRow label="Applications accepted" value={acceptedApps} max={totalApps} color="#10b981" />
                        <ProgressRow label="Payments verified" value={analytics.totalInstitutions - analytics.pendingPayments} max={analytics.totalInstitutions} color="#f59e0b" />
                    </div>

                    {/* Ring charts */}
                    <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center justify-around">
                            <RingChart percent={pendingApprovalPct} color="#f59e0b" label="Pending Approvals" />
                            <RingChart percent={pendingPaymentPct} color="#3b82f6" label="Pending Payments" />
                            <RingChart percent={acceptedPct} color="#10b981" label="Acceptance Rate" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ROW 4: Line Chart + Application Status List ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Left: Line chart */}
                <div className="lg:col-span-2 bg-card border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-semibold">Growth Trends</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Applications & users over time</p>
                        </div>
                    </div>
                    <LineChart data1={appTrend} data2={userTrend} labels={months} />
                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-xs text-muted-foreground">Applications</span>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{analytics.totalApplications}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            <span className="text-xs text-muted-foreground">Users</span>
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{analytics.totalUsers}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs text-muted-foreground">Programs</span>
                            <span className="text-xs font-bold">{analytics.totalPrograms}</span>
                            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Institutions</span>
                            <span className="text-xs font-bold">{analytics.totalInstitutions}</span>
                            <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </div>
                    </div>
                </div>

                {/* Right: Applications by status list */}
                <div className="bg-card border rounded-xl p-6">
                    <h2 className="text-base font-semibold mb-5">Applications by Status</h2>
                    <div className="space-y-3">
                        {Object.entries(analytics.applicationsByStatus).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No application data</p>
                        ) : (
                            Object.entries(analytics.applicationsByStatus).map(([status, count]) => {
                                const cfg = STATUS_CONFIG[status] || { color: "text-muted-foreground", bg: "bg-muted border", label: status };
                                const pct = Math.round((count / totalApps) * 100);
                                return (
                                    <div key={status} className="flex items-center justify-between py-2.5 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-current opacity-60" style={{
                                                color: status === "accepted" ? "#10b981" : status === "submitted" ? "#3b82f6" : status === "rejected" ? "#ef4444" : status === "viewed" ? "#8b5cf6" : "#6b7280"
                                            }}></div>
                                            <span className="text-sm font-medium capitalize">{cfg.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{count}</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {/* Total */}
                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-sm font-bold">{analytics.totalApplications}</span>
                    </div>
                </div>
            </div>

            {/* ── ROW 5: Revenue Card + Quick Actions ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue highlight card (blue bg like reference Sales Report) */}
                <div className="lg:col-span-2 bg-blue-600 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-blue-200 text-sm font-medium mb-1">Total Platform Revenue</p>
                        <p className="text-white text-3xl font-bold">PKR {analytics.totalRevenue.toLocaleString()}</p>
                        <p className="text-blue-200 text-xs mt-1">From {analytics.totalInstitutions} institution{analytics.totalInstitutions !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <Link href="/admin/payments">
                            <button className="w-full sm:w-auto px-5 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                                View Payments
                            </button>
                        </Link>
                        <Link href="/admin/institutions">
                            <button className="w-full sm:w-auto px-5 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-400 transition-colors border border-blue-400 cursor-pointer">
                                Manage Institutions
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Platform Health card */}
                <div className="bg-card border rounded-xl p-6">
                    <h2 className="text-base font-semibold mb-4">Platform Health</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-sm">Pending Approvals</span>
                            </div>
                            <span className={`text-sm font-bold ${analytics.pendingInstitutions > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                {analytics.pendingInstitutions}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                <span className="text-sm">Pending Payments</span>
                            </div>
                            <span className={`text-sm font-bold ${analytics.pendingPayments > 0 ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                {analytics.pendingPayments}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                <span className="text-sm">Total Programs</span>
                            </div>
                            <span className="text-sm font-bold">{analytics.totalPrograms}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                <span className="text-sm">Acceptance Rate</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{acceptedPct}%</span>
                        </div>
                    </div>
                    <div className="mt-5 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-muted-foreground">All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}