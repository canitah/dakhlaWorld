"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Institution {
    id: number;
    name: string;
    category: string | null;
    city: string | null;
    description: string | null;
    contact_email: string | null;
    status: string;
    created_at: string;
    user: { email: string | null; phone: string | null };
    _count: { programs: number };
}

const REQUIRED_FIELDS: { key: keyof Institution; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "city", label: "City" },
    { key: "description", label: "Description" },
    { key: "contact_email", label: "Contact Email" },
];

function isProfileComplete(inst: Institution): boolean {
    return REQUIRED_FIELDS.every(
        (f) => inst[f.key] && String(inst[f.key]).trim() !== ""
    );
}

function getMissingFields(inst: Institution): string[] {
    return REQUIRED_FIELDS
        .filter((f) => !inst[f.key] || String(inst[f.key]).trim() === "")
        .map((f) => f.label);
}

export default function AdminInstitutionsPage() {
    const { fetchWithAuth } = useApi();
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [filter, setFilter] = useState("pending");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInst, setSelectedInst] = useState<Institution | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<Institution | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleAction = async (id: number, status: "approved" | "rejected", reason?: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetchWithAuth(`/admin/institutions/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
            });
            if (res.ok) {
                toast.success(`Institution ${status}`);
                setIsDetailOpen(false);
                setIsRejectOpen(false);
                setRejectReason("");
                setRejectTarget(null);
                loadInstitutions();
            } else {
                const data = await res.json();
                toast.error(data.error || "Action failed");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const openRejectDialog = (inst: Institution) => {
        setRejectTarget(inst);
        setRejectReason("");
        setIsRejectOpen(true);
    };

    const viewDetail = (inst: Institution) => {
        setSelectedInst(inst);
        setIsDetailOpen(true);
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
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Name</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Email</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Category</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">City</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Profile</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Registered</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {institutions.map((inst) => {
                                        const complete = isProfileComplete(inst);
                                        return (
                                            <tr key={inst.id} className="border-b last:border-0 hover:bg-accent/50">
                                                <td className="py-3 text-sm font-medium">{inst.name}</td>
                                                <td className="py-3 text-sm text-muted-foreground">{inst.user.email || inst.contact_email || "—"}</td>
                                                <td className="py-3 text-sm text-muted-foreground">{inst.category || "—"}</td>
                                                <td className="py-3 text-sm text-muted-foreground">{inst.city || "—"}</td>
                                                <td className="py-3">
                                                    {complete ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                            ✓ Complete
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                            ⚠ Incomplete
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3"><StatusBadge status={inst.status} /></td>
                                                <td className="py-3 text-sm text-muted-foreground">
                                                    {new Date(inst.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => viewDetail(inst)}>
                                                            View
                                                        </Button>
                                                        {inst.status === "pending" && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700"
                                                                    disabled={!isProfileComplete(inst) || isSubmitting}
                                                                    onClick={() => handleAction(inst.id, "approved")}
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="text-xs h-7"
                                                                    disabled={isSubmitting}
                                                                    onClick={() => openRejectDialog(inst)}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Institution Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Institution Details</DialogTitle>
                    </DialogHeader>
                    {selectedInst && (() => {
                        const complete = isProfileComplete(selectedInst);
                        const missing = getMissingFields(selectedInst);
                        return (
                            <div className="space-y-4">
                                {/* Profile Completeness Banner */}
                                {!complete && (
                                    <div className="bg-amber-500/10 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                            ⚠️ Profile Incomplete — Cannot be approved
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                            Missing: {missing.join(", ")}
                                        </p>
                                    </div>
                                )}
                                {complete && (
                                    <div className="bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3">
                                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
                                            ✅ Profile Complete — Ready for review
                                        </p>
                                    </div>
                                )}

                                {/* Profile Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Institution Name</p>
                                        <p className="text-sm font-medium">{selectedInst.name || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Account Email</p>
                                        <p className="text-sm">{selectedInst.user.email || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Contact Email</p>
                                        <p className="text-sm">{selectedInst.contact_email || <span className="text-amber-600 italic">Not provided</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Category</p>
                                        <p className="text-sm capitalize">{selectedInst.category || <span className="text-amber-600 italic">Not provided</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">City</p>
                                        <p className="text-sm">{selectedInst.city || <span className="text-amber-600 italic">Not provided</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="text-sm">{selectedInst.user.phone || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Programs Listed</p>
                                        <p className="text-sm font-medium">{selectedInst._count.programs}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Registered</p>
                                        <p className="text-sm">{new Date(selectedInst.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <p className="text-xs text-muted-foreground">Description</p>
                                    <p className="text-sm mt-1">
                                        {selectedInst.description || <span className="text-amber-600 italic">Not provided</span>}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground">Current Status:</p>
                                    <StatusBadge status={selectedInst.status} />
                                </div>

                                {/* Action Buttons */}
                                {selectedInst.status === "pending" && (
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                            disabled={!complete}
                                            onClick={() => handleAction(selectedInst.id, "approved")}
                                        >
                                            {complete ? "✓ Approve" : "Cannot Approve (Incomplete Profile)"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => { setIsDetailOpen(false); openRejectDialog(selectedInst); }}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
            {/* Rejection Reason Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={(open) => { if (!open) { setIsRejectOpen(false); setRejectTarget(null); setRejectReason(""); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Institution</DialogTitle>
                    </DialogHeader>
                    {rejectTarget && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                You are rejecting <strong>{rejectTarget.name}</strong>. Please provide a reason for the rejection (optional but recommended).
                            </p>
                            <textarea
                                className="w-full min-h-[100px] rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="e.g. Incomplete documentation, unverifiable institution details..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => { setIsRejectOpen(false); setRejectTarget(null); setRejectReason(""); }}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={isSubmitting}
                                    onClick={() => handleAction(rejectTarget.id, "rejected", rejectReason.trim() || undefined)}
                                >
                                    {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
