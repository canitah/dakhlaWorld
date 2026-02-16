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

export default function StudentDashboard() {
    const { fetchWithAuth } = useApi();
    const { user } = useAuthStore();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [progRes, appRes] = await Promise.all([
                fetchWithAuth("/programs?limit=8"),
                fetchWithAuth("/applications"),
            ]);

            if (progRes.ok) {
                const data = await progRes.json();
                setPrograms(data.programs);
            }
            if (appRes.ok) {
                const data = await appRes.json();
                setApplications(data.applications);
            }
        } catch {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }

    const handleSearch = async () => {
        const res = await fetchWithAuth(`/programs?search=${search}&limit=12`);
        if (res.ok) {
            const data = await res.json();
            setPrograms(data.programs);
        }
    };

    const handleApply = async (programId: number) => {
        const res = await fetchWithAuth("/applications", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success("Application submitted!");
            loadData();
        } else {
            toast.error(data.error);
        }
    };

    const handleSave = async (programId: number) => {
        const res = await fetchWithAuth("/saved", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        if (res.ok) {
            const data = await res.json();
            toast.success(data.message);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            {/* Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 mb-8">
                <h1 className="text-2xl font-bold mb-2">
                    Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
                </h1>
                <p className="text-blue-100 mb-6">
                    Discover programs and start your admissions journey
                </p>
                <div className="flex gap-2 max-w-xl">
                    <Input
                        placeholder="Search for programs or institutions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 h-11"
                    />
                    <Button
                        onClick={handleSearch}
                        className="bg-white text-blue-700 hover:bg-blue-50 h-11 px-6"
                    >
                        Search
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatsCard
                    title="Applications"
                    value={applications.length}
                    icon="📋"
                />
                <StatsCard
                    title="Accepted"
                    value={applications.filter((a) => a.status === "accepted").length}
                    icon="✅"
                />
                <StatsCard
                    title="Pending"
                    value={applications.filter((a) => a.status === "submitted").length}
                    icon="⏳"
                />
            </div>

            {/* Explore Programs */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Explore Programs</h2>
                    <Link href="/student/explore">
                        <Button variant="ghost" className="text-blue-600">
                            View All →
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {programs.map((program) => (
                        <Card
                            key={program.id}
                            className="hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden group"
                        >
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base line-clamp-2">
                                    {program.title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {program.institution.name}
                                </p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {program.category && (
                                        <Badge variant="secondary" className="text-xs">
                                            {program.category}
                                        </Badge>
                                    )}
                                    {program.institution.city && (
                                        <Badge variant="outline" className="text-xs">
                                            📍 {program.institution.city}
                                        </Badge>
                                    )}
                                </div>
                                {program.duration && (
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Duration: {program.duration}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                                        onClick={() => handleApply(program.id)}
                                    >
                                        Apply
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => handleSave(program.id)}
                                    >
                                        💾
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Application Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-lg mb-2">No applications yet</p>
                            <p className="text-sm">
                                Browse programs above and submit your first application!
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Program</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Institution</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id} className="border-b last:border-0">
                                            <td className="py-3 text-sm font-medium">
                                                {app.program.title}
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {app.program.institution.name}
                                            </td>
                                            <td className="py-3">
                                                <StatusBadge status={app.status} />
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {new Date(app.created_at).toLocaleDateString()}
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
