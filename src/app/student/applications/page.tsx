"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Application {
    id: number;
    status: string;
    created_at: string;
    program: {
        title: string;
        category: string | null;
        institution: { name: string; city: string | null };
    };
}

export default function StudentApplicationsPage() {
    const { fetchWithAuth } = useApi();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const res = await fetchWithAuth("/applications");
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications);
            }
            setIsLoading(false);
        }
        load();
    }, []);

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
            <h1 className="text-2xl font-bold mb-6">My Applications</h1>

            {applications.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p className="text-lg mb-2">No applications yet</p>
                        <p className="text-sm">Visit the Explore page to find and apply to programs.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Applications ({applications.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Program</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Institution</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Category</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Applied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 text-sm font-medium">{app.program.title}</td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {app.program.institution.name}
                                            </td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {app.program.category || "—"}
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
                    </CardContent>
                </Card>
            )}
        </DashboardLayout>
    );
}
