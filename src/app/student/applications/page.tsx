"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Filter, X, CalendarDays, Eye, ChevronRight, Globe, LayoutGrid } from "lucide-react";
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
    const clearTracking = () => {
    setTrackingCode("");
    setTrackingResult(null);
    setTrackingError(null);
};
    const [reviewApp, setReviewApp] = useState<Application | null>(null);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // Highlight support
    const [highlightId, setHighlightId] = useState<number | null>(null);
    const [highlightProgram, setHighlightProgram] = useState<string | null>(null);
    const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
    const highlightRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const h = params.get("highlight");
        const hp = params.get("highlightProgram");
        if (h) setHighlightId(parseInt(h));
        if (hp) setHighlightProgram(hp);
    }, []);

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

    useEffect(() => {
        if (applications.length === 0) return;
        let targetId: number | null = null;
        if (highlightId) targetId = highlightId;
        else if (highlightProgram) {
            const match = applications.find(a => a.program.title.toLowerCase() === highlightProgram.toLowerCase());
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
            const data = await res.json();
            if (res.ok) setTrackingResult(data.application);
            else setTrackingError(data.error || "Application not found");
        } catch {
            setTrackingError("Failed to track application");
        } finally {
            setIsTracking(false);
        }
    };

    const statuses = useMemo(() => Array.from(new Set(applications.map(a => a.status))).sort(), [applications]);
    const institutions = useMemo(() => Array.from(new Set(applications.map(a => a.program.institution?.name || "DAKHLA Platform"))).sort(), [applications]);
    const categories = useMemo(() => Array.from(new Set(applications.map(a => a.program.category).filter(Boolean) as string[])).sort(), [applications]);

    const filtered = useMemo(() => {
        return applications.filter((app) => {
            if (filterStatus !== "all" && app.status !== filterStatus) return false;
            if (filterInstitution !== "all" && (app.program.institution?.name || "DAKHLA Platform") !== filterInstitution) return false;
            if (filterCategory !== "all" && app.program.category !== filterCategory) return false;
            if (filterDateFrom && new Date(app.created_at) < new Date(filterDateFrom)) return false;
            if (filterDateTo) {
                const to = new Date(filterDateTo);
                to.setHours(23, 59, 59, 999);
                if (new Date(app.created_at) > to) return false;
            }
            return true;
        });
    }, [applications, filterStatus, filterInstitution, filterCategory, filterDateFrom, filterDateTo]);

    const hasActiveFilters = filterStatus !== "all" || filterInstitution !== "all" || filterCategory !== "all" || filterDateFrom || filterDateTo;

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="max-w-7xl mx-auto pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Applications</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage and track your global learning journey</p>
                    </div>
                </div>

                {/* Track Section */}
               {/* Track Section - Isse pura replace karein */}
<Card className="mb-8 border-none shadow-md bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Globe className="size-32" />
    </div>
    <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-white font-bold">
            <Search className="size-5" />
            Quick Track
        </CardTitle>
    </CardHeader>
    <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl relative z-10">
            <div className="relative flex-1">
                <Input
                    placeholder="Enter Application Code..."
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-100 h-11 focus-visible:ring-white/30 pr-10"
                />
                {/* Input ke andar wala Clear (X) Button */}
                {trackingCode && (
                    <button 
                        onClick={clearTracking}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-1"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
            
            <div className="flex gap-2">
                <button
                    onClick={handleTrack}
                    disabled={isTracking || !trackingCode.trim()}
                    className="h-11 px-8 bg-white text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 flex-1 sm:flex-none shadow-sm"
                >
                    {isTracking ? "Tracking..." : "Track Now"}
                </button>

                {/* Search Result ya Error aane ke baad Reset/Back Button */}
                {(trackingResult || trackingError) && (
                    <button
                        onClick={clearTracking}
                        className="h-11 px-4 bg-blue-500/30 text-white border border-white/20 rounded-lg text-sm font-medium hover:bg-blue-500/50 transition-colors flex items-center gap-1"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>

        {/* Tracking Result View */}
        {trackingResult && (
           <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2 relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 font-mono">{trackingResult.application_code}</Badge>
                        <StatusBadge status={trackingResult.status} />
                    </div>
                    <button 
                        onClick={() => setReviewApp(trackingResult)} 
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                    >
                       View Details 
                <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
        </div>
                <p className="text-sm font-semibold text-slate-800">{trackingResult.program.title}</p>
            </div>
        )}

        {/* Error Message with Clear Option */}
        {trackingError && (
            <div className="mt-3 flex items-center justify-between text-sm text-red-100 bg-red-500/20 p-3 rounded-lg border border-red-400/20 animate-in shake-in">
                <span className="flex items-center gap-2">⚠️ {trackingError}</span>
                <button onClick={clearTracking} className="text-white hover:underline text-xs font-bold">Clear</button>
            </div>
        )}
    </CardContent>
</Card>

                {applications.length === 0 ? (
                    <Card className="border-dashed py-16">
                        <CardContent className="text-center">
                            <div className="bg-slate-100 dark:bg-slate-800 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="size-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No applications found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-2 mb-6">Start your journey by exploring available programs.</p>
                            <button onClick={() => router.push('/explore')} className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-all">Explore Programs</button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {/* Header & Filter Toggle */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <LayoutGrid className="size-5 text-blue-600" />
                                All Records ({filtered.length})
                            </h2>
                            <div className="flex gap-2">
                                {hasActiveFilters && (
                                    <button onClick={() => { setFilterStatus("all"); setFilterInstitution("all"); setFilterCategory("all"); setFilterDateFrom(""); setFilterDateTo(""); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X className="size-5" /></button>
                                )}
                                <button 
                                    onClick={() => setIsFilterVisible(!isFilterVisible)} 
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isFilterVisible ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'}`}
                                >
                                    <Filter className="size-4" /> Filters
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Filters */}
                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 transition-all duration-300 ${isFilterVisible ? 'opacity-100' : 'hidden opacity-0'}`}>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500 px-1">Status</label>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="all">All Statuses</option>
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500 px-1">Institution</label>
                                <select value={filterInstitution} onChange={(e) => setFilterInstitution(e.target.value)} className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="all">All Institutions</option>
                                    {institutions.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500 px-1">Category</label>
                                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="all">All Categories</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500 px-1 flex items-center gap-1"><CalendarDays className="size-3" /> From</label>
                                <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-slate-500 px-1 flex items-center gap-1"><CalendarDays className="size-3" /> To</label>
                                <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-xs font-bold uppercase text-slate-500">Code</th>
                                        <th className="p-4 text-xs font-bold uppercase text-slate-500">Program & Institution</th>
                                        <th className="p-4 text-xs font-bold uppercase text-slate-500">Category</th>
                                        <th className="p-4 text-xs font-bold uppercase text-slate-500">Status</th>
                                        <th className="p-4 text-xs font-bold uppercase text-slate-500 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((app) => (
                                        <tr 
                                            key={app.id} 
                                            ref={app.id === activeHighlight ? highlightRef as any : undefined}
                                            className={`hover:bg-blue-50/30 transition-all ${app.id === activeHighlight ? "bg-blue-50 ring-1 ring-inset ring-blue-500" : ""}`}
                                        >
                                            <td className="p-4 font-mono text-xs font-semibold text-blue-600">{app.application_code}</td>
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{app.program.title}</p>
                                                <p className="text-[11px] text-muted-foreground">{app.program.institution?.name || "DAKHLA Platform"}</p>
                                            </td>
                                            <td className="p-4"><Badge variant="secondary" className="font-normal text-[10px]">{app.program.category || "—"}</Badge></td>
                                            <td className="p-4"><StatusBadge status={app.status} /></td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => setReviewApp(app)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors inline-flex"><Eye className="size-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List Layout (Visible only on small screens) */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {filtered.map((app) => (
                                <div 
                                    key={app.id}
                                    ref={app.id === activeHighlight ? highlightRef as any : undefined}
                                    className={`p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden ${app.id === activeHighlight ? "ring-2 ring-blue-500 bg-blue-50/50 animate-pulse" : ""}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{app.application_code}</span>
                                        <StatusBadge status={app.status} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 leading-snug">{app.program.title}</h3>
                                    <p className="text-xs text-muted-foreground mb-4">{app.program.institution?.name || "DAKHLA Platform"}</p>
                                    
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[10px] uppercase text-slate-400 font-bold">Category</p>
                                                <p className="text-xs font-medium">{app.program.category || "General"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase text-slate-400 font-bold">Applied Date</p>
                                                <p className="text-xs font-medium">{new Date(app.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setReviewApp(app)}
                                            className="bg-blue-600 text-white size-9 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200"
                                        >
                                            <Eye className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modern Review Dialog */}
                <Dialog open={!!reviewApp} onOpenChange={(open) => !open && setReviewApp(null)}>
                    <DialogContent className="p-0 overflow-hidden border-none max-w-lg sm:rounded-2xl">
                        {reviewApp && (
                            <>
                                <div className="p-6 bg-blue-600 text-white relative">
                                    <button 
                                        onClick={() => setReviewApp(null)}
                                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                                    >
                                        <X className="size-5" />
                                    </button>
                                    <Badge className="bg-white/20 text-white border-none mb-2">{reviewApp.application_code}</Badge>
                                    <DialogTitle className="text-xl md:text-2xl font-bold leading-tight">{reviewApp.program.title}</DialogTitle>
                                    <p className="text-blue-100 text-sm mt-1">{reviewApp.program.institution?.name || "DAKHLA Global Platform"}</p>
                                </div>
                                <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto bg-white dark:bg-slate-950">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application Status</p>
                                            <div className="mt-1"><StatusBadge status={reviewApp.status} /></div>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Date</p>
                                            <p className="text-sm font-semibold mt-1">{new Date(reviewApp.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold flex items-center gap-2 mb-3">
                                            <FileText className="size-4 text-blue-600" />
                                            Questionnaire Responses
                                        </h4>
                                        {reviewApp.answers && reviewApp.answers.length > 0 ? (
                                            <div className="space-y-3">
                                                {reviewApp.answers.map((a, idx) => (
                                                    <div key={a.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                                        <p className="text-xs font-bold text-blue-600 mb-1">Q{idx + 1}: {a.question.question}</p>
                                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{a.answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 border-2 border-dashed rounded-xl border-slate-100">
                                                <p className="text-sm text-muted-foreground">No additional responses provided.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t flex justify-end">
                                    <button 
                                        onClick={() => setReviewApp(null)}
                                        className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
 
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="student">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">My Applications</h1>

            {/* Track Application */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Search className="size-4" /> Track Application
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        <Input
                            placeholder="Enter code (APP-XXXXXXXX) or program name"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                            className="flex-1 min-w-[200px]"
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
                       <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2 relative z-10">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2 items-start sm:items-center">
                                <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-primary" />
                                    <span className="text-sm font-semibold text-foreground">{trackingResult?.application_code}</span>
                                </div>
                                <StatusBadge status={trackingResult?.status || ""} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground font-medium">Program:</span>
                                    <p className="text-foreground">{trackingResult?.program?.title}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground font-medium">Institution:</span>
                                    <p className="text-foreground">{trackingResult?.program.institution?.name || "DAKHLA Platform"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground font-medium">Applied:</span>
                                  <p className="text-foreground">
  {(() => {
    const dateValue = trackingResult?.created_at;
    if (!dateValue) return 'N/A';
    return new Date(dateValue as string | number | Date).toLocaleDateString();
  })()}
</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {trackingError && <p className="mt-3 text-sm text-destructive">{trackingError}</p>}
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
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
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
                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row flex-wrap gap-3 p-3 rounded-lg border border-border bg-accent/30 items-start">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                                <Filter className="size-4" /> Filters
                            </div>
                            <div className="flex flex-col gap-1 w-full sm:w-auto">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                    <option value="all">All</option>
                                    {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1 w-full sm:w-auto">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Institution</label>
                                <select value={filterInstitution} onChange={(e) => setFilterInstitution(e.target.value)} className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All</option>
                                    {institutions.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1 w-full sm:w-auto">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1 w-full sm:w-auto">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><CalendarDays className="size-3" /> From</label>
                                <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div className="flex flex-col gap-1 w-full sm:w-auto">
                                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"><CalendarDays className="size-3" /> To</label>
                                <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="h-9 px-3 text-sm rounded-md border border-border bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg shadow-sm border border-border">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-accent/20">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Code</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Program</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Institution</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Category</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Status</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Applied</th>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-background">
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No applications match the selected filters.</td></tr>
                                    ) : (
                                        filtered.map(app => (
                                            <tr key={app.id} ref={app.id === activeHighlight ? highlightRef : undefined} className={`border-b last:border-0 hover:bg-accent/50 transition-all duration-500 ${app.id === activeHighlight ? "bg-blue-500/10 ring-1 ring-blue-500/30 animate-pulse" : ""}`}>
                                                <td className="px-3 py-2"><Badge variant="outline" className="text-xs font-mono">{app.application_code}</Badge></td>
                                                <td className="px-3 py-2 text-sm font-medium">{app.program.title}</td>
                                                <td className="px-3 py-2 text-sm text-muted-foreground">{app.program.institution?.name || "DAKHLA Platform"}</td>
                                                <td className="px-3 py-2 text-sm text-muted-foreground">{app.program.category || "—"}</td>
                                                <td className="px-3 py-2"><StatusBadge status={app.status} /></td>
                                                <td className="px-3 py-2 text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</td>
                                                <td className="px-3 py-2">
                                                    <button onClick={() => setReviewApp(app)} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                                        <Eye className="size-3.5" /> Review
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
                    <DialogHeader><DialogTitle className="text-lg font-semibold">Application Review</DialogTitle></DialogHeader>
                    
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
