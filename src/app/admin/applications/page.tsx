"use client";

import { useEffect, useState, useRef } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { exportToCSV } from "@/lib/export-csv";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { message, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import {
    Eye,
    CheckCircle,
    XCircle,
    FileText,
    Download,
    User,
    Calendar,
    GraduationCap,
    Building2,
    MessageSquare,
    Edit3,
    Search,
} from "lucide-react";

interface Application {
    id: number;
    application_code: string;
    status: string;
    created_at: string;
    student: {
        full_name: string | null;
        city: string | null;
        cv_url: string | null;
        user: { email: string | null };
    };
    program: {
        title: string;
        institution: { name: string } | null;
    };
    answers?: {
        id: number;
        answer: string;
        question: { question: string };
    }[];
}

export default function AdminApplicationsPage() {
    const { fetchWithAuth } = useApi();
    const [applications, setApplications] = useState<Application[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewApp, setReviewApp] = useState<Application | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editedApp, setEditedApp] = useState<Application | null>(null);
    const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
    const highlightRef = useRef<HTMLTableRowElement | null>(null);

    const filteredApplications = applications.filter((app) => {
        const query = searchQuery.toLowerCase();
        return (
            app.application_code.toLowerCase().includes(query) ||
            (app.student.full_name?.toLowerCase().includes(query)) ||
            (app.student.user.email?.toLowerCase().includes(query)) ||
            (app.student.city?.toLowerCase().includes(query))
        );
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get("status");
        if (urlStatus && ["submitted", "viewed", "accepted", "rejected"].includes(urlStatus)) {
            setFilter(urlStatus);
        }
    }, []);

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

    async function handleUpdateStatus(id: number, status: string) {
        setUpdatingId(id);
        try {
            const res = await fetchWithAuth(`/admin/applications/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                message.success(`Application ${status} successfully`);
                loadApplications();
                if (reviewApp?.id === id) {
                    setReviewApp({ ...reviewApp, status });
                }
            } else {
                const data = await res.json();
                message.error(data.error || "Failed to update status");
            }
        } catch {
            message.error("Something went wrong");
        } finally {
            setUpdatingId(null);
        }
    }

    function confirmStatusChange(id: number, status: string) {
        const labels: Record<string, { title: string; content: string; okText: string }> = {
            accepted: {
                title: "Accept Application",
                content: "Are you sure you want to accept this application? The student will be notified via email.",
                okText: "Accept",
            },
            rejected: {
                title: "Reject Application",
                content: "Are you sure you want to reject this application? The student will be notified via email.",
                okText: "Reject",
            },
        };

        const cfg = labels[status];
        if (!cfg) {
            handleUpdateStatus(id, status);
            return;
        }

        Modal.confirm({
            title: cfg.title,
            icon: <ExclamationCircleFilled />,
            content: cfg.content,
            okText: cfg.okText,
            okType: status === "rejected" ? "danger" : "primary",
            cancelText: "Cancel",
            onOk: () => handleUpdateStatus(id, status),
        });
    }

    async function handleSaveChanges() {
        if (!editedApp) return;
        setUpdatingId(editedApp.id);
        try {
            const res = await fetchWithAuth(`/admin/applications/${editedApp.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    student: editedApp.student,
                    program: editedApp.program,
                    status: editedApp.status,
                }),
            });
            if (res.ok) {
                message.success("Application updated successfully");
                setReviewApp(editedApp);
                setEditMode(false);
                loadApplications();
            } else {
                const data = await res.json();
                message.error(data.error || "Failed to save changes");
            }
        } catch {
            message.error("Something went wrong");
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <DashboardLayout role="admin">
            <div className="flex flex-col gap-4 mb-6">
                <h1 className="text-xl md:text-2xl font-bold">All Applications</h1>
                
                {/* Search Bar with Icon */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search student, email, city..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
                {/* Filters - Scrollable on mobile */}
                <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 w-full sm:w-auto no-scrollbar">
                    {["", "submitted", "viewed", "accepted", "rejected"].map((s) => (
                        <Button
                            key={s || "all"}
                            variant={filter === s ? "default" : "outline"}
                            size="sm"
                            className={`capitalize whitespace-nowrap ${filter === s ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                            onClick={() => { setFilter(s); setPage(1); }}
                        >
                            {s || "All"}
                        </Button>
                    ))}
                </div>

                <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                    onClick={() => {
                        if (applications.length === 0) return message.info("No applications to export");
                        exportToCSV(applications, "applications.csv");
                    }}
                >
                    <Download className="size-4" /> Export CSV
                </Button>
            </div>

            <Card className="border-none shadow-none md:border md:shadow-sm">
                <CardHeader className="px-4 md:px-6">
                    <CardTitle className="text-lg">Applications ({applications.length})</CardTitle>
                </CardHeader>
                <CardContent className="px-2 md:px-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : applications.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">No applications found</p>
                    ) : (
                        <>
                            {/* --- Desktop View --- */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 text-xs font-semibold uppercase text-muted-foreground">Code</th>
                                            <th className="pb-3 text-xs font-semibold uppercase text-muted-foreground">Student</th>
                                            <th className="pb-3 text-xs font-semibold uppercase text-muted-foreground">Program</th>
                                            <th className="pb-3 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                                            <th className="pb-3 text-xs font-semibold uppercase text-muted-foreground">Date</th>
                                            <th className="pb-3 text-xs font-semibold uppercase text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApplications.map((app) => (
                                            <tr key={app.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                                                <td className="py-4"><Badge variant="outline" className="font-mono text-[10px]">{app.application_code}</Badge></td>
                                                <td className="py-4">
                                                    <div className="text-sm font-medium">{app.student.full_name || "—"}</div>
                                                    <div className="text-xs text-muted-foreground">{app.student.user.email}</div>
                                                </td>
                                                <td className="py-4 text-sm">{app.program.title}</td>
                                                <td className="py-4"><StatusBadge status={app.status} /></td>
                                                <td className="py-4 text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</td>
                                                <td className="py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => { setReviewApp(app); setEditedApp(app); setEditMode(false); if(app.status === "submitted") handleUpdateStatus(app.id, "viewed"); }} className="text-blue-600 hover:underline text-xs flex items-center gap-1"><Eye className="size-3" /> View</button>
                                                        <button onClick={() => { setReviewApp(app); setEditedApp(app); setEditMode(true); }} className="text-gray-600 hover:underline text-xs flex items-center gap-1"><Edit3 className="size-3" /> Edit</button>
                                                        {app.status !== "accepted" && <button onClick={() => confirmStatusChange(app.id, "accepted")} className="text-emerald-600 hover:underline text-xs flex items-center gap-1"><CheckCircle className="size-3" /> Accept</button>}
                                                        {app.status !== "rejected" && <button onClick={() => confirmStatusChange(app.id, "rejected")} className="text-red-600 hover:underline text-xs flex items-center gap-1"><XCircle className="size-3" /> Reject</button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* --- Mobile View (Cards) --- */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {filteredApplications.map((app) => (
                                    <div key={app.id} className="border rounded-xl p-4 space-y-4 bg-white shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <Badge variant="outline" className="font-mono text-[10px]">{app.application_code}</Badge>
                                            <StatusBadge status={app.status} />
                                        </div>
                                        
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-50 p-2 rounded-full">
                                                <User className="size-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{app.student.full_name || "—"}</p>
                                                <p className="text-xs text-muted-foreground">{app.student.user.email}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs border-y py-3">
                                            <div>
                                                <p className="text-muted-foreground mb-1">Program</p>
                                                <p className="font-medium flex items-center gap-1"><GraduationCap className="size-3" /> {app.program.title}</p>
                                            </div>
                                            <div className="text-right sm:text-left">
                                                <p className="text-muted-foreground mb-1">Applied Date</p>
                                                <p className="font-medium flex items-center justify-end sm:justify-start gap-1"><Calendar className="size-3" /> {new Date(app.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={() => { setReviewApp(app); setEditedApp(app); setEditMode(false); if(app.status === "submitted") handleUpdateStatus(app.id, "viewed"); }}>
                                                <Eye className="size-3 mr-1" /> View
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={() => { setReviewApp(app); setEditedApp(app); setEditMode(true); }}>
                                                <Edit3 className="size-3 mr-1" /> Edit
                                            </Button>
                                            <div className="w-full flex gap-2">
                                                {app.status !== "accepted" && (
                                                    <Button className="flex-1 bg-emerald-600 h-9 text-xs" onClick={() => confirmStatusChange(app.id, "accepted")}>
                                                        <CheckCircle className="size-3 mr-1" /> Accept
                                                    </Button>
                                                )}
                                                {app.status !== "rejected" && (
                                                    <Button variant="destructive" className="flex-1 h-9 text-xs" onClick={() => confirmStatusChange(app.id, "rejected")}>
                                                        <XCircle className="size-3 mr-1" /> Reject
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                            <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                            <span className="text-xs font-medium text-muted-foreground px-4">Page {page} of {totalPages}</span>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Application Detail Dialog with max-width fix for mobile */}
            <Dialog open={!!reviewApp} onOpenChange={(open) => !open && setReviewApp(null)}>
                <DialogContent className="max-w-[95vw] md:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl p-4 md:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <FileText className="size-5 text-blue-500" />
                            {editMode ? "Edit Application" : "Application Review"}
                        </DialogTitle>
                    </DialogHeader>
                    {reviewApp && editedApp && (
                        <div className="space-y-6 pt-2">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="font-mono">{editedApp.application_code}</Badge>
                                <StatusBadge status={editedApp.status} />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Student Section */}
                                <div className="p-4 rounded-xl border bg-slate-50/50 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                                        <User className="size-4" /> Student Info
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Full Name</p>
                                            {editMode ? (
                                                <input className="w-full text-sm p-2 border rounded" value={editedApp.student.full_name || ""} onChange={(e) => setEditedApp({ ...editedApp, student: { ...editedApp.student, full_name: e.target.value } })} />
                                            ) : (
                                                <p className="text-sm font-medium">{editedApp.student.full_name || "—"}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">City</p>
                                            {editMode ? (
                                                <input className="w-full text-sm p-2 border rounded" value={editedApp.student.city || ""} onChange={(e) => setEditedApp({ ...editedApp, student: { ...editedApp.student, city: e.target.value } })} />
                                            ) : (
                                                <p className="text-sm font-medium">{editedApp.student.city || "—"}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Email</p>
                                        <p className="text-sm truncate font-medium">{editedApp.student.user.email || "—"}</p>
                                    </div>
                                    {editedApp.student.cv_url && (
                                        <a href={editedApp.student.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors w-full justify-center">
                                            <Download className="size-3" /> Download Student CV
                                        </a>
                                    )}
                                </div>

                                {/* Program Section */}
                                <div className="p-4 rounded-xl border bg-slate-50/50 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                                        <GraduationCap className="size-4" /> Program Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Applied Program</p>
                                            <p className="text-sm font-bold">{editedApp.program.title}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Institution</p>
                                            <p className="text-sm flex items-center gap-1"><Building2 className="size-3" /> {editedApp.program.institution?.name || "DAKHLA Platform"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Answers Section */}
                            {reviewApp.answers && reviewApp.answers.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
                                        <MessageSquare className="size-4" /> Questionnaire
                                    </h4>
                                    {reviewApp.answers.map((a, idx) => (
                                        <div key={a.id} className="p-3 rounded-lg border bg-white shadow-sm">
                                            <p className="text-[11px] font-bold text-muted-foreground mb-1">Q{idx + 1}: {a.question.question}</p>
                                            <p className="text-sm text-foreground whitespace-pre-wrap">{a.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Dialog Actions */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t sticky bottom-0 bg-white pb-2">
                                {editMode ? (
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 h-10" disabled={updatingId === editedApp.id} onClick={handleSaveChanges}>
                                        Save Changes
                                    </Button>
                                ) : (
                                    <>
                                        {reviewApp.status !== "accepted" && (
                                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-10" disabled={updatingId === reviewApp.id} onClick={() => confirmStatusChange(reviewApp.id, "accepted")}>
                                                <CheckCircle className="size-4 mr-2" /> Accept
                                            </Button>
                                        )}
                                        {reviewApp.status !== "rejected" && (
                                            <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 h-10" disabled={updatingId === reviewApp.id} onClick={() => confirmStatusChange(reviewApp.id, "rejected")}>
                                                <XCircle className="size-4 mr-2" /> Reject
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}