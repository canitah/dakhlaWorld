"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { message } from "antd";

interface SavedItem {
    id: number;
    program: {
        id: number;
        title: string;
        category: string | null;
        program_code: string;
        institution: { name: string; city: string | null };
    };
}

// 1. Define the interface
interface IconProps {
  className?: string;
}


/* ── Icons ─────────────────────────────────────────────────── */

const BookmarkFilledIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const MapPinIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const TagIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);

const ApplyArrowIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"
        className="text-primary">
        <path d="M5 3l14 9-14 9V3z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

/* ════════════════════════════════════════════════════════════ */
/*  Main Page                                                   */
/* ════════════════════════════════════════════════════════════ */

export default function SavedProgramsPage() {
    const { fetchWithAuth } = useApi();
    const router = useRouter();
    const [saved, setSaved] = useState<SavedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // Track which programs have been applied during this session
    const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadSaved();
    }, []);

    async function loadSaved() {
        const res = await fetchWithAuth("/saved");
        if (res.ok) {
            const data = await res.json();
            setSaved(data.saved);
        }
        setIsLoading(false);
    }

    const handleUnsave = async (programId: number) => {
        const res = await fetchWithAuth("/saved", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        if (res.ok) {
            message.success("Program removed from saved");
            loadSaved();
        }
    };

    const handleApply = async (programId: number) => {
        const res = await fetchWithAuth("/applications", {
            method: "POST",
            body: JSON.stringify({ program_id: programId }),
        });
        const data = await res.json();
        if (res.ok) {
            message.success("Application submitted!");
            setAppliedIds((prev) => new Set(prev).add(programId));
        } else {
            message.error(data.error);
            if (data.error?.toLowerCase().includes("already applied")) {
                setAppliedIds((prev) => new Set(prev).add(programId));
            }
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary" />
                        <p className="text-sm text-muted-foreground">Loading saved programs…</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">

            {/* ── Page Header ── */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Saved Programs</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {saved.length} program{saved.length !== 1 ? "s" : ""} saved
                </p>
            </div>

            {/* ── Empty State ── */}
            {saved.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl py-20 text-center px-4 bg-card">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        <BookmarkFilledIcon />
                    </div>
                    <p className="text-base font-semibold text-foreground mb-1">No saved programs</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Click the bookmark icon on any program to save it for later.
                    </p>
                </div>

            ) : (
                /* ── Cards Grid ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {saved.map((item) => {
                        const isApplied = appliedIds.has(item.program.id);
                        return (
                            <SavedCard
                                key={item.id}
                                item={item}
                                isApplied={isApplied}
                                onApply={handleApply}
                                onUnsave={handleUnsave}
                                onCardClick={() => router.push(`/student/explore?program=${item.program.program_code}`)}
                            />
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}

/* ── Individual Saved Card ──────────────────────────────────── */

function SavedCard({
    item,
    isApplied,
    onApply,
    onUnsave,
    onCardClick,
}: {
    item: SavedItem;
    isApplied: boolean;
    onApply: (id: number) => void;
    onUnsave: (id: number) => void;
    onCardClick: () => void;
}) {
    return (
        <div
            onClick={onCardClick}
            className="
                group bg-card rounded-2xl cursor-pointer
                border border-primary/20
                shadow-sm p-5 flex flex-col gap-3
                transition-all duration-200
                hover:shadow-md hover:border-primary/40
            "
        >
            {/* Row 1 — badge + bookmark */}
            <div className="flex items-start justify-between">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    Saved
                </span>
                {/* Bookmark — stop propagation so it doesn't trigger card click */}
                <button
                    onClick={(e) => { e.stopPropagation(); onUnsave(item.program.id); }}
                    aria-label="Remove from saved"
                    className="p-1 rounded text-primary hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Remove from saved"
                >
                    <BookmarkFilledIcon />
                </button>
            </div>

            {/* Row 2 — title + institution (clickable body) */}
            <div className="flex flex-col gap-1">
                <h3 className="text-[15px] font-bold text-foreground leading-snug line-clamp-2">
                    {item.program.title}
                </h3>
                <div className="text-[13px] text-muted-foreground leading-snug">
                   <p>{item.program?.institution?.name || "DAKHLA Platform"}</p>
    
    {/* Safe check for city */}
    {item.program?.institution?.city && (
        <p>{item.program.institution.city}</p>
                    )}
                </div>
            </div>

            {/* Row 3 — pills */}
            <div className="flex flex-wrap gap-2">
                {item.program.category && (
                    <span className="inline-flex items-center gap-1.5 border border-border bg-muted/50 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground whitespace-nowrap">
                        <TagIcon /> {item.program.category}
                    </span>
                )}
                {item.program?.institution?.city && (
   <span className="inline-flex items-center gap-1.5 border border-border bg-muted/50 rounded-full px-3 py-1 text-[12px] font-medium text-muted-foreground whitespace-nowrap">
    <span className="w-3.5 h-3.5 flex items-center justify-center">
        <MapPinIcon />
    </span> 
    {item.program?.institution?.city}
</span>
                )}
            </div>

            {/* Row 4 — footer actions (stop propagation so they don't trigger card nav) */}
            <div className="pt-1 border-t border-border flex items-center justify-between">
                {isApplied ? (
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Already Applied
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onApply(item.program.id); }}
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline transition-colors cursor-pointer"
                    >
                        <ApplyArrowIcon />
                        Apply now
                    </button>
                )}

                <button
                    onClick={(e) => { e.stopPropagation(); onUnsave(item.program.id); }}
                    className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    aria-label="Remove from saved"
                >
                    <TrashIcon />
                    Remove
                </button>
            </div>
        </div>
    );
}