// "use client";

// import { useEffect, useState } from "react";
// import { useApi } from "@/hooks/use-api";
// import { DashboardLayout } from "@/components/dashboard-layout";
// import { StatsCard, StatusBadge } from "@/components/stats-card";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import Link from "next/link";
// import { toast } from "sonner";

// interface InstitutionProfile {
//     id: number;
//     name: string;
//     status: string;
//     payment_requests: Array<{ plan: { name: string } }>;
//     _count: { programs: number };
// }

// interface Application {
//     id: number;
//     status: string;
//     created_at: string;
//     student: {
//         id: number;
//         full_name: string | null;
//         user: { email: string | null };
//     };
//     program: { id: number; title: string };
// }

// interface Program {
//     id: number;
//     title: string;
//     category: string | null;
//     is_active: boolean;
//     _count: { applications: number };
// }

// export default function InstitutionDashboard() {
//     const { fetchWithAuth } = useApi();
//     const [profile, setProfile] = useState<InstitutionProfile | null>(null);
//     const [applications, setApplications] = useState<Application[]>([]);
//     const [programs, setPrograms] = useState<Program[]>([]);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         loadData();
//     }, []);

//     async function loadData() {
//         try {
//             const [profRes, appRes, progRes] = await Promise.all([
//                 fetchWithAuth("/institutions/profile"),
//                 fetchWithAuth("/institutions/applications"),
//                 fetchWithAuth("/institutions/programs"),
//             ]);

//             if (profRes.ok) {
//                 const data = await profRes.json();
//                 setProfile(data.profile);
//             }
//             if (appRes.ok) {
//                 const data = await appRes.json();
//                 setApplications(data.applications);
//             }
//             if (progRes.ok) {
//                 const data = await progRes.json();
//                 setPrograms(data.programs);
//             }
//         } catch {
//             toast.error("Failed to load data");
//         } finally {
//             setIsLoading(false);
//         }
//     }

//     const handleStatusUpdate = async (appId: number, status: string) => {
//         const res = await fetchWithAuth(`/institutions/applications/${appId}`, {
//             method: "PUT",
//             body: JSON.stringify({ status }),
//         });
//         if (res.ok) {
//             toast.success(`Application ${status}`);
//             loadData();
//         }
//     };

//     if (isLoading) {
//         return (
//             <DashboardLayout role="institution">
//                 <div className="flex items-center justify-center h-64">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 </div>
//             </DashboardLayout>
//         );
//     }

//     // Pending approval gate
//     if (profile && profile.status === "pending") {
//         return (
//             <DashboardLayout role="institution">
//                 <div className="flex flex-col items-center justify-center h-[60vh] text-center">
//                     <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center text-4xl mb-6">
//                         ⏳
//                     </div>
//                     <h1 className="text-2xl font-bold mb-3">Pending Approval</h1>
//                     <p className="text-muted-foreground max-w-md mb-6">
//                         Your institution is currently under review by our admin team.
//                         You&apos;ll get access to the full dashboard once approved.
//                     </p>
//                     <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-500/10 px-4 py-1">
//                         Status: Awaiting Approval
//                     </Badge>
//                 </div>
//             </DashboardLayout>
//         );
//     }

//     if (profile && profile.status === "rejected") {
//         return (
//             <DashboardLayout role="institution">
//                 <div className="flex flex-col items-center justify-center h-[60vh] text-center">
//                     <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-4xl mb-6">
//                         ❌
//                     </div>
//                     <h1 className="text-2xl font-bold mb-3">Application Rejected</h1>
//                     <p className="text-muted-foreground max-w-md">
//                         Unfortunately, your institution registration was not approved.
//                         Please contact support for more information.
//                     </p>
//                 </div>
//             </DashboardLayout>
//         );
//     }

//     const currentPlan = profile?.payment_requests?.[0]?.plan?.name || "Free";
//     const totalLeads = applications.length;
//     const newApps = applications.filter((a) => a.status === "submitted").length;

//     return (
//         <DashboardLayout role="institution">
//             <h1 className="text-2xl font-bold mb-2">Welcome, {profile?.name}!</h1>
//             <p className="text-muted-foreground mb-6">Manage your programs and applications</p>

//             {/* Stats */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                 <StatsCard title="Active Programs" value={programs.filter((p) => p.is_active).length} icon="📚" />
//                 <StatsCard title="New Applications" value={newApps} icon="📩" />
//                 <StatsCard
//                     title="Current Plan"
//                     value={currentPlan}
//                     icon="💎"
//                     className={currentPlan === "Featured" ? "border-amber-300 dark:border-amber-700 bg-amber-500/10" : ""}
//                 />
//                 <StatsCard title="Total Leads" value={totalLeads} icon="👥" />
//             </div>

