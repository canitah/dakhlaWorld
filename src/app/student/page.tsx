// "use client";

// import { useEffect, useState } from "react";
// import { useApi } from "@/hooks/use-api";
// import { DashboardLayout } from "@/components/dashboard-layout";
// import { StatsCard, StatusBadge } from "@/components/stats-card";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import Link from "next/link";
// import { toast } from "sonner";
// import { useAuthStore } from "@/store/auth-store";

// interface Program {
//     id: number;
//     title: string;
//     category: string | null;
//     duration: string | null;
//     deadline: string | null;
//     institution: {
//         id: number;
//         name: string;
//         city: string | null;
//         category: string | null;
//     };
// }

// interface Application {
//     id: number;
//     status: string;
//     created_at: string;
//     program: {
//         title: string;
//         institution: { name: string; city: string | null };
//     };
// }

// export default function StudentDashboard() {
//     const { fetchWithAuth } = useApi();
//     const { user } = useAuthStore();
//     const [programs, setPrograms] = useState<Program[]>([]);
//     const [applications, setApplications] = useState<Application[]>([]);
//     const [search, setSearch] = useState("");
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         loadData();
//     }, []);

//     async function loadData() {
//         try {
//             const [progRes, appRes] = await Promise.all([
//                 fetchWithAuth("/programs?limit=8"),
//                 fetchWithAuth("/applications"),
//             ]);

//             if (progRes.ok) {
//                 const data = await progRes.json();
//                 setPrograms(data.programs);
//             }
//             if (appRes.ok) {
//                 const data = await appRes.json();
//                 setApplications(data.applications);
//             }
//         } catch {
//             toast.error("Failed to load data");
//         } finally {
//             setIsLoading(false);
//         }
//     }

//     const handleSearch = async () => {
//         const res = await fetchWithAuth(`/programs?search=${search}&limit=12`);
//         if (res.ok) {
//             const data = await res.json();
//             setPrograms(data.programs);
//         }
//     };

//     const handleApply = async (programId: number) => {
//         const res = await fetchWithAuth("/applications", {
//             method: "POST",
//             body: JSON.stringify({ program_id: programId }),
//         });
//         const data = await res.json();
//         if (res.ok) {
//             toast.success("Application submitted!");
//             loadData();
//         } else {
//             toast.error(data.error);
//         }
//     };

//     const handleSave = async (programId: number) => {
//         const res = await fetchWithAuth("/saved", {
//             method: "POST",
//             body: JSON.stringify({ program_id: programId }),
//         });
//         if (res.ok) {
//             const data = await res.json();
//             toast.success(data.message);
//         }
//     };

//     if (isLoading) {
//         return (
//             <DashboardLayout role="student">
//                 <div className="flex items-center justify-center h-64">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 </div>
//             </DashboardLayout>
//         );
//     }

//     return (
//         <DashboardLayout role="student">
//             {/* Welcome Banner */}
//             <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 mb-8">
//                 <h1 className="text-2xl font-bold mb-2">
//                     Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
//                 </h1>
//                 <p className="text-blue-100 mb-6">
//                     Discover programs and start your admissions journey
//                 </p>
//                 <div className="flex gap-2 max-w-xl">
//                     <Input
//                         placeholder="Search for programs or institutions..."
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                         className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 h-11"
//                     />
//                     <Button
//                         onClick={handleSearch}
//                         className="bg-white text-blue-700 hover:bg-blue-50 h-11 px-6"
//                     >
//                         Search
//                     </Button>
//                 </div>
//             </div>

//             {/* Quick Stats */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
//                 <StatsCard
//                     title="Applications"
//                     value={applications.length}
//                     icon="📋"
//                 />
//                 <StatsCard
//                     title="Accepted"
//                     value={applications.filter((a) => a.status === "accepted").length}
//                     icon="✅"
//                 />
//                 <StatsCard
//                     title="Pending"
//                     value={applications.filter((a) => a.status === "submitted").length}
//                     icon="⏳"
//                 />
//             </div>

