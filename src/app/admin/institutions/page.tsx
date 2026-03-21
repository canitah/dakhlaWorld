"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { message } from "antd";
import { Download, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { exportToCSV } from "@/lib/export-csv";

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
    const [filter, setFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get("status");
        if (urlStatus && ["all", "pending", "approved", "rejected", "cancelled"].includes(urlStatus)) {
            setFilter(urlStatus);
        }
    }, []);

    const [selectedInst, setSelectedInst] = useState<Institution | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<Institution | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [cancelTarget, setCancelTarget] = useState<Institution | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadInstitutions();
    }, [filter]);

    async function loadInstitutions() {
        setIsLoading(true);
        const query = filter === "all" ? "" : `?status=${filter}`;
        const res = await fetchWithAuth(`/admin/institutions${query}`);
        if (res.ok) {
            const data = await res.json();
            setInstitutions(data.institutions);
        }
        setIsLoading(false);
    }

    const handleAction = async (id: number, status: "approved" | "rejected" | "cancelled", reason?: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetchWithAuth(`/admin/institutions/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
            });
            if (res.ok) {
                message.success(`Institution ${status}`);
                setIsDetailOpen(false);
                setIsRejectOpen(false);
                setRejectReason("");
                setRejectTarget(null);
                setIsCancelOpen(false);
                setCancelReason("");
                setCancelTarget(null);
                loadInstitutions();
            } else {
                const data = await res.json();
                message.error(data.error || "Action failed");
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

    const openCancelDialog = (inst: Institution) => {
        setCancelTarget(inst);
        setCancelReason("");
        setIsCancelOpen(true);
    };

    const viewDetail = (inst: Institution) => {
        setSelectedInst(inst);
        setIsDetailOpen(true);
    };

    const exportInstitutions = () => {
        const data = institutions.map((i) => ({
            Name: i.name,
            "Account Email": i.user.email || "—",
            "Contact Email": i.contact_email || "—",
            Phone: i.user.phone || "—",
            Category: i.category || "—",
            City: i.city || "—",
            Programs: i._count.programs,
            "Profile Status": isProfileComplete(i) ? "Complete" : "Incomplete",
            Status: i.status,
            Registered: new Date(i.created_at).toLocaleDateString(),
        }));
        exportToCSV(data, "institutions_export");
        message.success(`Exported ${data.length} institutions`);
    };

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-bold">Manage Institutions</h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Horizontal Scrollable Filters on Mobile */}
                    <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 no-scrollbar">
                        {["all", "pending", "approved", "rejected", "cancelled"].map((s) => (
                            <Button
                                key={s}
                                variant={filter === s ? "default" : "outline"}
                                size="sm"
                                className={`capitalize whitespace-nowrap ${filter === s ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                                onClick={() => setFilter(s)}
                            >
                                {s}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 w-full sm:w-auto justify-center"
                        onClick={exportInstitutions}
                        disabled={institutions.length === 0}
                    >
                        <Download className="size-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-none md:border md:shadow-sm">
                <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg">
                        {filter.charAt(0).toUpperCase() + filter.slice(1)} Institutions ({institutions.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-2 md:px-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : institutions.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">No {filter} institutions found.</p>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Name</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Contact</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Profile</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {institutions.map((inst) => (
                                            <tr key={inst.id} className="border-b last:border-0 hover:bg-accent/50">
                                                <td className="py-4">
                                                    <p className="text-sm font-medium">{inst.name}</p>
                                                    <p className="text-xs text-muted-foreground">{inst.category || "—"}</p>
                                                </td>
                                                <td className="py-4 text-sm">
                                                    {inst.user.email || inst.contact_email || "—"}
                                                </td>
                                                <td className="py-4">
                                                    {isProfileComplete(inst) ? (
                                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-medium">✓ Complete</span>
                                                    ) : (
                                                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-medium">⚠ Incomplete</span>
                                                    )}
                                                </td>
                                                <td className="py-4">
                                                    <StatusBadge status={inst.status} />
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => viewDetail(inst)}>View</Button>
                                                        {inst.status === "pending" && (
                                                            <>
                                                                <Button 
                                                                    size="sm" 
                                                                    className="bg-emerald-600 hover:bg-emerald-700" 
                                                                    disabled={!isProfileComplete(inst) || isSubmitting}
                                                                    onClick={() => handleAction(inst.id, "approved")}
                                                                >Approve</Button>
                                                                <Button size="sm" variant="destructive" onClick={() => openRejectDialog(inst)} disabled={isSubmitting}>Reject</Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {institutions.map((inst) => (
                                    <div key={inst.id} className="border rounded-lg p-4 space-y-3 bg-card">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-sm">{inst.name}</h3>
                                                <p className="text-xs text-muted-foreground">{inst.category || "General"}</p>
                                            </div>
                                            <StatusBadge status={inst.status} />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="text-muted-foreground">City: <span className="text-foreground">{inst.city || "—"}</span></div>
                                            <div className="text-muted-foreground text-right">Programs: <span className="text-foreground font-medium">{inst._count.programs}</span></div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isProfileComplete(inst) ? (
                                                <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">● Profile Complete</span>
                                            ) : (
                                                <span className="text-[10px] uppercase tracking-wider text-amber-600 font-bold">● Incomplete Profile</span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
                                            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => viewDetail(inst)}>
                                                <Eye className="size-3 mr-1" /> View
                                            </Button>
                                            {inst.status === "pending" && (
                                                <>
                                                    <Button 
                                                        size="sm" 
                                                        className="flex-1 h-8 text-xs bg-emerald-600" 
                                                        disabled={!isProfileComplete(inst) || isSubmitting}
                                                        onClick={() => handleAction(inst.id, "approved")}
                                                    >
                                                        <CheckCircle className="size-3 mr-1" /> Approve
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive" 
                                                        className="flex-1 h-8 text-xs" 
                                                        onClick={() => openRejectDialog(inst)}
                                                        disabled={isSubmitting}
                                                    >
                                                        <XCircle className="size-3 mr-1" /> Reject
                                                    </Button>
                                                </>
                                            )}
                                            {inst.status === "approved" && (
                                                <Button 
                                                    size="sm" 
                                                    className="w-full h-8 text-xs bg-orange-600 text-white" 
                                                    onClick={() => openCancelDialog(inst)}
                                                    disabled={isSubmitting}
                                                >
                                                    <AlertCircle className="size-3 mr-1" /> Cancel Registration
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs remain mostly same but added max-w-[95vw] for mobile safety */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto rounded-lg">
                    <DialogHeader>
                        <DialogTitle>Institution Details</DialogTitle>
                    </DialogHeader>
                    {selectedInst && (() => {
                        const complete = isProfileComplete(selectedInst);
                        const missing = getMissingFields(selectedInst);
                        return (
                            <div className="space-y-6">
                                {!complete ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800">
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <AlertCircle className="size-4" /> Profile Incomplete
                                        </p>
                                        <p className="text-xs mt-1">Missing: {missing.join(", ")}</p>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-800">
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <CheckCircle className="size-4" /> Profile Ready for Review
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DetailItem label="Name" value={selectedInst.name} />
                                    <DetailItem label="Category" value={selectedInst.category} />
                                    <DetailItem label="City" value={selectedInst.city} />
                                    <DetailItem label="Email" value={selectedInst.contact_email || selectedInst.user.email} />
                                    <DetailItem label="Phone" value={selectedInst.user.phone} />
                                    <DetailItem label="Programs" value={selectedInst._count.programs.toString()} />
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Description</p>
                                    <p className="text-sm leading-relaxed">{selectedInst.description || "No description provided."}</p>
                                </div>

                                <div className="flex flex-col gap-2 pt-4 border-t">
                                    {selectedInst.status === "pending" && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button 
                                                className="bg-emerald-600" 
                                                disabled={!complete || isSubmitting}
                                                onClick={() => handleAction(selectedInst.id, "approved")}
                                            >Approve</Button>
                                            <Button 
                                                variant="destructive" 
                                                onClick={() => { setIsDetailOpen(false); openRejectDialog(selectedInst); }}
                                            >Reject</Button>
                                        </div>
                                    )}
                                    {selectedInst.status === "approved" && (
                                        <Button 
                                            className="bg-orange-600 text-white" 
                                            onClick={() => { setIsDetailOpen(false); openCancelDialog(selectedInst); }}
                                        >Cancel Registration</Button>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Rejection/Cancellation Dialogs with mobile width fix */}
            <Dialog open={isRejectOpen} onOpenChange={(open) => { if (!open) { setIsRejectOpen(false); setRejectTarget(null); } }}>
                <DialogContent className="max-w-[95vw] md:max-w-md rounded-lg">
                    <DialogHeader><DialogTitle>Reject Institution</DialogTitle></DialogHeader>
                    {rejectTarget && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Rejecting <strong>{rejectTarget.name}</strong>. Reason (optional):</p>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                                <Button variant="destructive" disabled={isSubmitting} onClick={() => handleAction(rejectTarget.id, "rejected", rejectReason.trim())}>
                                    Confirm Rejection
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancellation Dialog logic similarly follows Reject Dialog */}
            <Dialog open={isCancelOpen} onOpenChange={(open) => { if (!open) { setIsCancelOpen(false); setCancelTarget(null); } }}>
                <DialogContent className="max-w-[95vw] md:max-w-md rounded-lg">
                    <DialogHeader><DialogTitle>Cancel Registration</DialogTitle></DialogHeader>
                    {cancelTarget && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground font-medium text-red-600">This action is permanent.</p>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Mandatory reason for cancellation..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setIsCancelOpen(false)}>Back</Button>
                                <Button className="bg-orange-600 text-white" disabled={isSubmitting || !cancelReason.trim()} onClick={() => handleAction(cancelTarget.id, "cancelled", cancelReason.trim())}>
                                    Confirm Cancellation
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}

// Helper Component for Details
function DetailItem({ label, value }: { label: string, value: string | null }) {
    return (
        <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
            <p className="text-sm truncate">{value || "—"}</p>
        </div>
    );
}