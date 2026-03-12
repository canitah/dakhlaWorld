"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Filter, X, CalendarDays, Eye } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Application {
    id: number;
    application_code: string;
    status: string;
    created_at: string;
    program: {
        title: string;
        category: string | null;
        institution: { name: string; city: string | null } | null;
    };
    answers?: {
        id: number;
        answer: string;
        question: { question: string };
    }[];
}

export default function StudentApplicationsPage() {
    const { fetchWithAuth } = useApi();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [trackingCode, setTrackingCode] = useState("");
    const [trackingResult, setTrackingResult] = useState<Application | null>(null);
    const [trackingError, setTrackingError] = useState<string | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [reviewApp, setReviewApp] = useState<Application | null>(null);

    // Highlight support from notification click
    const [highlightId, setHighlightId] = useState<number | null>(null);
    const [highlightProgram, setHighlightProgram] = useState<string | null>(null);
    const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
    const highlightRef = useRef<HTMLTableRowElement | null>(null);

    // Read URL params on mount (avoids useSearchParams prerender error)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const h = params.get("highlight");
        const hp = params.get("highlightProgram");
        if (h) setHighlightId(parseInt(h));
        if (hp) setHighlightProgram(hp);
    }, []);

    // Filter states
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterInstitution, setFilterInstitution] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");

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

    // Handle highlight from notification
    useEffect(() => {
        if (applications.length === 0) return;
        let targetId: number | null = null;

        if (highlightId) {
            targetId = highlightId;
        } else if (highlightProgram) {
            // Find first application matching the program title
            const match = applications.find(
                (a) => a.program.title.toLowerCase() === highlightProgram.toLowerCase()
            );
            if (match) targetId = match.id;
        }

        if (targetId) {
            setActiveHighlight(targetId);
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
            const timer = setTimeout(() => setActiveHighlight(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [highlightId, highlightProgram, applications]);

    const handleTrack = async () => {
        if (!trackingCode.trim()) return;
        setIsTracking(true);
        setTrackingError(null);
        setTrackingResult(null);

        try {
            const res = await fetchWithAuth(`/applications/track?code=${encodeURIComponent(trackingCode.trim())}`);
            if (res.ok) {
                const data = await res.json();
                setTrackingResult(data.application);
            } else {
                const data = await res.json();
                setTrackingError(data.error || "Application not found");
            }
        } catch {
            setTrackingError("Failed to track application");
        } finally {
            setIsTracking(false);
        }
    };

    // Derive unique filter options from applications
    const statuses = useMemo(() => {
        const set = new Set(applications.map((a) => a.status));
        return Array.from(set).sort();
    }, [applications]);

    const institutions = useMemo(() => {
        const set = new Set(applications.map((a) => a.program.institution?.name || "DAKHLA Platform"));
        return Array.from(set).sort();
    }, [applications]);

    const categories = useMemo(() => {
        const set = new Set(applications.map((a) => a.program.category).filter(Boolean) as string[]);
        return Array.from(set).sort();
    }, [applications]);

    // Filtered applications
    const filtered = useMemo(() => {
        return applications.filter((app) => {
            if (filterStatus !== "all" && app.status !== filterStatus) return false;
            if (filterInstitution !== "all" && (app.program.institution?.name || "DAKHLA Platform") !== filterInstitution) return false;
            if (filterCategory !== "all" && app.program.category !== filterCategory) return false;
            if (filterDateFrom) {
                const from = new Date(filterDateFrom);
                if (new Date(app.created_at) < from) return false;
            }
            if (filterDateTo) {
                const to = new Date(filterDateTo);
                to.setHours(23, 59, 59, 999);
                if (new Date(app.created_at) > to) return false;
            }
            return true;
        });
    }, [applications, filterStatus, filterInstitution, filterCategory, filterDateFrom, filterDateTo]);

    const hasActiveFilters = filterStatus !== "all" || filterInstitution !== "all" || filterCategory !== "all" || filterDateFrom || filterDateTo;

    const clearFilters = () => {
        setFilterStatus("all");
        setFilterInstitution("all");
        setFilterCategory("all");
        setFilterDateFrom("");
        setFilterDateTo("");
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
            <h1 className="text-2xl font-bold mb-6">My Applications</h1>

            {/* Track Application by Code */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Search className="size-4" />
                        Track Application
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3 items-center">
                        <Input
                            placeholder="Enter code (APP-XXXXXXXX) or program name"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                            className="max-w-sm"
                        />
                        <button
                            onClick={handleTrack}
                            disabled={isTracking || !trackingCode.trim()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                        >
                            {isTracking ? "Tracking..." : "Track"}
                        </button>
                    </div>

                    {trackingResult && (
                        <div className="mt-4 p-4 rounded-lg border border-border bg-accent/30">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="size-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">{trackingResult.application_code}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground font-medium">Program:</span>
                                    <p className="text-foreground">{trackingResult.program.title}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground font-medium">Institution:</span>
                                    <p className="text-foreground">{trackingResult.program.institution?.name || "DAKHLA Platform"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground font-medium">Status:</span>
                                    <div className="mt-0.5"><StatusBadge status={trackingResult.status} /></div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground font-medium">Applied:</span>
                                    <p className="text-foreground">{new Date(trackingResult.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {trackingError && (
                        <p className="mt-3 text-sm text-destructive">{trackingError}</p>
                    )}
                </CardContent>
            </Card>

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
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <CardTitle>All Applications ({filtered.length}{filtered.length !== applications.length ? ` of ${applications.length}` : ""})</CardTitle>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 transition-colors cursor-pointer"
                                >
                                    <X className="size-3.5" /> Clear Filters
                                </button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filters Row */}
                        <div className="mb-4 flex flex-wrap items-end gap-3 p-3 rounded-lg border border-border bg-accent/30">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground mr-1">
                                <Filter className="size-4" /> Filters
                            </div>

                            {/* Status Filter */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="all">All</option>
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Institution Filter */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Institution</label>
                                <select
                                    value={filterInstitution}
                                    onChange={(e) => setFilterInstitution(e.target.value)}
                                    className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[200px]"
                                >
                                    <option value="all">All</option>
                                    {institutions.map((i) => (
                                        <option key={i} value={i}>{i}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[200px]"
                                >
                                    <option value="all">All</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date From */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                    <CalendarDays className="size-3" /> From
                                </label>
                                <input
                                    type="date"
                                    value={filterDateFrom}
                                    onChange={(e) => setFilterDateFrom(e.target.value)}
                                    className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                            </div>

                            {/* Date To */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                    <CalendarDays className="size-3" /> To
                                </label>
                                <input
                                    type="date"
                                    value={filterDateTo}
                                    onChange={(e) => setFilterDateTo(e.target.value)}
                                    className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Application Code</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Program</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Institution</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Category</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Applied</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                                No applications match the selected filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((app) => (
                                            <tr
                                                key={app.id}
                                                ref={app.id === activeHighlight ? highlightRef : undefined}
                                                className={`border-b last:border-0 hover:bg-accent/50 transition-all duration-500 ${app.id === activeHighlight
                                                    ? "bg-blue-500/10 ring-1 ring-blue-500/30 animate-pulse"
                                                    : ""
                                                    }`}
                                            >
                                                <td className="py-3">
                                                    <Badge variant="outline" className="text-xs font-mono">
                                                        {app.application_code}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-sm font-medium">{app.program.title}</td>
                                                <td className="py-3 text-sm text-muted-foreground">
                                                    {app.program.institution?.name || "DAKHLA Platform"}
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
                                                <td className="py-3">
                                                    <button
                                                        onClick={() => setReviewApp(app)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Review Dialog */}
            <Dialog open={!!reviewApp} onOpenChange={(open) => !open && setReviewApp(null)}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Application Review</DialogTitle>
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

                            {/* Program Details */}
                            <div className="p-4 rounded-lg border border-border bg-accent/30 space-y-2">
                                <h4 className="text-sm font-semibold text-foreground">Program Details</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">Program</span>
                                        <p className="text-foreground font-medium">{reviewApp.program.title}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">Institution</span>
                                        <p className="text-foreground">{reviewApp.program.institution?.name || "DAKHLA Platform"}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">Category</span>
                                        <p className="text-foreground">{reviewApp.program.category || "—"}</p>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium">Applied On</span>
                                        <p className="text-foreground">{new Date(reviewApp.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submitted Answers */}
                            {reviewApp.answers && reviewApp.answers.length > 0 ? (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground">Submitted Answers</h4>
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
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
