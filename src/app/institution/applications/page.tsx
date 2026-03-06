"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { message } from "antd";
import {
    Users,
    GraduationCap,
    Trophy,
    Calendar,
    Target,
    Rocket,
    FileText,
    FileDown,
    MapPin,
    Mail,
    User,
    Search,
    Filter,
    ChevronDown,
    X,
    Plus,
    Clock,
    DollarSign,
    BookOpen,
    Briefcase,
} from "lucide-react";

interface Application {
    id: number;
    status: string;
    created_at: string;
    student: {
        id: number;
        full_name: string | null;
        city: string | null;
        education_level: string | null;
        user: { email: string | null; phone: string | null };
    };
    program: { id: number; title: string; category: string | null };
}

interface StudentDetail {
    user_id: number;
    full_name: string | null;
    student_type: string | null;
    city: string | null;
    age_range: string | null;
    intended_field: string | null;
    personal_statement: string | null;
    education_level: string | null;
    experience_level: string | null;
    learning_goal: string | null;
    cv_url: string | null;
    profile_picture_url: string | null;
    preferred_schedule: string | null;
    budget_min: number | null;
    budget_max: number | null;
    preferred_field: string | null;
    user: { email: string | null; phone: string | null };
}

// ── Advanced filter types ────────────────────────────────────────────────────
type FilterColumn = "name" | "email" | "program" | "status" | "city" | "education";
type FilterOperator = "contains" | "equals" | "starts_with";
interface AdvancedFilter {
    id: number;
    column: FilterColumn;
    operator: FilterOperator;
    value: string;
}

const COLUMN_OPTIONS: { value: FilterColumn; label: string }[] = [
    { value: "name", label: "Applicant Name" },
    { value: "email", label: "Email" },
    { value: "program", label: "Program" },
    { value: "status", label: "Status" },
    { value: "city", label: "City" },
    { value: "education", label: "Education Level" },
];

const OPERATOR_OPTIONS: { value: FilterOperator; label: string }[] = [
    { value: "contains", label: "contains" },
    { value: "equals", label: "equals" },
    { value: "starts_with", label: "starts with" },
];

const STATUS_OPTIONS = ["submitted", "viewed", "accepted", "rejected", "withdrawn"];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getFieldValue(app: Application, col: FilterColumn): string {
    switch (col) {
        case "name": return app.student.full_name || "";
        case "email": return app.student.user.email || "";
        case "program": return app.program.title;
        case "status": return app.status;
        case "city": return app.student.city || "";
        case "education": return app.student.education_level || "";
    }
}

function matchesFilter(value: string, operator: FilterOperator, filterValue: string): boolean {
    const v = value.toLowerCase();
    const f = filterValue.toLowerCase();
    switch (operator) {
        case "contains": return v.includes(f);
        case "equals": return v === f;
        case "starts_with": return v.startsWith(f);
    }
}

