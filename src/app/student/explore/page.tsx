"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Button as AntButton, message } from "antd";
import { CheckCircleOutlined, LoadingOutlined, SendOutlined } from "@ant-design/icons";

/* ─────────────────────────── Types ─────────────────────────── */

interface Program {
    id: number;
    title: string;
    category: string | null;
    duration: string | null;
    created_at: string;
    institution: { name: string; city: string | null; planTier?: string };
}

interface ProgramDetail {
    id: number;
    title: string;
    category: string | null;
    duration: string | null;
    eligibility: string | null;
    deadline: string | null;
    application_method: string | null;
    external_url: string | null;
    is_active: boolean;
    created_at: string;
    institution: {
        id: number;
        name: string;
        city: string | null;
        category: string | null;
        description: string | null;
        contact_email: string | null;
    };
    _count: { applications: number };
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
    const searchParams = useSearchParams();
    const [programs, setPrograms] = useState<Program[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState<ProgramDetail | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    // Mobile: show detail panel instead of list
    const [mobileView, setMobileView] = useState<"list" | "detail">("list");
    // Track saved program IDs for bookmark toggle UI
    const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
    const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
    const [applyingId, setApplyingId] = useState<number | null>(null);

    // Derive category tabs dynamically from loaded programs
    const categories = useMemo(() => {
        const cats = programs
            .map((p) => p.category)
            .filter((c): c is string => !!c);
        return ["All", ...Array.from(new Set(cats)).sort()];
    }, [programs]);

    // Load saved program IDs on mount so bookmarks persist across refreshes
    useEffect(() => {
        loadSavedIds();
        loadAppliedIds();
    }, []);

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
    }, [page, category]);

    // Auto-select program from URL ?program=ID
    useEffect(() => {
        const programParam = searchParams.get("program");
        if (programParam && !isLoading && programs.length > 0 && !selectedId) {
            const programId = parseInt(programParam, 10);
            if (!isNaN(programId)) {
                viewProgramDetail(programId);
            }
        }
    }, [searchParams, isLoading, programs]);

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
            limit: "12",
            ...(searchQuery && { search: searchQuery }),
            ...(category && category !== "All" && { category }),
        });
        const res = await fetchWithAuth(`/programs?${params}`);
        if (res.ok) {
            const data = await res.json();
            setPrograms(data.programs);
            setTotalPages(data.pagination.totalPages);
        }
        setIsLoading(false);
    }

    const viewProgramDetail = async (programId: number) => {
        if (selectedId === programId) return;
        setSelectedId(programId);
        setIsDetailLoading(true);
        setMobileView("detail");
        const res = await fetchWithAuth(`/programs/${programId}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedProgram(data.program);
        } else {
            message.error("Could not load program details");
            setSelectedId(null);
            setMobileView("list");
        }
        setIsDetailLoading(false);
    };

    const handleApply = async (programId: number) => {
        setApplyingId(programId);
        try {
            const res = await fetchWithAuth("/applications", {
                method: "POST",
                body: JSON.stringify({ program_id: programId }),
            });
            const data = await res.json();
            if (res.ok) {
                message.success("Application submitted successfully!");
                setAppliedIds((prev) => new Set(prev).add(programId));
            } else {
                message.error(data.error || "Failed to submit application");
            }
        } catch {
            message.error("Something went wrong. Please try again.");
        } finally {
            setApplyingId(null);
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
            <div className="mb-5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Explore Programs</h1>

                {/* Search row */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <SearchIcon />
                        </span>
                        <Input
                            placeholder="Search programs, institutions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (setPage(1), loadPrograms())}
                            className="h-11 pl-10 rounded-xl"
                        />
                    </div>
                    <Button
                        onClick={() => { setPage(1); loadPrograms(); }}
                        className="h-11 px-5 bg-primary hover:bg-primary/90 rounded-xl font-medium shadow-sm"
                    >
                        Search
                    </Button>
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap gap-2 mt-3">
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
                                        onClick={() => viewProgramDetail(program.id)}
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
                                    <span className="text-xs text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </span>
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
                            onApply={handleApply}
                            onSave={handleSave}
                            onInstitutionClick={(id: number) => { router.push(`/student/institution/${id}`); }}
                        />
                    )}
                </div>
            </div>
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
    onClick,
    onSave,
}: {
    program: Program;
    isSelected: boolean;
    isSaved: boolean;
    onClick: () => void;
    onSave: (e: React.MouseEvent) => void;
}) {
    const tier = program.institution.planTier || "Starter";
    const isGrowth = tier.toLowerCase().includes("growth");
    const isPro = tier.toLowerCase().includes("pro");
    const isFeatured = tier.toLowerCase().includes("featured");
    const isPremium = isGrowth || isPro || isFeatured;

    // Tier-specific styles
    const tierBorder = isFeatured
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
                    {isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            Featured
                        </span>
                    )}
                    {isPro && !isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Pro
                        </span>
                    )}
                    {isGrowth && (
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
                <p>{program.institution.name}</p>
                {program.institution.city && <p>{program.institution.city}</p>}
            </div>

            {/* Row 4: Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
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
            </div>

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
    onApply,
    onSave,
    onInstitutionClick,
}: {
    program: ProgramDetail;
    isSaved: boolean;
    isApplied: boolean;
    isApplying: boolean;
    onApply: (id: number) => void;
    onSave: (id: number) => void;
    onInstitutionClick: (id: number) => void;
}) {
    return (
        <div className="h-full flex flex-col">

            {/* ── Top section: title, institution, meta ── */}
            <div className="px-6 pt-6 pb-5 border-b border-border flex-shrink-0">

                {/* Title */}
                <h2 className="text-[22px] font-bold text-foreground leading-snug mb-1">
                    {program.title}
                </h2>

                {/* Institution with external link */}
                <div className="flex items-center gap-1.5 mb-1">
                    <button
                        onClick={() => onInstitutionClick(program.institution.id)}
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

                {/* Institution info */}
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

                {/* Bottom padding */}
                <div className="h-4" />
            </div>
        </div>
    );
}