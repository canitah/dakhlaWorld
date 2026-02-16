"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentRequest {
    id: number;
    status: string;
    transaction_ref: string | null;
    screenshot_url: string | null;
    created_at: string;
    plan: { name: string; price_pkr: number };
    institution: { name: string };
}

export default function AdminPaymentsPage() {
    const { fetchWithAuth } = useApi();
    const [requests, setRequests] = useState<PaymentRequest[]>([]);
    const [filter, setFilter] = useState("pending");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, [filter]);

    async function loadRequests() {
        setIsLoading(true);
        const res = await fetchWithAuth(`/admin/billing?status=${filter}`);
        if (res.ok) {
            const data = await res.json();
            setRequests(data.requests);
        }
        setIsLoading(false);
    }

    const handleVerify = async (id: number, status: "approved" | "rejected") => {
        const res = await fetchWithAuth(`/admin/billing/${id}`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            toast.success(`Payment ${status}`);
            loadRequests();
        }
    };

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold mb-6">Manage Payments</h1>

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
                    <CardTitle>Payment Requests ({requests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No {filter} payment requests</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Institution</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Plan</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Amount</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Reference</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Screenshot</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                                        {filter === "pending" && (
                                            <th className="pb-3 text-sm font-semibold text-gray-600">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((req) => (
                                        <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 text-sm font-medium">{req.institution.name}</td>
                                            <td className="py-3 text-sm">{req.plan.name}</td>
                                            <td className="py-3 text-sm">PKR {req.plan.price_pkr.toLocaleString()}</td>
                                            <td className="py-3 text-sm text-muted-foreground">{req.transaction_ref || "—"}</td>
                                            <td className="py-3 text-sm">
                                                {req.screenshot_url ? (
                                                    <a href={req.screenshot_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                        View
                                                    </a>
                                                ) : "—"}
                                            </td>
                                            <td className="py-3"><StatusBadge status={req.status} /></td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                            {filter === "pending" && (
                                                <td className="py-3">
                                                    <div className="flex gap-1">
                                                        <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleVerify(req.id, "approved")}>
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleVerify(req.id, "rejected")}>
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