export default function InstitutionApplicationsPage() {
    const { fetchWithAuth } = useApi();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // ── Filter state ──
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [programFilter, setProgramFilter] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);
    const [advFilters, setAdvFilters] = useState<AdvancedFilter[]>([]);
    const [nextFilterId, setNextFilterId] = useState(1);

    // Highlight support from notification click
    const searchParams = useSearchParams();
    const highlightId = searchParams.get("highlight") ? parseInt(searchParams.get("highlight")!) : null;
    const highlightProgram = searchParams.get("highlightProgram");
    const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
    const highlightRef = useRef<HTMLTableRowElement | null>(null);

    // ── Dropdown open state ──
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [programDropdownOpen, setProgramDropdownOpen] = useState(false);

    useEffect(() => {
        loadApplications();
    }, []);

    // Handle highlight from notification
    useEffect(() => {
        if (applications.length === 0) return;
        let targetId: number | null = null;

        if (highlightId) {
            targetId = highlightId;
        } else if (highlightProgram) {
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

    async function loadApplications() {
        const res = await fetchWithAuth("/institutions/applications");
        if (res.ok) {
            const data = await res.json();
            setApplications(data.applications);
        }
        setIsLoading(false);
    }

    const handleStatusUpdate = async (appId: number, status: string) => {
        setUpdatingStatus(`${appId}_${status}`);
        try {
            const res = await fetchWithAuth(`/institutions/applications/${appId}`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                message.success(`Application ${status}`);
                loadApplications();
            }
        } finally {
            setUpdatingStatus(null);
        }
    };

    const viewStudentProfile = async (studentId: number) => {
        const res = await fetchWithAuth(`/institutions/applicant/${studentId}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedStudent(data.student);
            setIsPreviewOpen(true);
        } else {
            message.error("Could not load student profile");
        }
    };

    // ── Derive unique programs for filter ──
    const uniquePrograms = useMemo(() => {
        const programs = new Map<number, string>();
        applications.forEach(app => programs.set(app.program.id, app.program.title));
        return Array.from(programs.entries()).map(([id, title]) => ({ id, title }));
    }, [applications]);

    // ── Advanced filter management ──
    const addFilter = () => {
        setAdvFilters(prev => [...prev, { id: nextFilterId, column: "name", operator: "contains", value: "" }]);
        setNextFilterId(prev => prev + 1);
    };
    const removeFilter = (id: number) => setAdvFilters(prev => prev.filter(f => f.id !== id));
    const updateFilter = (id: number, field: keyof AdvancedFilter, value: string) => {
        setAdvFilters(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    // ── Filter applications ──
    const filteredApplications = useMemo(() => {
        let result = applications;

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(app =>
                (app.student.full_name || "").toLowerCase().includes(q) ||
                (app.student.user.email || "").toLowerCase().includes(q) ||
                app.program.title.toLowerCase().includes(q)
            );
        }

        // Status quick filter
        if (statusFilter !== "all") {
            result = result.filter(app => app.status === statusFilter);
        }

        // Program quick filter
        if (programFilter !== "all") {
            result = result.filter(app => app.program.id === parseInt(programFilter, 10));
        }

        // Advanced filters
        for (const f of advFilters) {
            if (!f.value.trim()) continue;
            result = result.filter(app => matchesFilter(getFieldValue(app, f.column), f.operator, f.value));
        }

        return result;
    }, [applications, searchQuery, statusFilter, programFilter, advFilters]);

    // ── Status counts ──
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: applications.length };
        applications.forEach(app => { counts[app.status] = (counts[app.status] || 0) + 1; });
        return counts;
    }, [applications]);

    if (isLoading) {
        return (
            <DashboardLayout role="institution">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="institution">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Applications</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {applications.length} total application{applications.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* ── Search & Filter Bar ───────────────────────────────────────── */}
            <div className="flex flex-col gap-3 mb-5">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or program..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder:text-muted-foreground/60"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setProgramDropdownOpen(false); }}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-card border rounded-lg hover:bg-accent transition-colors min-w-[150px]"
                        >
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium capitalize">{statusFilter === "all" ? "All" : statusFilter}</span>
                            <ChevronDown className="size-4 text-muted-foreground ml-auto" />
                        </button>
                        {statusDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-card border rounded-lg shadow-lg z-50 py-1">
                                <button
                                    onClick={() => { setStatusFilter("all"); setStatusDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center justify-between ${statusFilter === "all" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : ""}`}
                                >
                                    All <span className="text-xs text-muted-foreground">{statusCounts.all}</span>
                                </button>
                                {STATUS_OPTIONS.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => { setStatusFilter(s); setStatusDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-accent capitalize flex items-center justify-between ${statusFilter === s ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : ""}`}
                                    >
                                        {s} <span className="text-xs text-muted-foreground">{statusCounts[s] || 0}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Program Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => { setProgramDropdownOpen(!programDropdownOpen); setStatusDropdownOpen(false); }}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-card border rounded-lg hover:bg-accent transition-colors min-w-[150px]"
                        >
                            <span className="text-muted-foreground">Program:</span>
                            <span className="font-medium truncate max-w-[120px]">{programFilter === "all" ? "All" : uniquePrograms.find(p => p.id === parseInt(programFilter, 10))?.title || "All"}</span>
                            <ChevronDown className="size-4 text-muted-foreground ml-auto" />
                        </button>
                        {programDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-card border rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
                                <button
                                    onClick={() => { setProgramFilter("all"); setProgramDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-accent ${programFilter === "all" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : ""}`}
                                >
                                    All Programs
                                </button>
                                {uniquePrograms.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => { setProgramFilter(String(p.id)); setProgramDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-accent truncate ${programFilter === String(p.id) ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : ""}`}
                                    >
                                        {p.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* More Filters Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm border rounded-lg transition-colors ${showFilters ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400" : "bg-card hover:bg-accent"}`}
                    >
                        <Filter className="size-4" />
                        More Filters
                        {advFilters.length > 0 && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-blue-600 text-white">{advFilters.length}</Badge>
                        )}
                    </button>
                </div>

                {/* Active filter pills */}
                {(searchQuery || statusFilter !== "all" || programFilter !== "all" || advFilters.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground">Active:</span>
                        {searchQuery && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                                Search: &quot;{searchQuery}&quot;
                                <button onClick={() => setSearchQuery("")}><X className="size-3" /></button>
                            </Badge>
                        )}
                        {statusFilter !== "all" && (
                            <Badge variant="secondary" className="gap-1 text-xs capitalize">
                                Status: {statusFilter}
                                <button onClick={() => setStatusFilter("all")}><X className="size-3" /></button>
                            </Badge>
                        )}
                        {programFilter !== "all" && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                                Program: {uniquePrograms.find(p => p.id === parseInt(programFilter, 10))?.title}
                                <button onClick={() => setProgramFilter("all")}><X className="size-3" /></button>
                            </Badge>
                        )}
                        {advFilters.map(f => f.value.trim() && (
                            <Badge key={f.id} variant="secondary" className="gap-1 text-xs">
                                {COLUMN_OPTIONS.find(c => c.value === f.column)?.label} {f.operator.replace("_", " ")} &quot;{f.value}&quot;
                                <button onClick={() => removeFilter(f.id)}><X className="size-3" /></button>
                            </Badge>
                        ))}
                        <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); setProgramFilter("all"); setAdvFilters([]); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-1">
                            Clear all
                        </button>
                    </div>
                )}

                {/* ── Advanced Filter Panel ──────────────────────────────────── */}
                {showFilters && (
                    <div className="bg-card border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Advanced Filters</h3>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addFilter}>
                                <Plus className="size-3" /> Add Filter
                            </Button>
                        </div>

                        {advFilters.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No advanced filters. Click &quot;Add Filter&quot; to create one.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {advFilters.map(f => (
                                    <div key={f.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-lg bg-accent/50 border">
                                        {/* Column Select */}
                                        <select
                                            value={f.column}
                                            onChange={e => updateFilter(f.id, "column", e.target.value)}
                                            className="px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        >
                                            {COLUMN_OPTIONS.map(c => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>

                                        {/* Operator Select */}
                                        <select
                                            value={f.operator}
                                            onChange={e => updateFilter(f.id, "operator", e.target.value)}
                                            className="px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        >
                                            {OPERATOR_OPTIONS.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>

                                        {/* Value Input */}
                                        <input
                                            type="text"
                                            placeholder="Value..."
                                            value={f.value}
                                            onChange={e => updateFilter(f.id, "value", e.target.value)}
                                            className="flex-1 px-3 py-1.5 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-muted-foreground/60"
                                        />

                                        {/* Remove */}
                                        <button onClick={() => removeFilter(f.id)} className="self-center text-muted-foreground hover:text-red-500 transition-colors p-1">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Status Tabs ──────────────────────────────────────────── */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
                {["all", ...STATUS_OPTIONS].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${statusFilter === s
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                    >
                        <span className="capitalize">{s === "all" ? "All" : s}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === s
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground"
                            }`}>
                            {statusCounts[s] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Results Count ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredApplications.length}</span> of {applications.length} application{applications.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* ── Applications Table ─────────────────────────────────────── */}
            <Card>
                <CardContent className="pt-6">
                    {filteredApplications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Search className="size-5 text-muted-foreground" />
                            </div>
                            <p className="font-medium">No applications found</p>
                            <p className="text-muted-foreground text-sm mt-1">
                                {applications.length === 0 ? "No applications received yet" : "Try adjusting your search or filters"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Applicant</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Program</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map((app) => (
                                        <tr
                                            key={app.id}
                                            ref={app.id === activeHighlight ? highlightRef : undefined}
                                            className={`border-b last:border-0 hover:bg-accent/50 transition-all duration-500 ${app.id === activeHighlight
                                                ? "bg-blue-500/10 ring-1 ring-blue-500/30 animate-pulse"
                                                : ""
                                                }`}
                                        >
                                            <td className="py-3">
                                                <div>
                                                    <p className="text-sm font-medium">{app.student.full_name || "—"}</p>
                                                    <p className="text-xs text-muted-foreground">{app.student.user.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 text-sm">{app.program.title}</td>
                                            <td className="py-3"><StatusBadge status={app.status} /></td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => viewStudentProfile(app.student.id)}>
                                                        Profile
                                                    </Button>
                                                    {app.status === "submitted" && (
                                                        <Button size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusUpdate(app.id, "viewed")} disabled={updatingStatus === `${app.id}_viewed`}>
                                                            {updatingStatus === `${app.id}_viewed` ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" /> : null}
                                                            {updatingStatus === `${app.id}_viewed` ? "Updating..." : "Mark Viewed"}
                                                        </Button>
                                                    )}
                                                    {(app.status === "viewed" || app.status === "rejected") && (
                                                        <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusUpdate(app.id, "accepted")} disabled={updatingStatus === `${app.id}_accepted`}>
                                                            {updatingStatus === `${app.id}_accepted` ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" /> : null}
                                                            {updatingStatus === `${app.id}_accepted` ? "Accepting..." : "Accept"}
                                                        </Button>
                                                    )}
                                                    {(app.status === "viewed" || app.status === "accepted") && (
                                                        <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleStatusUpdate(app.id, "rejected")} disabled={updatingStatus === `${app.id}_rejected`}>
                                                            {updatingStatus === `${app.id}_rejected` ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" /> : null}
                                                            {updatingStatus === `${app.id}_rejected` ? "Rejecting..." : "Reject"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Student Profile Preview Dialog (shadcn — auto dark/light) ─── */}
            <Dialog open={isPreviewOpen} onOpenChange={(open) => { if (!open) setIsPreviewOpen(false); }}>
                <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0">
                    {selectedStudent && (
                        <>
                            {/* ─── Header with profile picture & basic info ─── */}
                            <div className="relative">
                                {/* Avatar & name */}
                                <div className="px-6 pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            {selectedStudent.profile_picture_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={selectedStudent.profile_picture_url}
                                                    alt={selectedStudent.full_name || "Student"}
                                                    className="w-16 h-16 rounded-full border-2 border-border object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full border-2 border-border bg-blue-600 flex items-center justify-center">
                                                    <User className="size-7 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <DialogHeader className="text-left p-0">
                                                <DialogTitle className="text-xl font-bold truncate">
                                                    {selectedStudent.full_name || "Unnamed Student"}
                                                </DialogTitle>
                                                <DialogDescription className="sr-only">
                                                    Student profile details
                                                </DialogDescription>
                                            </DialogHeader>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact info below avatar */}
                                <div className="px-6 mt-3 space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="size-3.5 shrink-0" />
                                        <span className="truncate">{selectedStudent.user.email || "—"}</span>
                                    </div>
                                    {selectedStudent.city && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="size-3.5 shrink-0" />
                                            <span>{selectedStudent.city}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ─── Quick Info Tags with Labels ─── */}
                            <div className="px-6 mt-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    {selectedStudent.student_type && (
                                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                            <Users className="size-4 text-blue-500" />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                                Student Type
                                            </span>
                                            <span className="text-sm font-bold text-foreground capitalize">
                                                {selectedStudent.student_type}
                                            </span>
                                        </div>
                                    )}
                                    {selectedStudent.education_level && (
                                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                                            <GraduationCap className="size-4 text-cyan-500" />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                                Education
                                            </span>
                                            <span className="text-sm font-bold text-foreground capitalize">
                                                {selectedStudent.education_level}
                                            </span>
                                        </div>
                                    )}
                                    {selectedStudent.experience_level && (
                                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                            <Trophy className="size-4 text-purple-500" />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                                Experience
                                            </span>
                                            <span className="text-sm font-bold text-foreground capitalize">
                                                {selectedStudent.experience_level}
                                            </span>
                                        </div>
                                    )}
                                    {selectedStudent.age_range && (
                                        <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                            <Calendar className="size-4 text-amber-500" />
                                            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                                                Age Range
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                {selectedStudent.age_range}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="mx-6 mt-5" />

                            {/* ─── Detail Fields ─── */}
                            <div className="px-6 py-5 space-y-4">
                                {/* Intended Field & Learning Goal */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedStudent.intended_field && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <Target className="size-3.5" />
                                                Intended Field
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-accent border border-border">
                                                <span className="text-sm font-medium text-foreground">
                                                    {selectedStudent.intended_field}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedStudent.learning_goal && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <Rocket className="size-3.5" />
                                                Learning Goal
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-accent border border-border">
                                                <span className="text-sm font-medium text-foreground">
                                                    {selectedStudent.learning_goal}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Preferred Field & Schedule */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedStudent.preferred_field && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <BookOpen className="size-3.5" />
                                                Preferred Field
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-accent border border-border">
                                                <span className="text-sm font-medium text-foreground">
                                                    {selectedStudent.preferred_field}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedStudent.preferred_schedule && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                <Clock className="size-3.5" />
                                                Preferred Schedule
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-accent border border-border">
                                                <span className="text-sm font-medium text-foreground">
                                                    {selectedStudent.preferred_schedule}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Budget Range */}
                                {(selectedStudent.budget_min !== null || selectedStudent.budget_max !== null) && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <DollarSign className="size-3.5" />
                                            Budget Range (PKR)
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-accent border border-border">
                                            <span className="text-sm font-medium text-foreground">
                                                {selectedStudent.budget_min?.toLocaleString() ?? "—"} – {selectedStudent.budget_max?.toLocaleString() ?? "—"}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Personal Statement */}
                                {selectedStudent.personal_statement && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <FileText className="size-3.5" />
                                            Personal Statement
                                        </div>
                                        <div className="p-3.5 rounded-lg bg-accent border border-border">
                                            <p className="text-sm leading-relaxed text-foreground">
                                                {selectedStudent.personal_statement}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* CV Button */}
                                {selectedStudent.cv_url && (
                                    <>
                                        <Separator />
                                        <Button
                                            className="w-full h-11 text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetchWithAuth(`/students/profile/cv?userId=${selectedStudent.user_id}`);
                                                    if (!res.ok) throw new Error();
                                                    const data = await res.json();
                                                    window.open(data.url, "_blank");
                                                } catch {
                                                    message.error("Failed to load CV");
                                                }
                                            }}
                                        >
                                            <FileDown className="size-5 mr-2" />
                                            View CV / Resume
                                        </Button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
