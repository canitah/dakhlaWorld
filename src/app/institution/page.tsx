"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatsCard, StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

interface InstitutionProfile {
    id: number;
    name: string;
    status: string;
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
    _count: { applications: number };
}

export default function InstitutionDashboard() {
    const { fetchWithAuth } = useApi();
    const [profile, setProfile] = useState<InstitutionProfile | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }

    const handleStatusUpdate = async (appId: number, status: string) => {
        const res = await fetchWithAuth(`/institutions/applications/${appId}`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            toast.success(`Application ${status}`);
            loadData();
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="institution">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    // Pending approval gate
    if (profile && profile.status === "pending") {
        return (
            <DashboardLayout role="institution">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-4xl mb-6">
                        ⏳
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Pending Approval</h1>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Your institution is currently under review by our admin team.
                        You&apos;ll get access to the full dashboard once approved.
                    </p>
                    <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 px-4 py-1">
                        Status: Awaiting Approval
                    </Badge>
                </div>
            </DashboardLayout>
        );
    }

    if (profile && profile.status === "rejected") {
        return (
            <DashboardLayout role="institution">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-4xl mb-6">
                        ❌
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Application Rejected</h1>
                    <p className="text-muted-foreground max-w-md">
                        Unfortunately, your institution registration was not approved.
                        Please contact support for more information.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    const currentPlan = profile?.payment_requests?.[0]?.plan?.name || "Free";
    const totalLeads = applications.length;
    const newApps = applications.filter((a) => a.status === "submitted").length;

    return (
        <DashboardLayout role="institution">
            <h1 className="text-2xl font-bold mb-2">Welcome, {profile?.name}!</h1>
            <p className="text-muted-foreground mb-6">Manage your programs and applications</p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard title="Active Programs" value={programs.filter((p) => p.is_active).length} icon="📚" />
                <StatsCard title="New Applications" value={newApps} icon="📩" />
                <StatsCard
                    title="Current Plan"
                    value={currentPlan}
                    icon="💎"
                    className={currentPlan === "Featured" ? "border-amber-300 bg-amber-50/50" : ""}
                />
                <StatsCard title="Total Leads" value={totalLeads} icon="👥" />
            </div>

            {/* Applications Overview */}
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Applications Overview</CardTitle>
                    <Link href="/institution/applications">
                        <Button variant="ghost" size="sm" className="text-blue-600">
                            View All →
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <p className="text-center py-6 text-muted-foreground">No applications yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Applicant</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Program</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.slice(0, 5).map((app) => (
                                        <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 text-sm font-medium">
                                                {app.student.full_name || app.student.user.email || "Unknown"}
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">{app.program.title}</td>
                                            <td className="py-3">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleStatusUpdate(app.id, "viewed")}>
                                                        View
                                                    </Button>
                                                    {app.status !== "accepted" && (
                                                        <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusUpdate(app.id, "accepted")}>
                                                            Accept
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

            {/* Manage Programs */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Manage Programs</h2>
                <Link href="/institution/programs">
                    <Button className="bg-blue-600 hover:bg-blue-700">+ Post New Program</Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.slice(0, 6).map((program) => (
                    <Card key={program.id} className="hover:shadow-lg transition-all">
                        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">{program.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {program.category && <Badge variant="secondary">{program.category}</Badge>}
                                <Badge variant="outline">{program._count.applications} applications</Badge>
                                <Badge variant={program.is_active ? "default" : "secondary"}>
                                    {program.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/institution/programs?edit=${program.id}`} className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full text-xs">
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </DashboardLayout>
    );
}