//             {/* Explore Programs */}
//             <div className="mb-8">
//                 <div className="flex items-center justify-between mb-4">
//                     <h2 className="text-xl font-bold text-foreground">Explore Programs</h2>
//                     <Link href="/student/explore">
//                         <Button variant="ghost" className="text-blue-600">
//                             View All →
//                         </Button>
//                     </Link>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                     {programs.map((program) => (
//                         <Card
//                             key={program.id}
//                             className="hover:shadow-lg transition-all duration-300 overflow-hidden group"
//                         >
//                             <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
//                             <CardHeader className="pb-2">
//                                 <CardTitle className="text-base line-clamp-2">
//                                     {program.title}
//                                 </CardTitle>
//                                 <p className="text-sm text-muted-foreground">
//                                     {program.institution.name}
//                                 </p>
//                             </CardHeader>
//                             <CardContent className="pt-0">
//                                 <div className="flex flex-wrap gap-1.5 mb-3">
//                                     {program.category && (
//                                         <Badge variant="secondary" className="text-xs">
//                                             {program.category}
//                                         </Badge>
//                                     )}
//                                     {program.institution.city && (
//                                         <Badge variant="outline" className="text-xs">
//                                             📍 {program.institution.city}
//                                         </Badge>
//                                     )}
//                                 </div>
//                                 {program.duration && (
//                                     <p className="text-xs text-muted-foreground mb-3">
//                                         Duration: {program.duration}
//                                     </p>
//                                 )}
//                                 <div className="flex gap-2">
//                                     <Button
//                                         size="sm"
//                                         className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
//                                         onClick={() => handleApply(program.id)}
//                                     >
//                                         Apply
//                                     </Button>
//                                     <Button
//                                         size="sm"
//                                         variant="outline"
//                                         className="text-xs"
//                                         onClick={() => handleSave(program.id)}
//                                     >
//                                         💾
//                                     </Button>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     ))}
//                 </div>
//             </div>

//             {/* Application Status */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="text-xl">Application Status</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     {applications.length === 0 ? (
//                         <div className="text-center py-8 text-muted-foreground">
//                             <p className="text-lg mb-2">No applications yet</p>
//                             <p className="text-sm">
//                                 Browse programs above and submit your first application!
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead>
//                                     <tr className="border-b text-left">
//                                         <th className="pb-3 text-sm font-semibold text-muted-foreground">Program</th>
//                                         <th className="pb-3 text-sm font-semibold text-muted-foreground">Institution</th>
//                                         <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
//                                         <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {applications.map((app) => (
//                                         <tr key={app.id} className="border-b last:border-0">
//                                             <td className="py-3 text-sm font-medium">
//                                                 {app.program.title}
//                                             </td>
//                                             <td className="py-3 text-sm text-muted-foreground">
//                                                 {app.program.institution.name}
//                                             </td>
//                                             <td className="py-3">
//                                                 <StatusBadge status={app.status} />
//                                             </td>
//                                             <td className="py-3 text-sm text-muted-foreground">
//                                                 {new Date(app.created_at).toLocaleDateString()}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>
//         </DashboardLayout>
//     );
// }
"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatsCard, StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

interface Program {
    id: number;
    title: string;
    category: string | null;
    duration: string | null;
    deadline: string | null;
    institution: {
        id: number;
        name: string;
        city: string | null;
        category: string | null;
    };
}

interface Application {
    id: number;
    status: string;
    created_at: string;
    program: {
        title: string;
        institution: { name: string; city: string | null };
    };
}

// ── Sparkline Bar Chart ──────────────────────────────────────────────────────
function Sparkline({ color }: { color: string }) {
    const bars = [35, 60, 45, 75, 50, 85, 60, 80, 45, 90, 70, 100];
    return (
        <svg width="80" height="36" viewBox="0 0 80 36" fill="none">
            {bars.map((h, i) => (
                <rect
                    key={i}
                    x={i * 7}
                    y={36 - h * 0.34}
                    width="5"
                    height={h * 0.34}
                    rx="1.5"
                    fill={color}
                    opacity={0.3 + (i / bars.length) * 0.7}
                />
            ))}
        </svg>
    );
}

