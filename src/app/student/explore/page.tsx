"use client";

import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Button as AntButton, message } from "antd";
import { CheckCircleOutlined, LoadingOutlined, SendOutlined } from "@ant-design/icons";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle2, Copy, X } from "lucide-react";

/* ─────────────────────────── Types ─────────────────────────── */

interface Program {
    id: number;
    title: string;
    institute_name: string;
    description: string | null;
    category: string | null;
    duration: string | null;
    created_at: string;
    fee: number | null;
    schedule_type: string | null;
    study_field: string | null;
    deadline: string | null;
    applicants?: number;
    program_code?: string;
    institution: { name: string; city: string | null; uniqueId?: string; planTier?: string };
    postedByPlatform?: boolean;
}

interface ProgramDetail {
    id: number;
    title: string;
    institute_name: string;
    description: string | null;
    category: string | null;
    duration: string | null;
    eligibility: string | null;
    deadline: string | null;
    application_method: string | null;
    external_url: string | null;
    is_active: boolean;
    created_at: string;
    fee: number | null;
    schedule_type: string | null;
    study_field: string | null;
    program_code?: string;
    institution: {
        id: number;
        name: string;
        city: string | null;
        category: string | null;
        description: string | null;
        contact_email: string | null;
        uniqueId?: string;
    };
    _count: { applications: number };
    questions?: { id: number; question: string; is_required: boolean }[];
    postedByPlatform?: boolean;
}

interface StudentPrefs {
    preferred_schedule: string | null;
    budget_min: number | null;
    budget_max: number | null;
    preferred_field: string | null;
}

const SCHEDULE_OPTIONS = ["Full-time", "Part-time", "Remote", "Hybrid"];

function MatchBadge({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            {label}
        </span>
    );
}

function getMatches(program: { fee?: number | null; schedule_type?: string | null; study_field?: string | null }, prefs: StudentPrefs | null): string[] {
    if (!prefs) return [];
    const matches: string[] = [];
    if (prefs.preferred_schedule && program.schedule_type && program.schedule_type.toLowerCase() === prefs.preferred_schedule.toLowerCase()) {
        matches.push(program.schedule_type);
    }
    if (prefs.preferred_field && program.study_field && program.study_field.toLowerCase().includes(prefs.preferred_field.toLowerCase())) {
        matches.push(program.study_field);
    }
    if (program.fee != null && prefs.budget_min != null && prefs.budget_max != null && program.fee >= prefs.budget_min && program.fee <= prefs.budget_max) {
        matches.push(`Rs ${program.fee.toLocaleString()}`);
    } else if (program.fee != null && prefs.budget_max != null && program.fee <= prefs.budget_max) {
        matches.push(`Rs ${program.fee.toLocaleString()}`);
    }
    return matches;
}

/* ─────────────────────────── Icons ─────────────────────────── */

const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

const ClockIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

const MapPinIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const SearchIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const ArrowLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);

const ApplyArrowIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" className="text-primary" fill="currentColor"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3l14 9-14 9V3z" />
    </svg>
);

const BuildingIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const UsersIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);

/* ─────────────────────────── Helpers ─────────────────────────── */

function isNewProgram(createdAt: string): boolean {
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    return Date.now() - new Date(createdAt).getTime() < twoDaysMs;
}

