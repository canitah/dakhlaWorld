"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
                toast.error("Failed to load analytics");
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground mb-6">Platform overview and management</p>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard title="Total Users" value={analytics.totalUsers} icon="👥" />
                <StatsCard title="Students" value={analytics.totalStudents} icon="🎓" />
                <StatsCard title="Institutions" value={analytics.totalInstitutions} icon="🏫" />
                <StatsCard title="Programs" value={analytics.totalPrograms} icon="📚" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard title="Total Applications" value={analytics.totalApplications} icon="📋" />
                <StatsCard
                    title="Pending Approvals"
                    value={analytics.pendingInstitutions}
                    icon="⏳"
                    className={analytics.pendingInstitutions > 0 ? "border-amber-300 bg-amber-50/50" : ""}
                />
                <StatsCard
                    title="Pending Payments"
                    value={analytics.pendingPayments}
                    icon="💳"
                    className={analytics.pendingPayments > 0 ? "border-blue-300 bg-blue-50/50" : ""}
                />
                <StatsCard
                    title="Total Revenue"
                    value={`PKR ${analytics.totalRevenue.toLocaleString()}`}
                    icon="💰"
                    className="border-emerald-300 bg-emerald-50/50"
                />
            </div>

            {/* Application Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Applications by Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Object.entries(analytics.applicationsByStatus).map(([status, count]) => (
                            <div key={status} className="text-center p-4 rounded-lg bg-gray-50">
                                <p className="text-2xl font-bold">{count}</p>
                                <p className="text-sm text-muted-foreground capitalize">{status}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