// ── Ring / Donut Chart ───────────────────────────────────────────────────────
function RingChart({ percent, color, label }: { percent: number; color: string; label: string }) {
    const r = 28, cx = 36, cy = 36, circ = 2 * Math.PI * r;
    const dash = (Math.min(percent, 100) / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-1.5">
            <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="6" />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`} />
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">{percent}%</text>
            </svg>
            <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
        </div>
    );
}

// ── Progress Row ─────────────────────────────────────────────────────────────
function ProgressRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold">{value}</span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
        </div>
    );
}

const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
    submitted: { color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800", dot: "bg-blue-500" },
    viewed:    { color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800", dot: "bg-purple-500" },
    accepted:  { color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
    rejected:  { color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800", dot: "bg-red-500" },
    withdrawn: { color: "bg-muted text-muted-foreground border", dot: "bg-muted-foreground" },
};

// SVG Icons
const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const BookmarkIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);

export default function StudentDashboard() {
    const { fetchWithAuth } = useApi();
    const { user } = useAuthStore();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const [progRes, appRes] = await Promise.all([
                fetchWithAuth("/programs?limit=8"),
                fetchWithAuth("/applications"),
            ]);
            if (progRes.ok) { const data = await progRes.json(); setPrograms(data.programs); }
            if (appRes.ok)  { const data = await appRes.json();  setApplications(data.applications); }
        } catch { toast.error("Failed to load data"); }
        finally  { setIsLoading(false); }
    }

    const handleSearch = async () => {
        const res = await fetchWithAuth(`/programs?search=${search}&limit=12`);
        if (res.ok) { const data = await res.json(); setPrograms(data.programs); }
    };

    const handleApply = async (programId: number) => {
        const res = await fetchWithAuth("/applications", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        const data = await res.json();
        if (res.ok) { toast.success("Application submitted!"); loadData(); }
        else { toast.error(data.error); }
    };

    const handleSave = async (programId: number) => {
        const res = await fetchWithAuth("/saved", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        if (res.ok) { const data = await res.json(); toast.success(data.message); }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const totalApps     = applications.length;
    const acceptedApps  = applications.filter((a) => a.status === "accepted").length;
    const pendingApps   = applications.filter((a) => a.status === "submitted").length;
    const viewedApps    = applications.filter((a) => a.status === "viewed").length;
    const rejectedApps  = applications.filter((a) => a.status === "rejected").length;
    const acceptedPct   = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0;
    const pendingPct    = totalApps > 0 ? Math.round((pendingApps / totalApps) * 100) : 0;
    const reviewedPct   = totalApps > 0 ? Math.round(((totalApps - pendingApps) / totalApps) * 100) : 0;

    // Application status breakdown
    const statusCounts = applications.reduce<Record<string, number>>((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <DashboardLayout role="student">
            {/* Page Header with Search */}
            <div className="mb-8">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">Discover programs and start your admissions journey</p>
                </div>

                {/* Search Bar */}
                <div className="flex gap-2 max-w-2xl">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <Input
                            placeholder="Search for programs or institutions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="pl-10 h-11"
                        />
                    </div>
                    <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 h-11 px-6">
                        Search
                    </Button>
                </div>
            </div>

            {/* ── ROW 1: Stat Cards with Sparklines ──────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { title: "Total Applications", value: totalApps, sub: "all submissions", color: "#3b82f6", badge: `${totalApps} total`, positive: true },
                    { title: "Accepted", value: acceptedApps, sub: "successful applications", color: "#10b981", badge: `${acceptedPct}%`, positive: true },
                    { title: "Pending Review", value: pendingApps, sub: "awaiting decision", color: "#f59e0b", badge: `${pendingPct}%`, positive: false },
                    { title: "Programs Available", value: programs.length, sub: "discover more", color: "#6366f1", badge: "Explore", positive: true },
                ].map((item) => (
                    <div key={item.title} className="bg-card border rounded-xl p-5 hover:shadow-md transition-all">
                        <p className="text-sm font-medium text-muted-foreground mb-3">{item.title}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-bold">{item.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                                <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    item.positive
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

            {/* ── ROW 2: Application Status Breakdown + Ring Charts ──────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Left: Progress Bars */}
                <div className="lg:col-span-2 bg-card border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-semibold">Application Progress</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Track your application journey</p>
                        </div>
                        <Link href="/student/applications">
                            <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                                View All
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-5">
                        <ProgressRow label="Total Applications Submitted" value={totalApps} max={Math.max(totalApps, programs.length, 10)} color="#3b82f6" />
                        <ProgressRow label="Applications Accepted" value={acceptedApps} max={totalApps || 1} color="#10b981" />
                        <ProgressRow label="Under Review" value={viewedApps} max={totalApps || 1} color="#8b5cf6" />
                        <ProgressRow label="Awaiting Response" value={pendingApps} max={totalApps || 1} color="#f59e0b" />
                    </div>

                    <div className="mt-6 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: "Submitted", val: totalApps, color: "#3b82f6" },
                            { label: "Accepted", val: acceptedApps, color: "#10b981" },
                            { label: "Pending", val: pendingApps, color: "#f59e0b" },
                            { label: "Reviewed", val: reviewedPct + "%", color: "#8b5cf6" },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-lg font-bold" style={{ color: s.color }}>{s.val}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Status List + Ring Charts */}
                <div className="bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-semibold mb-5">Status Breakdown</h2>
                        <div className="space-y-3">
                            {Object.keys(STATUS_CONFIG).map((status) => {
                                const count = statusCounts[status] || 0;
                                const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                                const cfg = STATUS_CONFIG[status];
                                return (
                                    <div key={status} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                                            <span className="text-sm capitalize">{status}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{count}</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>{pct}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ring Charts */}
                    <div className="mt-5 pt-4 border-t">
                        <div className="flex items-center justify-around">
                            <RingChart percent={acceptedPct} color="#10b981" label="Accepted" />
                            <RingChart percent={pendingPct} color="#f59e0b" label="Pending" />
                            <RingChart percent={reviewedPct} color="#6366f1" label="Reviewed" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ROW 3: Explore Programs Grid ───────────────────────────────────── */}
            {/* <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-xl font-bold">Explore Programs</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Discover and apply to programs</p>
                </div>
                <Link href="/student/explore">
                    <Button variant="outline" className="flex items-center gap-2">
                        View All
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {programs.map((program) => (
                    <div key={program.id} className="bg-card border rounded-xl hover:shadow-md transition-all overflow-hidden group flex flex-col">
                        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600"></div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-sm font-semibold leading-snug mb-1 line-clamp-2">{program.title}</h3>
                            <p className="text-xs text-muted-foreground mb-3">{program.institution.name}</p>

                            <div className="flex flex-wrap gap-1.5 mb-auto">
                                {program.category && <Badge variant="secondary" className="text-xs">{program.category}</Badge>}
                                {program.institution.city && (
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {program.institution.city}
                                    </Badge>
                                )}
                            </div>

                            {program.duration && (
                                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {program.duration}
                                </p>
                            )}
                        </div>

                        <div className="px-5 pb-5 pt-0 flex gap-2 border-t pt-4">
                            <Button
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-9"
                                onClick={() => handleApply(program.id)}
                            >
                                Apply Now
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-9 px-3"
                                onClick={() => handleSave(program.id)}
                            >
                                <BookmarkIcon />
                            </Button>
                        </div>
                    </div>
                ))}
            </div> */}

            {/* ── ROW 4: Application Status Table ────────────────────────────────── */}
            <Card>
                <CardHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Application Status</CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">Track all your applications</p>
                        </div>
                        <Link href="/student/applications">
                            <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-400">
                                View All
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {applications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="font-medium mb-1">No applications yet</p>
                            <p className="text-sm text-muted-foreground">
                                Browse programs above and submit your first application!
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Program</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Institution</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-accent/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium">{app.program.title}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{app.program.institution.name}</td>
                                            <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(app.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}