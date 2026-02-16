"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Institution {
    id: number;
    name: string;
    category: string | null;
    city: string | null;
    contact_email: string | null;
    status: string;
    created_at: string;
    user: { email: string | null };
}

export default function AdminInstitutionsPage() {
    const { fetchWithAuth } = useApi();
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [filter, setFilter] = useState("pending");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInstitutions();
    }, [filter]);

    async function loadInstitutions() {
        setIsLoading(true);
        const res = await fetchWithAuth(`/admin/institutions?status=${filter}`);
        if (res.ok) {
            const data = await res.json();
            setInstitutions(data.institutions);
        }
        setIsLoading(false);
    }

    const handleAction = async (id: number, status: "approved" | "rejected") => {
        const res = await fetchWithAuth(`/admin/institutions/${id}`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            toast.success(`Institution ${status}`);
            loadInstitutions();
        }
    };

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold mb-6">Manage Institutions</h1>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {["pending", "approved", "rejected"].map((s) => (
                    <Button
                        key={s}
                        variant={filter === s ? "default" : "outline"}
                        size="sm"
                        className={filter === s ? "bg-blue-600 hover:bg-blue-700" : ""}
                        onClick={() => setFilter(s)}
                    >
                        <span className="capitalize">{s}</span>
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)} Institutions ({institutions.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : institutions.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No {filter} institutions</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Name</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Email</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Category</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">City</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Registered</th>
                                        {filter === "pending" && (
                                            <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {institutions.map((inst) => (
                                        <tr key={inst.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 text-sm font-medium">{inst.name}</td>
                                            <td className="py-3 text-sm text-muted-foreground">{inst.user.email || inst.contact_email || "—"}</td>
                                            <td className="py-3 text-sm text-muted-foreground">{inst.category || "—"}</td>
                                            <td className="py-3 text-sm text-muted-foreground">{inst.city || "—"}</td>
                                            <td className="py-3"><StatusBadge status={inst.status} /></td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {new Date(inst.created_at).toLocaleDateString()}
                                            </td>
                                            {filter === "pending" && (
                                                <td className="py-3">
                                                    <div className="flex gap-1">
                                                        <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction(inst.id, "approved")}>
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleAction(inst.id, "rejected")}>
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
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
