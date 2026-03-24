"use client";

import { useEffect, useState, useMemo } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { message } from "antd";
import { Download, ExternalLink, Calendar, CreditCard, Banknote, Building2, Search, X, Eye } from "lucide-react";
import { exportToCSV } from "@/lib/export-csv";

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
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get("status");
        if (urlStatus && ["all", "pending", "approved", "rejected"].includes(urlStatus)) {
            setFilter(urlStatus);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [filter]);

    async function loadRequests() {
        setIsLoading(true);
        const res = await fetchWithAuth(`/admin/billing${filter !== "all" ? `?status=${filter}` : ""}`);
        if (res.ok) {
            const data = await res.json();
            setRequests(data.requests);
        }
        setIsLoading(false);
    }

    const filteredRequests = useMemo(() => {
        return requests.filter((req) =>
            req.institution.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [requests, searchQuery]);

    const handleVerify = async (id: number, status: "approved" | "rejected") => {
        const res = await fetchWithAuth(`/admin/billing/${id}`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            message.success(`Payment ${status}`);
            loadRequests();
        }
    };

    const exportPayments = () => {
        const data = filteredRequests.map((r) => ({
            Institution: r.institution.name,
            Plan: r.plan.name,
            "Amount (PKR)": r.plan.price_pkr,
            "Transaction Ref": r.transaction_ref || "—",
            Status: r.status,
            "Screenshot URL": r.screenshot_url || "—",
            Date: new Date(r.created_at).toLocaleDateString(),
        }));
        exportToCSV(data, "payments_export");
        message.success(`Exported ${data.length} records`);
    };

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-bold">Manage Payments</h1>
                
                <div className="relative w-full max-w-sm mr-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search institution..."
                        className="pl-10 pr-10 w-full h-9 text-sm bg-transparent border-muted-foreground/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 no-scrollbar">
                        {["all", "pending", "approved", "rejected"].map((s) => (
                            <Button
                                key={s}
                                variant={filter === s ? "default" : "outline"}
                                size="sm"
                                className={`capitalize whitespace-nowrap transition-all ${filter === s ? "bg-blue-600 hover:bg-blue-700 shadow-md border-blue-600" : "bg-transparent hover:bg-blue-50/50 dark:hover:bg-blue-900/20"}`}
                                onClick={() => setFilter(s)}
                            >
                                {s}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full sm:w-auto justify-center bg-transparent border-muted-foreground/20"
                        onClick={exportPayments}
                        disabled={filteredRequests.length === 0}
                    >
                        <Download className="size-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card className="bg-transparent border-none shadow-none md:border md:shadow-sm dark:bg-black/10">
                <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg">
                        Payment Requests ({filteredRequests.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-2 md:px-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">
                            {searchQuery ? `No results found for "${searchQuery}"` : `No ${filter} payment requests`}
                        </p>
                    ) : (
                        <>
                            {/* --- Desktop View (Table) --- */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Institution</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Plan</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Amount</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Screenshot</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-muted/20">
                                        {filteredRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                                <td className="py-4 text-sm font-medium">{req.institution.name}</td>
                                                <td className="py-4 text-sm">{req.plan.name}</td>
                                                <td className="py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">PKR {req.plan.price_pkr.toLocaleString()}</td>
                                                <td className="py-4 text-sm">
                                                    {req.screenshot_url ? (
                                                        <a href={req.screenshot_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                            View <ExternalLink className="size-3" />
                                                        </a>
                                                    ) : "—"}
                                                </td>
                                                <td className="py-4"><StatusBadge status={req.status} /></td>
                                                <td className="py-4">
                                                    <div className="flex justify-end gap-2">
                                                        {req.status !== "approved" && (
                                                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8" onClick={() => handleVerify(req.id, "approved")}>Approve</Button>
                                                        )}
                                                        {req.status !== "rejected" && (
                                                            <Button size="sm" variant="destructive" className="h-8" onClick={() => handleVerify(req.id, "rejected")}>Reject</Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* --- Mobile View (Cards) --- */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {filteredRequests.map((req) => (
                                    <div 
                                        key={req.id} 
                                        className="border rounded-xl overflow-hidden bg-white dark:bg-black/40 hover:border-blue-400 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                                        onClick={() => req.screenshot_url && window.open(req.screenshot_url, '_blank')}
                                    >
                                        {/* Institution Header - Blue Theme */}
                                        <div className="bg-blue-50 dark:bg-black px-4 py-3 border-b border-blue-100 dark:border-blue-900/50 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-600 rounded-lg">
                                                    <Building2 className="size-3.5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-sm text-blue-900 dark:text-blue-100">{req.institution.name}</h3>
                                            </div>
                                            <StatusBadge status={req.status} />
                                        </div>

                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground flex items-center gap-1"><CreditCard className="size-3" /> Plan</p>
                                                    <p className="font-medium">{req.plan.name}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground flex items-center gap-1"><Banknote className="size-3" /> Amount</p>
                                                    <p className="font-bold text-blue-600 dark:text-blue-400">PKR {req.plan.price_pkr.toLocaleString()}</p>
                                                </div>
                                                <div className="space-y-1 col-span-2 border-t pt-2">
                                                    <p className="text-muted-foreground flex items-center gap-1"><Calendar className="size-3" /> Date</p>
                                                    <p className="text-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {/* View Screenshot Button - explicitly added back */}
                                                {req.screenshot_url && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        className="w-full h-9 text-xs gap-2 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400"
                                                        onClick={(e) => { e.stopPropagation(); window.open(req.screenshot_url!, '_blank'); }}
                                                    >
                                                        <Eye className="size-3.5" /> View Screenshot
                                                    </Button>
                                                )}
                                                
                                                <div className="flex gap-2">
                                                    {req.status !== "approved" && (
                                                        <Button 
                                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-9 text-xs" 
                                                            onClick={(e) => { e.stopPropagation(); handleVerify(req.id, "approved"); }}
                                                        >
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {req.status !== "rejected" && (
                                                        <Button 
                                                            variant="destructive" 
                                                            className="flex-1 h-9 text-xs" 
                                                            onClick={(e) => { e.stopPropagation(); handleVerify(req.id, "rejected"); }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}