function ExplorePage() {
    const { fetchWithAuth } = useApi();
    const router = useRouter();
    const [urlProgramCode, setUrlProgramCode] = useState<string | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [perPage, setPerPage] = useState(12);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState<ProgramDetail | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [mobileView, setMobileView] = useState<"list" | "detail">("list");
    const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
    const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
    const [applyingId, setApplyingId] = useState<number | null>(null);
    // Student preferences for matching badges
    const [studentPrefs, setStudentPrefs] = useState<StudentPrefs | null>(null);
    // Advanced filters (always visible)
    const [scheduleFilter, setScheduleFilter] = useState("");
    const [studyFieldFilter, setStudyFieldFilter] = useState("");
    const [feeMin, setFeeMin] = useState("");
    const [feeMax, setFeeMax] = useState("");
    const [cityFilter, setCityFilter] = useState("");

    // ── Multi-step Application Wizard State ──
    const [wizardOpen, setWizardOpen] = useState(false);
    const [wizardProgramId, setWizardProgramId] = useState<number | null>(null);
    const [wizardQuestions, setWizardQuestions] = useState<{ id: number; question: string; is_required: boolean }[]>([]);
    const [wizardAnswers, setWizardAnswers] = useState<Record<number, string>>({});
    const [wizardStep, setWizardStep] = useState(0); // 0..N-1 = questions, N = CV upload step
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [isSubmittingApp, setIsSubmittingApp] = useState(false);
    const cvInputRef = useRef<HTMLInputElement>(null);

    // ── Success Modal State ──
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successAppCode, setSuccessAppCode] = useState("");
    const [successProgramTitle, setSuccessProgramTitle] = useState("");
    const [copied, setCopied] = useState(false);

    // ── Autocomplete Suggestions ──
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchInputRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Derive category tabs dynamically from loaded programs
    const categories = useMemo(() => {
        const cats = programs
            .map((p) => p.category)
            .filter((c): c is string => !!c);
        return ["All", ...Array.from(new Set(cats)).sort()];
    }, [programs]);

    // Load saved program IDs + student preferences on mount
    useEffect(() => {
        loadSavedIds();
        loadAppliedIds();
        loadStudentPrefs();
    }, []);

    async function loadStudentPrefs() {
        try {
            const res = await fetchWithAuth("/students/profile");
            if (res.ok) {
                const data = await res.json();
                const p = data.profile;
                if (p) {
                    setStudentPrefs({
                        preferred_schedule: p.preferred_schedule || null,
                        budget_min: p.budget_min ?? null,
                        budget_max: p.budget_max ?? null,
                        preferred_field: p.preferred_field || null,
                    });
                }
            }
        } catch { /* ignore */ }
    }

    async function loadAppliedIds() {
        const res = await fetchWithAuth("/applications");
        if (res.ok) {
            const data = await res.json();
            const ids: number[] = (data.applications ?? []).map(
                (app: { program_id?: number; program?: { id: number } }) =>
                    app.program_id ?? app.program?.id
            );
            setAppliedIds(new Set(ids.filter(Boolean)));
        }
    }

    useEffect(() => {
        loadPrograms();
    }, [page, category, perPage]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const programParam = params.get("program");
        if (programParam) {
            setUrlProgramCode(programParam);
        }
    }, []);

    // Auto-select program from URL ?program=CODE
    useEffect(() => {
        if (urlProgramCode && !isLoading && programs.length > 0 && !selectedId) {
            viewProgramDetail(urlProgramCode);
        }
    }, [urlProgramCode, isLoading, programs]);

    async function loadSavedIds() {
        const res = await fetchWithAuth("/saved");
        if (res.ok) {
            const data = await res.json();
            // Expecting data.saved to be an array of objects with a program_id or id field
            const ids: number[] = (data.saved ?? data).map(
                (item: { program_id?: number; program?: { id: number }; id?: number }) =>
                    item.program_id ?? item.program?.id ?? item.id
            );
            setSavedIds(new Set(ids.filter(Boolean)));
        }
    }

    async function loadPrograms(searchOverride?: string) {
        setIsLoading(true);
        const searchQuery = searchOverride !== undefined ? searchOverride : search;
        const params = new URLSearchParams({
            page: page.toString(),
            limit: perPage.toString(),
            ...(searchQuery && { search: searchQuery }),
            ...(category && category !== "All" && { category }),
            ...(scheduleFilter && { schedule_type: scheduleFilter }),
            ...(studyFieldFilter && { study_field: studyFieldFilter }),
            ...(feeMin && { fee_min: feeMin }),
            ...(feeMax && { fee_max: feeMax }),
            ...(cityFilter && { city: cityFilter }),
        });
        const res = await fetchWithAuth(`/programs?${params}`);
        if (res.ok) {
            const data = await res.json();
            setPrograms(data.programs);
            setTotalPages(data.pagination.totalPages);
        }
        setIsLoading(false);
    }

    function clearFilters() {
        setScheduleFilter("");
        setStudyFieldFilter("");
        setFeeMin("");
        setFeeMax("");
        setCityFilter("");
        setPage(1);
        // Reload with no filters next tick
        setTimeout(() => loadPrograms(), 0);
    }

    // ── Autocomplete: fetch suggestions when typing ──
    function handleSearchChange(value: string) {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (value.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        debounceRef.current = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ search: value, limit: "6", page: "1" });
                const res = await fetchWithAuth(`/programs?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    const titles: string[] = (data.programs ?? []).map((p: Program) => p.title);
                    // Also include unique institution names
                    const instNames = Array.from(new Set((data.programs ?? []).map((p: Program) => p.institution.name))) as string[];
                    const all = [...new Set([...titles, ...instNames])].slice(0, 6);
                    setSuggestions(all);
                    setShowSuggestions(all.length > 0);
                }
            } catch { /* ignore */ }
        }, 300);
    }

    function selectSuggestion(value: string) {
        setSearch(value);
        setShowSuggestions(false);
        setPage(1);
        loadPrograms(value);
    }

    const viewProgramDetail = async (programCodeOrId: string | number) => {
        const code = String(programCodeOrId);
        if (selectedId !== null && selectedProgram?.program_code === code) return;
        setIsDetailLoading(true);
        setMobileView("detail");
        // Update URL with program code
        const url = new URL(window.location.href);
        url.searchParams.set("program", code);
        window.history.replaceState({}, "", url.toString());
        const res = await fetchWithAuth(`/programs/${code}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedProgram(data.program);
            setSelectedId(data.program.id);
        } else {
            message.error("Could not load program details");
            setSelectedId(null);
            setMobileView("list");
        }
        setIsDetailLoading(false);
    };

    // Opens multi-step wizard — or redirects externally
    const handleApply = async (programId: number) => {
        try {
            // Fetch program detail to check application method + get questions  
            const res = await fetchWithAuth(`/programs/${programId}`);
            if (res.ok) {
                const data = await res.json();
                const program = data.program;

                // If external application method, redirect to external URL
                if (program?.application_method === "external" && program?.external_url) {
                    window.open(program.external_url, "_blank", "noopener,noreferrer");
                    return;
                }

                // Internal: open multi-step wizard
                const questions = program?.questions || [];
                setWizardQuestions(questions);
                setWizardAnswers({});
                setWizardStep(0);
                setCvFile(null);
                setWizardProgramId(programId);
                setWizardOpen(true);
            } else {
                message.error("Could not load program details");
            }
        } catch {
            message.error("Something went wrong.");
        }
    };

    // Total wizard steps: questions + 1 (CV upload)
    const totalWizardSteps = wizardQuestions.length + 1;
    const isOnCvStep = wizardStep >= wizardQuestions.length;

    const canGoNext = () => {
        if (isOnCvStep) return true;
        const q = wizardQuestions[wizardStep];
        if (q?.is_required) {
            return !!(wizardAnswers[q.id] && wizardAnswers[q.id].trim());
        }
        return true;
    };

    // Actually submits the application (with answers + optional CV)
    const submitApplication = async () => {
        if (!wizardProgramId) return;
        setApplyingId(wizardProgramId);
        setIsSubmittingApp(true);

        try {
            // Upload CV first if provided
            if (cvFile) {
                const formData = new FormData();
                formData.append("cv", cvFile);
                const cvRes = await fetchWithAuth("/students/profile/cv", {
                    method: "POST",
                    body: formData,
                });
                if (!cvRes.ok) {
                    message.error("Failed to upload CV. Application not submitted.");
                    setIsSubmittingApp(false);
                    setApplyingId(null);
                    return;
                }
            }

            // Build answers array
            const answers = wizardQuestions
                .filter((q) => wizardAnswers[q.id] && wizardAnswers[q.id].trim())
                .map((q) => ({ question_id: q.id, answer: wizardAnswers[q.id].trim() }));

            // Submit application
            const res = await fetchWithAuth("/applications", {
                method: "POST",
                body: JSON.stringify({ program_id: wizardProgramId, answers }),
            });
            const data = await res.json();
            if (res.ok) {
                setAppliedIds((prev) => new Set(prev).add(wizardProgramId));
                setWizardOpen(false);
                // Show success dialog
                const progTitle = programs.find(p => p.id === wizardProgramId)?.title || selectedProgram?.title || "";
                setSuccessProgramTitle(progTitle);
                setSuccessAppCode(data.application?.application_code || "");
                setSuccessModalOpen(true);
                setCopied(false);
            } else {
                message.error(data.error || "Failed to submit application");
            }
        } catch {
            message.error("Something went wrong. Please try again.");
        } finally {
            setApplyingId(null);
            setIsSubmittingApp(false);
        }
    };

    const handleSave = async (programId: number) => {
        const res = await fetchWithAuth("/saved", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        if (res.ok) {
            const data = await res.json();
            message.success(data.message);
            // Toggle saved state for bookmark icon
            setSavedIds((prev) => {
                const next = new Set(prev);
                if (next.has(programId)) next.delete(programId);
                else next.add(programId);
                return next;
            });
        }
    };

    return (
        <DashboardLayout role="student">

            {/* ── Page title + search bar ── */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-5">Explore Programs</h1>

                {/* Search row */}
                <div className="flex gap-2">
                    <div className="relative flex-1" ref={searchInputRef}>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <SearchIcon />
                        </span>
                        <Input
                            placeholder="Search programs, institutions..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { setShowSuggestions(false); setPage(1); loadPrograms(); } }}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            className="h-11 pl-10 rounded-xl"
                        />
                        {/* Autocomplete dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onMouseDown={() => selectSuggestion(s)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-accent/70 cursor-pointer flex items-center gap-2 border-b border-border last:border-b-0"
                                    >
                                        <SearchIcon />
                                        <span className="truncate">{s}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button
                        onClick={() => { setShowSuggestions(false); setPage(1); loadPrograms(); }}
                        className="h-11 px-5 bg-primary hover:bg-primary/90 rounded-xl font-medium shadow-sm"
                    >
                        Search
                    </Button>
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {categories.map((cat) => {
                        const active = category === cat || (cat === "All" && !category);
                        return (
                            <button
                                key={cat}
                                onClick={() => { setCategory(cat === "All" ? "" : cat); setPage(1); }}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer ${active
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                                    }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Collapsible Filters Panel ── */}
            <div className="mb-5">
                <button
                    onClick={() => {
                        const el = document.getElementById('explore-filters');
                        if (el) el.classList.toggle('hidden');
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-3"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                    Advanced Filters
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
                <div id="explore-filters" className="hidden">
                    <div className="p-4 border border-border rounded-xl bg-card space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {/* Schedule Type */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Schedule</label>
                            <select
                                value={scheduleFilter}
                                onChange={(e) => setScheduleFilter(e.target.value)}
                                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                            >
                                <option value="">All</option>
                                {SCHEDULE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        {/* Study Field */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Study Field</label>
                            <Input
                                placeholder="e.g., Computer Science"
                                value={studyFieldFilter}
                                onChange={(e) => setStudyFieldFilter(e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">City</label>
                            <Input
                                placeholder="e.g., Lahore"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* Budget Min */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Fee Min (PKR)</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={feeMin}
                                onChange={(e) => setFeeMin(e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* Budget Max */}
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Fee Max (PKR)</label>
                            <Input
                                type="number"
                                placeholder="1000000"
                                value={feeMax}
                                onChange={(e) => setFeeMax(e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>

                        <div className="flex items-center gap-3 pt-1">
                            <Button
                                onClick={() => { setPage(1); loadPrograms(); }}
                                className="h-9 px-6 bg-primary hover:bg-primary/90 text-sm font-medium rounded-lg"
                            >
                                Apply Filters
                            </Button>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Split layout ── */}
            <div className="flex gap-0 min-h-[70vh]" style={{ height: "calc(100vh - 260px)" }}>

                {/* ════ LEFT PANEL — Card list ════ */}
                <div className={`
                    flex-shrink-0 overflow-y-auto
                    w-full md:w-[380px] lg:w-[420px]
                    md:border-r border-border
                    pr-0 md:pr-0
                    ${mobileView === "detail" ? "hidden md:flex md:flex-col" : "flex flex-col"}
                `}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-16">
                            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary mb-3" />
                            <p className="text-sm text-muted-foreground">Loading programs…</p>
                        </div>
                    ) : programs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-16 text-center px-4">
                            <p className="text-foreground font-medium">No programs found</p>
                            <p className="text-sm text-muted-foreground mt-1">Try different search terms or category</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-0 flex-1">
                                {programs.map((program) => (
                                    <ProgramCard
                                        key={program.id}
                                        program={program}
                                        isSelected={selectedId === program.id}
                                        isSaved={savedIds.has(program.id)}
                                        studentPrefs={studentPrefs}
                                        onClick={() => viewProgramDetail(program.program_code || String(program.id))}
                                        onSave={(e) => { e.stopPropagation(); handleSave(program.id); }}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card flex-shrink-0">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                        className="text-sm font-medium text-primary disabled:text-muted-foreground disabled:cursor-not-allowed hover:underline cursor-pointer"
                                    >
                                        ← Previous
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground">
                                            Page {page} of {totalPages}
                                        </span>
                                        <select
                                            value={perPage}
                                            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                                            className="h-7 px-2 text-xs rounded border border-border bg-background text-foreground cursor-pointer"
                                        >
                                            <option value={10}>10/page</option>
                                            <option value={20}>20/page</option>
                                            <option value={50}>50/page</option>
                                        </select>
                                    </div>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="text-sm font-medium text-primary disabled:text-muted-foreground disabled:cursor-not-allowed hover:underline cursor-pointer"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ════ RIGHT PANEL — Detail view ════ */}
                <div className={`
                    flex-1 overflow-y-auto bg-card
                    ${mobileView === "detail" ? "flex flex-col w-full" : "hidden md:flex md:flex-col"}
                `}>
                    {/* Mobile back button */}
                    <button
                        className="md:hidden flex items-center gap-2 text-sm font-medium text-primary px-4 pt-4 pb-2 cursor-pointer"
                        onClick={() => setMobileView("list")}
                    >
                        <ArrowLeftIcon /> Back to results
                    </button>

                    {isDetailLoading ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-16">
                            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary mb-3" />
                            <p className="text-sm text-muted-foreground">Loading details…</p>
                        </div>
                    ) : !selectedProgram ? (
                        /* Empty state — no card selected */
                        <div className="hidden md:flex flex-col items-center justify-center flex-1 px-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                                    className="text-primary">
                                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <p className="text-base font-semibold text-foreground mb-1">Select a program</p>
                            <p className="text-sm text-muted-foreground">Click on any program card on the left to view its details here.</p>
                        </div>
                    ) : (
                        /* ── Detail Content ── */
                        <DetailPanel
                            program={selectedProgram}
                            isSaved={savedIds.has(selectedProgram.id)}
                            isApplied={appliedIds.has(selectedProgram.id)}
                            isApplying={applyingId === selectedProgram.id}
                            studentPrefs={studentPrefs}
                            onApply={handleApply}
                            onSave={handleSave}
                            onInstitutionClick={(uid: string) => { router.push(`/student/institution/${uid}`); }}
                        />
                    )}
                </div>
            </div>

            {/* ═══════════ Multi-Step Application Wizard ═══════════ */}
            <Dialog open={wizardOpen} onOpenChange={(open) => { if (!open) { setWizardOpen(false); setCvFile(null); setWizardStep(0); } }}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Upload className="w-5 h-5 text-blue-500" />
                            Apply to Program
                        </DialogTitle>
                        <DialogDescription>
                            {wizardQuestions.length > 0
                                ? `Step ${wizardStep + 1} of ${totalWizardSteps} — ${isOnCvStep ? "Upload CV" : "Answer Question"}`
                                : "Upload your CV/resume to strengthen your application."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {/* Progress bar */}
                    {totalWizardSteps > 1 && (
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                                style={{ width: `${((wizardStep + 1) / totalWizardSteps) * 100}%` }}
                            />
                        </div>
                    )}

                    <div className="space-y-5 pt-1">
                        {/* ── Question Step ── */}
                        {!isOnCvStep && wizardQuestions[wizardStep] && (
                            <div className="space-y-3">
                                <div className="bg-accent rounded-xl p-4 border border-border">
                                    <p className="text-[13px] text-muted-foreground font-medium mb-1">
                                        Question {wizardStep + 1} of {wizardQuestions.length}
                                        {wizardQuestions[wizardStep].is_required && (
                                            <span className="text-red-500 ml-1">*</span>
                                        )}
                                    </p>
                                    <p className="text-[15px] font-semibold text-foreground leading-snug">
                                        {wizardQuestions[wizardStep].question}
                                    </p>
                                </div>
                                <textarea
                                    value={wizardAnswers[wizardQuestions[wizardStep].id] || ""}
                                    onChange={(e) => setWizardAnswers({
                                        ...wizardAnswers,
                                        [wizardQuestions[wizardStep].id]: e.target.value,
                                    })}
                                    placeholder="Type your answer here..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder:text-muted-foreground"
                                />
                                {wizardQuestions[wizardStep].is_required && !wizardAnswers[wizardQuestions[wizardStep].id]?.trim() && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        This question is required
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ── CV Upload Step ── */}
                        {isOnCvStep && (
                            <div className="space-y-3">
                                <div className="bg-accent rounded-xl p-4 border border-border">
                                    <p className="text-[13px] text-muted-foreground font-medium mb-1">
                                        Final Step
                                    </p>
                                    <p className="text-[15px] font-semibold text-foreground leading-snug">
                                        Upload your CV / Resume (Optional)
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Attach your CV to strengthen your application. You can skip this step.
                                    </p>
                                </div>
                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 ${cvFile ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" : "border-border"}`}
                                    onClick={() => cvInputRef.current?.click()}
                                >
                                    <input
                                        ref={cvInputRef}
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={(e) => { if (e.target.files?.[0]) setCvFile(e.target.files[0]); }}
                                    />
                                    {cvFile ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-foreground">{cvFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                                                className="ml-auto p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                                <Upload className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">Click to select your CV</p>
                                            <p className="text-xs text-muted-foreground mt-1">PDF format only, max 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Navigation Buttons ── */}
                        <div className="flex gap-3">
                            {wizardStep > 0 && (
                                <Button
                                    variant="outline"
                                    className="h-11 px-5"
                                    onClick={() => setWizardStep(wizardStep - 1)}
                                    disabled={isSubmittingApp}
                                >
                                    ← Back
                                </Button>
                            )}

                            {!isOnCvStep ? (
                                <Button
                                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                    disabled={!canGoNext()}
                                    onClick={() => setWizardStep(wizardStep + 1)}
                                >
                                    Next →
                                </Button>
                            ) : (
                                <div className="flex gap-3 flex-1">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-11"
                                        disabled={isSubmittingApp}
                                        onClick={() => { setCvFile(null); submitApplication(); }}
                                    >
                                        {cvFile ? "Skip CV" : "Submit"} {!cvFile && "Application"}
                                    </Button>
                                    {cvFile && (
                                        <Button
                                            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                                            disabled={isSubmittingApp}
                                            onClick={submitApplication}
                                        >
                                            {isSubmittingApp ? "Submitting..." : "Upload & Apply"}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ═══════════ Success Modal ═══════════ */}
            <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
                <DialogContent className="sm:max-w-[420px] text-center">
                    {/* Decorative success circle */}
                    <div className="flex justify-center pt-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <DialogHeader className="pt-4">
                        <DialogTitle className="text-xl font-bold text-center">Application Submitted!</DialogTitle>
                        <DialogDescription className="text-center text-sm pt-1">
                            Your application for <strong className="text-foreground">{successProgramTitle}</strong> has been submitted successfully.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Application Code */}
                    {successAppCode && (
                        <div className="mx-4 my-4">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application Code</Label>
                            <div className="mt-2 flex items-center justify-center gap-2 p-4 rounded-xl bg-accent border border-border">
                                <code className="text-lg font-bold font-mono text-foreground tracking-wider">{successAppCode}</code>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(successAppCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                    title="Copy code"
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Use this code to track your application status.</p>
                        </div>
                    )}

                    <div className="px-4 pb-4">
                        <Button
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                            onClick={() => setSuccessModalOpen(false)}
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </DashboardLayout>
    );
}

export default function ExplorePageWrapper() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary" /></div>}>
            <ExplorePage />
        </Suspense>
    );
}

/* ─────────────── Left Panel Card ──────────────────────────── */

function ProgramCard({
    program,
    isSelected,
    isSaved,
    studentPrefs,
    onClick,
    onSave,
}: {
    program: Program;
    isSelected: boolean;
    isSaved: boolean;
    studentPrefs: StudentPrefs | null;
    onClick: () => void;
    onSave: (e: React.MouseEvent) => void;
}) {
    const matches = getMatches(program, studentPrefs);
    const tier = program.institution.planTier || "Starter";
    const isGrowth = tier.toLowerCase().includes("growth");
    const isPro = tier.toLowerCase().includes("pro");
    const isFeatured = tier.toLowerCase().includes("featured");
    const isPlatform = program.postedByPlatform || false;
    const isPremium = isGrowth || isPro || isFeatured || isPlatform;

    // Tier-specific styles
    const tierBorder = isPlatform
        ? "border-l-blue-600"
        : isFeatured
            ? "border-l-amber-500"
            : isPro
                ? "border-l-purple-500"
                : isGrowth
                    ? "border-l-blue-500"
                    : "border-l-transparent";

    const tierGlow = isFeatured
        ? "shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]"
        : isPro
            ? "shadow-[0_0_12px_-3px_rgba(139,92,246,0.15)] hover:shadow-[0_0_18px_-3px_rgba(139,92,246,0.25)]"
            : "";

    return (
        <div
            onClick={onClick}
            className={`
                relative px-4 py-4 cursor-pointer
                border-b border-border
                transition-all duration-200
                border-l-[3px]
                ${isSelected
                    ? `bg-primary/5 border-l-primary`
                    : `bg-card hover:bg-muted/50 ${isPremium && !isSelected ? tierBorder : "border-l-transparent"}`
                }
                ${tierGlow}
            `}
        >
            {/* Row 1: badge + plan tier + save icon */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isNewProgram(program.created_at) && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                            New
                        </span>
                    )}
                    {isPlatform && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/15 border border-blue-600/30 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            ✦ DAKHLA
                        </span>
                    )}
                    {isFeatured && !isPlatform && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            Featured
                        </span>
                    )}
                    {isPro && !isFeatured && !isPlatform && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Pro
                        </span>
                    )}
                    {isGrowth && !isPlatform && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /></svg>
                            Growth
                        </span>
                    )}
                </div>
                <button
                    onClick={onSave}
                    className={`p-1 rounded transition-colors cursor-pointer ${isSaved
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        }`}
                    aria-label={isSaved ? "Unsave program" : "Save program"}
                >
                    <BookmarkIcon filled={isSaved} />
                </button>
            </div>

            {/* Row 2: Title */}
            <h3 className={`text-[15px] font-bold leading-snug mb-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
                {program.title}
            </h3>

      {/* Row 3: Institution + city */}

            <div className="text-[13px] text-muted-foreground leading-snug mb-3">

                <p>{program.postedByPlatform ? (program.institute_name || "DAKHLA Platform") : program.institution.name}</p>

                {!program.postedByPlatform && program.institution.city && <p>{program.institution.city}</p>}

            </div>

            {/* Row 4: Pills */}
            <div className="flex flex-wrap gap-2 mb-2">
                {program.category && (
                    <span className="inline-flex items-center border border-border bg-muted/50 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground whitespace-nowrap">
                        {program.category}
                    </span>
                )}
                {program.duration && (
                    <span className="inline-flex items-center gap-1.5 border border-border bg-muted/50 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground whitespace-nowrap">
                        <ClockIcon /> {program.duration}
                    </span>
                )}
                {program.institution.city && (
                    <span className="inline-flex items-center gap-1.5 border border-border bg-muted/50 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground whitespace-nowrap">
                        <MapPinIcon /> {program.institution.city}
                    </span>
                )}
                {program.fee != null && (
                    <span className="inline-flex items-center border border-border bg-muted/50 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground whitespace-nowrap">
                        Rs {program.fee.toLocaleString()}
                    </span>
                )}
                {program.schedule_type && (
                    <span className="inline-flex items-center border border-border bg-muted/50 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground whitespace-nowrap">
                        {program.schedule_type}
                    </span>
                )}
                {program.applicants != null && (
                    <span className="inline-flex items-center gap-1.5 border border-border bg-muted/50 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground whitespace-nowrap">
                        <UsersIcon /> {program.applicants} applicant{program.applicants !== 1 ? "s" : ""}
                    </span>
                )}
                {program.deadline && new Date(program.deadline) < new Date() && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                        Expired
                    </span>
                )}
            </div>

            {/* Matched attributes */}
            {matches.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {matches.map((m) => <MatchBadge key={m} label={m} />)}
                </div>
            )}

            {/* Row 5: Easily apply */}
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-primary">
                <ApplyArrowIcon />
                Easily apply
            </div>
        </div>
    );
}

/* ─────────────── Right Panel Detail ───────────────────────── */

function DetailPanel({
    program,
    isSaved,
    isApplied,
    isApplying,
    studentPrefs,
    onApply,
    onSave,
    onInstitutionClick,
}: {
    program: ProgramDetail;
    isSaved: boolean;
    isApplied: boolean;
    isApplying: boolean;
    studentPrefs: StudentPrefs | null;
    onApply: (id: number) => void;
    onSave: (id: number) => void;
    onInstitutionClick: (uniqueId: string) => void;
}) {
    const matches = getMatches(program, studentPrefs);
    return (
        <div className="h-full flex flex-col">

            {/* ── Top section: title, institution, meta ── */}
            <div className="px-6 pt-6 pb-5 border-b border-border flex-shrink-0">

                {/* Title */}
                <h2 className="text-[22px] font-bold text-foreground leading-snug mb-1">
                    {program.title}
                </h2>

                {/* Institute Name */}
                <h2 className="text-[16px] font-semibold text-primary/90 leading-snug">
            {program.institute_name && program.institute_name.trim() !== "" 
                ? program.institute_name 
                : "DAKHLA Platform"}
        </h2>

                {/* Institution with external link */}
                {program.postedByPlatform ? (
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-500/30">
                            ✦ Posted by DAKHLA Platform
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-1.5 mb-1">
                            <button
                                onClick={() => onInstitutionClick(program.institution.uniqueId || String(program.institution.id))}
                                className="text-[14px] text-foreground font-medium underline decoration-dotted underline-offset-2 hover:text-primary flex items-center gap-1 cursor-pointer"
                            >
                                {program.institution.name}
                                <ExternalLinkIcon />
                            </button>
                        </div>

                        {/* City */}
                        {program.institution.city && (
                            <p className="text-[14px] text-muted-foreground mb-1">{program.institution.city}</p>
                        )}
                    </>
                )}

                {/* Duration / category row */}
                {(program.duration || program.category) && (
                    <p className="text-[14px] text-foreground font-medium mb-4">
                        {[program.category, program.duration && `${program.duration}`].filter(Boolean).join(" · ")}
                    </p>
                )}

                {/* Action buttons row */}
                <div className="flex items-center gap-2 mt-4">
                    {isApplied ? (
                        <AntButton
                            disabled
                            icon={<CheckCircleOutlined />}
                            size="large"
                            shape="round"
                            className="font-bold text-sm"
                            style={{ opacity: 0.85 }}
                        >
                            Already Applied
                        </AntButton>
                    ) : program.deadline && new Date(program.deadline) < new Date() ? (
                        <AntButton
                            disabled
                            size="large"
                            shape="round"
                            className="font-bold text-sm"
                            style={{ opacity: 0.7 }}
                        >
                            Deadline Expired
                        </AntButton>
                    ) : (
                        <AntButton
                            type="primary"
                            icon={isApplying ? <LoadingOutlined /> : <SendOutlined />}
                            loading={isApplying}
                            onClick={() => onApply(program.id)}
                            size="large"
                            shape="round"
                            className="font-bold text-sm shadow-sm"
                        >
                            {isApplying ? "Applying..." : "Apply now"}
                        </AntButton>
                    )}

                    {/* Bookmark icon button — filled when saved */}
                    <button
                        onClick={() => onSave(program.id)}
                        aria-label={isSaved ? "Unsave" : "Save"}
                        className={`h-10 w-10 flex items-center justify-center rounded-full border transition-all cursor-pointer ${isSaved
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10"
                            }`}
                    >
                        <BookmarkIcon filled={isSaved} />
                    </button>
                </div>
            </div>

            {/* Matched attributes banner */}
            {matches.length > 0 && (
                <div className="px-6 py-3 border-b border-border bg-emerald-50/50 dark:bg-emerald-500/5 flex-shrink-0">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Matches your preferences</p>
                    <div className="flex flex-wrap gap-2">
                        {matches.map((m) => <MatchBadge key={m} label={m} />)}
                    </div>
                </div>
            )}

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Program details section */}
                <div>
                    <h3 className="text-[17px] font-bold text-foreground mb-0.5">Program details</h3>
                    <p className="text-[13px] text-muted-foreground mb-4">
                        Here's how this program aligns with your profile.
                    </p>

                    {/* Detail rows */}
                    <div className="space-y-4">
                        
                        

                        {/* Category */}
                        {program.category && (
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 text-muted-foreground flex-shrink-0"><BuildingIcon /></span>
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground mb-1.5">Category</p>
                                    <span className="inline-flex items-center border border-border bg-muted/50 rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground">
                                        {program.category}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Duration */}
                        {program.duration && (
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 text-muted-foreground flex-shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground mb-1.5">Duration</p>
                                    <span className="inline-flex items-center border border-border bg-muted/50 rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground">
                                        {program.duration}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Deadline */}
                        {program.deadline && (
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 text-muted-foreground flex-shrink-0"><CalendarIcon /></span>
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground mb-1.5">Application deadline</p>
                                    <span className="inline-flex items-center border border-border bg-muted/50 rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground">
                                        {new Date(program.deadline).toLocaleDateString("en-US", {
                                            year: "numeric", month: "long", day: "numeric"
                                        })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Applicants */}
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-muted-foreground flex-shrink-0"><UsersIcon /></span>
                            <div>
                                <p className="text-[13px] font-semibold text-foreground mb-1.5">Applicants</p>
                                <span className="inline-flex items-center border border-border bg-muted/50 rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground">
                                    {program._count.applications} applicant{program._count.applications !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>

                        {/* Application Method */}
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 text-muted-foreground flex-shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </span>
                            <div>
                                <p className="text-[13px] font-semibold text-foreground mb-1.5">Application method</p>
                                <span className="inline-flex items-center border border-border bg-muted/50 rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground">
                                    {program.application_method === "external" ? "External Application" : "Apply via GAP"}
                                </span>
                            </div>
                        </div>

                        {/* Fee */}
                        {program.fee != null && (
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 text-muted-foreground flex-shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground mb-1.5">Total Fee</p>
                                    <span className="inline-flex items-center border border-border bg-muted/50 rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground">
                                        Rs {program.fee.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Schedule Type */}
                        {program.schedule_type && (
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 text-muted-foreground flex-shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3v4M8 3v4M2 11h20" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground mb-1.5">Schedule</p>
                                    <span className="inline-flex items-center border border-border bg-muted/50 rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground">
                                        {program.schedule_type}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Study Field */}
                        {program.study_field && (
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 text-muted-foreground flex-shrink-0">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground mb-1.5">Study Field</p>
                                    <span className="inline-flex items-center border border-border bg-muted/50 rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground">
                                        {program.study_field}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Eligibility */}
                {program.eligibility && (
                    <div className="border-t pt-5">
                        <h3 className="text-[15px] font-bold text-foreground mb-3">Eligibility requirements</h3>
                        <p className="text-[14px] text-muted-foreground whitespace-pre-line leading-relaxed">
                            {program.eligibility}
                        </p>
                    </div>
                )}

                {/* Program Description */}
                {program.description && (
                    <div className="border-t pt-5">
                        <h3 className="text-[15px] font-bold text-foreground mb-3">About this program</h3>
                        <p className="text-[14px] text-muted-foreground whitespace-pre-line leading-relaxed">
                            {program.description}
                        </p>
                    </div>
                )}

                {/* Application Questions */}
                {program.questions && program.questions.length > 0 && (
                    <div className="border-t pt-5">
                        <h3 className="text-[15px] font-bold text-foreground mb-3">Application Questions</h3>
                        <p className="text-[13px] text-muted-foreground mb-3">You will need to answer these questions when applying:</p>
                        <ul className="space-y-2">
                            {program.questions.map((q, i) => (
                                <li key={q.id} className="text-[14px] text-foreground flex items-start gap-2">
                                    <span className="font-semibold text-muted-foreground">{i + 1}.</span>
                                    <span>{q.question}{q.is_required && <span className="text-red-400 ml-1">*</span>}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Institution info */}
                {program.postedByPlatform ? (
                    <div className="border-t pt-5">
                        <h3 className="text-[15px] font-bold text-foreground mb-3">Posted by</h3>
                        <p className="text-[13px] text-foreground font-medium">DAKHLA Platform</p>
                        <p className="text-[13px] text-muted-foreground mt-1">This program is posted directly by the DAKHLA platform.</p>
                    </div>
                ) : (
                    <div className="border-t pt-5">
                        <h3 className="text-[15px] font-bold text-foreground mb-3">About the institution</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Name</p>
                                <p className="text-[13px] text-foreground font-medium">{program.institution.name}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Type</p>
                                <p className="text-[13px] text-foreground capitalize">{program.institution.category || "—"}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">City</p>
                                <p className="text-[13px] text-foreground">{program.institution.city || "—"}</p>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Contact</p>
                                <p className="text-[13px] text-foreground truncate">{program.institution.contact_email || "—"}</p>
                            </div>
                        </div>
                        {program.institution.description && (
                            <p className="text-[13px] text-muted-foreground mt-3 leading-relaxed">
                                {program.institution.description}
                            </p>
                        )}
                    </div>
                )}

                {/* Bottom padding */}
                <div className="h-4" />
            </div>
        </div>
    );
}