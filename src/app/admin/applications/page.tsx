"use client";

import { useEffect, useState, useRef } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    ExternalLink,
    Download,
    User,
    Calendar,
    GraduationCap,
    Building2,
    MessageSquare,
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
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [reviewApp, setReviewApp] = useState<Application | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // Highlight support from notification click
    const [highlightId, setHighlightId] = useState<number | null>(null);
    const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
    const highlightRef = useRef<HTMLTableRowElement | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get("status");
        const h = params.get("highlight");
        if (urlStatus && ["submitted", "viewed", "accepted", "rejected"].includes(urlStatus)) {
            setFilter(urlStatus);
        }
        if (h) setHighlightId(parseInt(h));
    }, []);

    useEffect(() => {
        loadApplications();
    }, [filter, page]);

    useEffect(() => {
        if (applications.length === 0 || !highlightId) return;
        setActiveHighlight(highlightId);
        setTimeout(() => {
            highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
        const timer = setTimeout(() => setActiveHighlight(null), 4000);
        return () => clearTimeout(timer);
    }, [highlightId, applications]);

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
                // Update review dialog if open
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
                content: "Are you sure you want to accept this application? The student will be notified via email from DAKHLA Platform.",
                okText: "Accept",
            },
            rejected: {
                title: "Reject Application",
                content: "Are you sure you want to reject this application? The student will be notified via email from DAKHLA Platform.",
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

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold mb-6">All Applications</h1>

            <div className="flex gap-2 mb-6 flex-wrap">
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
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Code</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Student</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Program</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Institution</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                                            <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app) => (
                                            <tr
                                                key={app.id}
                                                ref={app.id === activeHighlight ? highlightRef : undefined}
                                                className={`border-b last:border-0 hover:bg-accent/50 transition-all duration-500 ${app.id === activeHighlight
                                                    ? "bg-blue-500/10 ring-1 ring-blue-500/30 animate-pulse"
                                                    : ""
                                                    }`}
                                            >
                                                <td className="py-3">
                                                    <Badge variant="outline" className="text-[11px] font-mono">
                                                        {app.application_code}
                                                    </Badge>
                                                </td>
                                                <td className="py-3">
                                                    <p className="text-sm font-medium">{app.student.full_name || "—"}</p>
                                                    <p className="text-xs text-muted-foreground">{app.student.user.email}</p>
                                                </td>
                                                <td className="py-3 text-sm">{app.program.title}</td>
                                                <td className="py-3 text-sm text-muted-foreground">{app.program.institution?.name || "DAKHLA Platform"}</td>
                                                <td className="py-3"><StatusBadge status={app.status} /></td>
                                                <td className="py-3 text-sm text-muted-foreground">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        {/* View */}
                                                        <button
                                                            onClick={() => {
                                                                setReviewApp(app);
                                                                if (app.status === "submitted") {
                                                                    handleUpdateStatus(app.id, "viewed");
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                                                            title="View Details"
                                                        >
                                                            <Eye className="size-3.5" />
                                                            View
                                                        </button>

                                                        {/* Accept */}
                                                        {app.status !== "accepted" && (
                                                            <button
                                                                onClick={() => confirmStatusChange(app.id, "accepted")}
                                                                disabled={updatingId === app.id}
                                                                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer disabled:opacity-50"
                                                                title="Accept"
                                                            >
                                                                <CheckCircle className="size-3.5" />
                                                                Accept
                                                            </button>
                                                        )}

                                                        {/* Reject */}
                                                        {app.status !== "rejected" && (
                                                            <button
                                                                onClick={() => confirmStatusChange(app.id, "rejected")}
                                                                disabled={updatingId === app.id}
                                                                className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 hover:underline cursor-pointer disabled:opacity-50"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="size-3.5" />
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
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

            {/* ─── Application Detail Dialog ─── */}
            <Dialog open={!!reviewApp} onOpenChange={(open) => !open && setReviewApp(null)}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <FileText className="size-5 text-blue-500" />
                            Application Review
                        </DialogTitle>
                    </DialogHeader>
                    {reviewApp && (
                        <div className="space-y-5">
                            {/* Application Code & Status */}
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs font-mono">
                                    {reviewApp.application_code}
                                </Badge>
                                <StatusBadge status={reviewApp.status} />
                            </div>

                            {/* Student Info */}
                            <div className="p-4 rounded-lg border border-border bg-accent/30 space-y-2">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    <User className="size-4 text-blue-500" />
                                    Student Information
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">Name</span>
                                        <p className="text-foreground font-medium">{reviewApp.student.full_name || "—"}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">Email</span>
                                        <p className="text-foreground">{reviewApp.student.user.email || "—"}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">City</span>
                                        <p className="text-foreground">{reviewApp.student.city || "—"}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">CV</span>
                                        {reviewApp.student.cv_url ? (
                                            <a
                                                href={reviewApp.student.cv_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                            >
                                                <Download className="size-3" /> View CV
                                            </a>
                                        ) : (
                                            <p className="text-foreground">Not uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Program Details */}
                            <div className="p-4 rounded-lg border border-border bg-accent/30 space-y-2">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                    <GraduationCap className="size-4 text-blue-500" />
                                    Program Details
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">Program</span>
                                        <p className="text-foreground font-medium">{reviewApp.program.title}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">Institution</span>
                                        <p className="text-foreground flex items-center gap-1">
                                            <Building2 className="size-3 text-muted-foreground" />
                                            {reviewApp.program.institution?.name || "DAKHLA Platform"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">Applied On</span>
                                        <p className="text-foreground flex items-center gap-1">
                                            <Calendar className="size-3 text-muted-foreground" />
                                            {new Date(reviewApp.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submitted Answers */}
                            {reviewApp.answers && reviewApp.answers.length > 0 ? (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                        <MessageSquare className="size-4 text-blue-500" />
                                        Submitted Answers
                                    </h4>
                                    {reviewApp.answers.map((a, idx) => (
                                        <div key={a.id} className="p-3 rounded-lg border border-border bg-background">
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Q{idx + 1}: {a.question.question}</p>
                                            <p className="text-sm text-foreground whitespace-pre-wrap">{a.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg border border-border bg-accent/30 text-center">
                                    <p className="text-sm text-muted-foreground">No additional questions were required for this application.</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                                {reviewApp.status !== "accepted" && (
                                    <Button
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                                        disabled={updatingId === reviewApp.id}
                                        onClick={() => confirmStatusChange(reviewApp.id, "accepted")}
                                    >
                                        <CheckCircle className="size-4" />
                                        Accept
                                    </Button>
                                )}
                                {reviewApp.status !== "rejected" && (
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-red-600 border-red-200 dark:border-red-800 hover:bg-red-500/10 flex items-center gap-2"
                                        disabled={updatingId === reviewApp.id}
                                        onClick={() => confirmStatusChange(reviewApp.id, "rejected")}
                                    >
                                        <XCircle className="size-4" />
                                        Reject
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