//             {/* Applications Overview */}
//             <Card className="mb-8">
//                 <CardHeader className="flex flex-row items-center justify-between">
//                     <CardTitle>Applications Overview</CardTitle>
//                     <Link href="/institution/applications">
//                         <Button variant="ghost" size="sm" className="text-blue-600">
//                             View All →
//                         </Button>
//                     </Link>
//                 </CardHeader>
//                 <CardContent>
//                     {applications.length === 0 ? (
//                         <p className="text-center py-6 text-muted-foreground">No applications yet</p>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead>
//                                     <tr className="border-b text-left">
//                                         <th className="pb-3 text-sm font-semibold text-muted-foreground">Applicant</th>
//                                         <th className="pb-3 text-sm font-semibold text-muted-foreground">Program</th>
//                                         <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
//                                         <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {applications.slice(0, 5).map((app) => (
//                                         <tr key={app.id} className="border-b last:border-0 hover:bg-accent/50">
//                                             <td className="py-3 text-sm font-medium">
//                                                 {app.student.full_name || app.student.user.email || "Unknown"}
//                                             </td>
//                                             <td className="py-3 text-sm text-muted-foreground">{app.program.title}</td>
//                                             <td className="py-3">
//                                                 <StatusBadge status={app.status} />
//                                             </td>
//                                             <td className="py-3">
//                                                 <div className="flex gap-1">
//                                                     <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleStatusUpdate(app.id, "viewed")}>
//                                                         View
//                                                     </Button>
//                                                     {app.status !== "accepted" && (
//                                                         <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusUpdate(app.id, "accepted")}>
//                                                             Accept
//                                                         </Button>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>

//             {/* Manage Programs */}
//             <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-bold">Manage Programs</h2>
//                 <Link href="/institution/programs">
//                     <Button className="bg-blue-600 hover:bg-blue-700">+ Post New Program</Button>
//                 </Link>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {programs.slice(0, 6).map((program) => (
//                     <Card key={program.id} className="hover:shadow-lg transition-all">
//                         <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-base">{program.title}</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="flex flex-wrap gap-1.5 mb-3">
//                                 {program.category && <Badge variant="secondary">{program.category}</Badge>}
//                                 <Badge variant="outline">{program._count.applications} applications</Badge>
//                                 <Badge variant={program.is_active ? "default" : "secondary"}>
//                                     {program.is_active ? "Active" : "Inactive"}
//                                 </Badge>
//                             </div>
//                             <div className="flex gap-2">
//                                 <Link href={`/institution/programs?edit=${program.id}`} className="flex-1">
//                                     <Button size="sm" variant="outline" className="w-full text-xs">
//                                         Edit
//                                     </Button>
//                                 </Link>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 ))}
//             </div>
//         </DashboardLayout>
//     );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatsCard, StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanBadge } from "@/components/plan-badge";
import {
    StatsCardWithSparkline,
    OverviewAreaChart,
    StatusDonutChart,
    MonthlyGoalsCard,
    buildMonthlyData,
    buildDailySparkline,
} from "@/components/dashboard-charts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { message } from "antd";


interface InstitutionProfile {
    id: number;
    name: string;
    status: string;
    category: string | null;
    description: string | null;
    rejection_reason: string | null;
    payment_requests: Array<{ plan: { name: string } }>;
    _count: { programs: number };
}

interface Application {
    id: number;
    status: string;
    created_at: string;
    student: {
        id: number;
        full_name: string | null;
        user: { email: string | null };
    };
    program: { id: number; title: string };
}

interface Program {
    id: number;
    title: string;
    category: string | null;
    is_active: boolean;
    program_code: string;
    _count: { applications: number };
}

