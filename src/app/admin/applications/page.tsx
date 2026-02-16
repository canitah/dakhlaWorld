"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Application {
    id: number;
    status: string;
    created_at: string;
    student: {
        full_name: string | null;
        user: { email: string | null };
    };
    program: {
        title: string;
        institution: { name: string };
    };
}

export default function AdminApplicationsPage() {
    const { fetchWithAuth } = useApi();
    const [applications, setApplications] = useState<Application[]>([]);
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, [filter, page]);

    async function loadApplications() {
        setIsLoading(true);
        const params = new URLSearchParams({
            page: page.toString(),
            limit: "20",
            ...(filter && { status: filter }),
        });
        const res = await fetchWithAuth(`/admin/applications?${params}`);
        if (res.ok) {
            const data = await res.json();
            setApplications(data.applications);
            setTotalPages(data.pagination.totalPages);
        }
        setIsLoading(false);
    }

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold mb-6">All Applications</h1>

            <div className="flex gap-2 mb-6">
                {["", "submitted", "viewed", "accepted", "rejected"].map((s) => (
                    <Button
                        key={s || "all"}
                        variant={filter === s ? "default" : "outline"}
                        size="sm"
                        className={filter === s ? "bg-blue-600 hover:bg-blue-700" : ""}
                        onClick={() => { setFilter(s); setPage(1); }}
                    >
                        {s || "All"}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Applications ({applications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : applications.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No applications found</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 text-sm font-semibold text-gray-600">Student</th>
                                            <th className="pb-3 text-sm font-semibold text-gray-600">Program</th>
                                            <th className="pb-3 text-sm font-semibold text-gray-600">Institution</th>
                                            <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                                            <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app) => (
                                            <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="py-3">
                                                    <p className="text-sm font-medium">{app.student.full_name || "—"}</p>
                                                    <p className="text-xs text-muted-foreground">{app.student.user.email}</p>
                                                </td>
                                                <td className="py-3 text-sm">{app.program.title}</td>
                                                <td className="py-3 text-sm text-muted-foreground">{app.program.institution.name}</td>
                                                <td className="py-3"><StatusBadge status={app.status} /></td>
                                                <td className="py-3 text-sm text-muted-foreground">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                                    <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                                    <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