// SVG Icon Components
const BookIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const InboxIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon = () => (
    <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const PencilIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export default function InstitutionDashboard() {
    const { fetchWithAuth } = useApi();
    const router = useRouter();
    const [profile, setProfile] = useState<InstitutionProfile | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAppealing, setIsAppealing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [profRes, appRes, progRes] = await Promise.all([
                fetchWithAuth("/institutions/profile"),
                fetchWithAuth("/institutions/applications"),
                fetchWithAuth("/institutions/programs"),
            ]);

            if (profRes.ok) {
                const data = await profRes.json();
                setProfile(data.profile);
            }
            if (appRes.ok) {
                const data = await appRes.json();
                setApplications(data.applications);
            }
            if (progRes.ok) {
                const data = await progRes.json();
                setPrograms(data.programs);
            }
        } catch {
            message.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }

    // ── Date filtering state ──
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Filter applications by date range (client-side)
    const filteredApplications = useMemo(() => {
        let result = applications;
        if (dateFrom) {
            const from = new Date(dateFrom);
            result = result.filter(a => new Date(a.created_at) >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            result = result.filter(a => new Date(a.created_at) <= to);
        }
        return result;
    }, [applications, dateFrom, dateTo]);

    const handleExportCSV = () => {
        const headers = ["ID", "Student Name", "Student Email", "Program", "Status", "Date"];
        const rows = filteredApplications.map(app => [
            app.id,
            app.student.full_name || "",
            app.student.user.email || "",
            app.program.title,
            app.status,
            new Date(app.created_at).toISOString().split("T")[0],
        ]);
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `institution-export-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        message.success("CSV exported successfully");
    };

    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const handleStatusUpdate = async (appId: number, status: string) => {
        setUpdatingStatus(`${appId}_${status}`);
        try {
            const res = await fetchWithAuth(`/institutions/applications/${appId}`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                message.success(`Application ${status}`);
                loadData();
            }
        } finally {
            setUpdatingStatus(null);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="institution">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Profile completeness check
    const isProfileIncomplete = profile && (!profile.category || !profile.description);
    const isPending = profile && profile.status === "pending";

    if (profile && profile.status === "rejected") {
        const handleAppeal = async () => {
            setIsAppealing(true);
            try {
                const res = await fetchWithAuth("/institutions/appeal", {
                    method: "POST",
                });
                if (res.ok) {
                    message.success("Appeal submitted! Your institution is now pending re-approval.");
                    loadData();
                } else {
                    const data = await res.json();
                    message.error(data.error || "Failed to submit appeal");
                }
            } catch {
                message.error("Failed to submit appeal");
            } finally {
                setIsAppealing(false);
            }
        };

        return (
            <DashboardLayout role="institution">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-300 dark:border-red-800 flex items-center justify-center mb-6">
                        <XCircleIcon />
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Application Rejected</h1>
                    <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
                        Unfortunately, your institution registration was not approved.
                        You can update your profile and appeal for re-approval.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/institution/profile">
                            <Button variant="outline" className="gap-2">
                                <PencilIcon />
                                Update Profile
                            </Button>
                        </Link>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                            onClick={handleAppeal}
                            disabled={isAppealing}
                        >
                            {isAppealing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Submitting Appeal...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Appeal for Re-Approval
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (profile && profile.status === "cancelled") {
        return (
            <DashboardLayout role="institution">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                    <div className="w-24 h-24 rounded-full bg-orange-500/10 border border-orange-300 dark:border-orange-800 flex items-center justify-center mb-6">
                        <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Registration Cancelled</h1>
                    <p className="text-muted-foreground max-w-md leading-relaxed mb-4">
                        Your institution registration has been cancelled by an administrator.
                    </p>
                    {profile.rejection_reason && (
                        <div className="bg-orange-500/10 border border-orange-300 dark:border-orange-700 rounded-lg p-4 max-w-md mb-6 text-left">
                            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">Reason for cancellation:</p>
                            <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed">
                                {profile.rejection_reason}
                            </p>
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground max-w-md">
                        If you believe this was in error, please contact our support team for further assistance.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    const currentPlan = profile?.payment_requests?.[0]?.plan?.name || "Free";
    const totalLeads = filteredApplications.length;
    const newApps = filteredApplications.filter((a) => a.status === "submitted").length;

    return (
        <DashboardLayout role="institution">
            {/* Pending Approval Banner */}
            {isPending && (
                <div className="mb-6 p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-500/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pending Approval</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400">Your institution is under review. Full access will be available once approved.</p>
                    </div>
                    <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-500/10 px-3 py-0.5 gap-1.5 flex-shrink-0 hidden sm:flex">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Awaiting
                    </Badge>
                </div>
            )}

            {/* Incomplete Profile Banner */}
            {isProfileIncomplete && (
                <div className="mb-6 p-4 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-500/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <PencilIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Complete Your Profile</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">Add your category and description to help students find your institution.</p>
                    </div>
                    <Link href="/institution/profile">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 flex-shrink-0">
                            <PencilIcon />
                            Complete Profile
                        </Button>
                    </Link>
                </div>
            )}

            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-bold">
                                Welcome, {profile?.name}!
                            </h1>
                            <PlanBadge planName={currentPlan !== "Free" ? currentPlan : null} size="md" />
                        </div>
                        <p className="text-muted-foreground mt-1">Manage your programs and applications</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="px-3 py-1.5 text-sm bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-muted-foreground">To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="px-3 py-1.5 text-sm bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                        </div>
                        {(dateFrom || dateTo) && (
                            <button
                                onClick={() => { setDateFrom(""); setDateTo(""); }}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats Cards with Sparklines ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCardWithSparkline
                    title="Active Programs"
                    value={programs.filter((p) => p.is_active).length}
                    subtitle={`of ${programs.length} total programs`}
                    color="#3b82f6"
                    sparklineData={programs.map(p => p._count.applications)}
                    icon={<BookIcon />}
                />
                <StatsCardWithSparkline
                    title="New Applications"
                    value={newApps}
                    subtitle="awaiting your review"
                    color="#6366f1"
                    sparklineData={buildDailySparkline(filteredApplications.filter(a => a.status === "submitted").map(a => a.created_at))}
                    icon={<InboxIcon />}
                />
                <Link href="/institution/billing" className="block">
                    <StatsCardWithSparkline
                        title="Current Plan"
                        value={currentPlan}
                        subtitle={currentPlan === "Featured" ? "Manage plan →" : "Upgrade plan →"}
                        color={currentPlan === "Featured" ? "#f59e0b" : "#8b5cf6"}
                        icon={<StarIcon />}
                    />
                </Link>
                <StatsCardWithSparkline
                    title="Total Leads"
                    value={totalLeads}
                    subtitle="total applicants"
                    color="#10b981"
                    sparklineData={buildDailySparkline(filteredApplications.map(a => a.created_at))}
                    icon={<UsersIcon />}
                />
            </div>

            {/* ── Charts Row: Area Chart + Donut ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <OverviewAreaChart
                        title="Overview"
                        subtitle="Applications received per month"
                        data={buildMonthlyData(filteredApplications.map(a => a.created_at))}
                        color="#3b82f6"
                    />
                </div>
                <StatusDonutChart
                    title="Application Status"
                    subtitle="Breakdown by status"
                    centerLabel="Total"
                    centerValue={totalLeads}
                    data={[
                        { name: "Submitted", value: filteredApplications.filter(a => a.status === "submitted").length, color: "#3b82f6" },
                        { name: "Viewed", value: filteredApplications.filter(a => a.status === "viewed").length, color: "#8b5cf6" },
                        { name: "Accepted", value: filteredApplications.filter(a => a.status === "accepted").length, color: "#10b981" },
                        { name: "Rejected", value: filteredApplications.filter(a => a.status === "rejected").length, color: "#ef4444" },
                    ]}
                />
            </div>

            {/* ── Goals + Recent Applications Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <MonthlyGoalsCard
                    title="Goals & Utilization"
                    subtitle="Track your progress"
                    goals={[
                        {
                            label: "Program Slots Used",
                            current: programs.filter(p => p.is_active).length,
                            target: currentPlan === "Featured" ? Math.max(programs.filter(p => p.is_active).length + 5, 30) : currentPlan === "Pro" ? 22 : currentPlan === "Growth" ? 12 : 2,
                            color: "#3b82f6",
                        },
                        {
                            label: "Acceptance Rate",
                            current: filteredApplications.filter(a => a.status === "accepted").length,
                            target: Math.max(totalLeads, 1),
                            color: "#10b981",
                        },
                        {
                            label: "Applications Reviewed",
                            current: filteredApplications.filter(a => a.status !== "submitted").length,
                            target: Math.max(totalLeads, 1),
                            color: "#8b5cf6",
                        },
                    ]}
                />

                <Card className="mb-8">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div>
                            <CardTitle>Applications Overview</CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">Recent student applications</p>
                        </div>
                        <Link href="/institution/applications">
                            <Button variant="outline" size="sm" className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                View All
                                <ArrowRightIcon />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {filteredApplications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                                    <InboxIcon />
                                </div>
                                <p className="font-medium">No applications yet</p>
                                <p className="text-muted-foreground text-sm mt-1">Applications will appear here once students apply</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Applicant</th>
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Program</th>
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                                            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredApplications.slice(0, 5).map((app) => (
                                            <tr key={app.id} className="hover:bg-accent/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0">
                                                            {(app.student.full_name || app.student.user.email || "?")[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {app.student.full_name || app.student.user.email || "Unknown"}
                                                            </p>
                                                            {app.student.full_name && (
                                                                <p className="text-xs text-muted-foreground">{app.student.user.email}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-muted-foreground">{app.program.title}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={app.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {app.status === "submitted" && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 px-3 flex items-center gap-1.5 text-xs"
                                                                onClick={() => handleStatusUpdate(app.id, "viewed")}
                                                                disabled={updatingStatus === `${app.id}_viewed`}
                                                            >
                                                                {updatingStatus === `${app.id}_viewed` ? <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" /> : <EyeIcon />}
                                                                {updatingStatus === `${app.id}_viewed` ? "Updating..." : "View"}
                                                            </Button>
                                                        )}
                                                        {(app.status === "viewed" || app.status === "rejected") && (
                                                            <Button
                                                                size="sm"
                                                                className="h-8 px-3 flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                                onClick={() => handleStatusUpdate(app.id, "accepted")}
                                                                disabled={updatingStatus === `${app.id}_accepted`}
                                                            >
                                                                {updatingStatus === `${app.id}_accepted` ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : <CheckIcon />}
                                                                {updatingStatus === `${app.id}_accepted` ? "Accepting..." : "Accept"}
                                                            </Button>
                                                        )}
                                                        {(app.status === "viewed" || app.status === "accepted") && (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="h-8 px-3 flex items-center gap-1.5 text-xs"
                                                                onClick={() => handleStatusUpdate(app.id, "rejected")}
                                                                disabled={updatingStatus === `${app.id}_rejected`}
                                                            >
                                                                {updatingStatus === `${app.id}_rejected` ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : null}
                                                                {updatingStatus === `${app.id}_rejected` ? "Rejecting..." : "Reject"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Manage Programs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold">Manage Programs</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Your posted programs and their performance</p>
                </div>
                <Link href="/institution/programs">
                    <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                        <PlusIcon />
                        Post New Program
                    </Button>
                </Link>
            </div>

            {programs.length === 0 ? (
                <div className="bg-card rounded-xl border border-dashed p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                        <BookIcon />
                    </div>
                    <p className="font-medium">No programs posted yet</p>
                    <p className="text-muted-foreground text-sm mt-1 mb-4">Start by posting your first program</p>
                    <Link href="/institution/programs">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Post Your First Program
                        </Button>
                    </Link>
                </div>
            ) : (
                // Drop-in replacement for the programs grid in the institution dashboard.
                // Only uses fields already present in the snippet: title, is_active, category,
                // _count.applications, and the Link/edit href.
                // All other functionality (Link, Button, PencilIcon) unchanged.

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {programs.slice(0, 6).map((program) => (
                        <Link key={program.id} href={`/institution/programs?open=${program.program_code}`} className="block">
                            <div
                                className="
                bg-card rounded-2xl
                border border-primary/20
                shadow-sm p-5 flex flex-col gap-3
                transition-all duration-200
                hover:shadow-md hover:border-primary/40
                cursor-pointer
            "
                            >
                                {/* Row 1 — Active/Inactive badge + title */}
                                <div className="flex flex-col gap-1">
                                    {/* Status badge — mirrors "New" pill in Indeed cards */}
                                    <span className={`
                    inline-flex items-center gap-1.5 self-start
                    rounded-full px-2.5 py-0.5 text-[11px] font-bold mb-1
                    ${program.is_active
                                            ? "bg-primary/10 text-primary"
                                            : "bg-muted text-muted-foreground"}
                `}>
                                        {program.is_active ? "Active" : "Inactive"}
                                    </span>

                                    {/* Program title */}
                                    <h3 className="text-[15px] font-bold text-foreground leading-snug line-clamp-2">
                                        {program.title}
                                    </h3>

                                    {/* Category — mirrors institution name row */}
                                    {program.category && (
                                        <p className="text-[13px] text-muted-foreground leading-snug">
                                            {program.category}
                                        </p>
                                    )}
                                </div>

                                {/* Row 2 — Pills (mirrors salary + job-type pills) */}
                                <div className="flex flex-wrap gap-2">
                                    {/* Applicants pill */}
                                    <span className="
                    inline-flex items-center gap-1.5
                    border border-border bg-muted/50
                    rounded-full px-3 py-1
                    text-[12px] font-medium text-muted-foreground whitespace-nowrap
                ">
                                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {program._count.applications} applicant{program._count.applications !== 1 ? "s" : ""}
                                    </span>
                                </div>

                                {/* Row 3 — View details footer */}
                                <div className="pt-1 border-t border-border">
                                    <span className="
                    flex items-center gap-1.5
                    text-[13px] font-semibold text-primary
                ">
                                        <PencilIcon />
                                        View & Edit Program
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}