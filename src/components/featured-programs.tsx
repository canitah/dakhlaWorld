"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FeaturedProgramData {
    id: number;
    title: string;
    category: string | null;
    duration: string | null;
    deadline: string | null;
    created_at: string;
    institution: {
        id: number;
        name: string;
        city: string | null;
        category: string | null;
        profilePicture: string | null;
        planTier: string;
    };
    applicants: number;
}

export default function FeaturedPrograms() {
    const [featured, setFeatured] = useState<FeaturedProgramData[]>([]);
    const [rotational, setRotational] = useState<FeaturedProgramData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadFeatured() {
            try {
                const res = await fetch("/api/programs/featured");
                if (res.ok) {
                    const data = await res.json();
                    setFeatured(data.featured || []);
                    setRotational(data.rotational || []);
                }
            } catch {
                // Silently fail — featured section is optional enhancement
            } finally {
                setIsLoading(false);
            }
        }
        loadFeatured();
    }, []);

    // Don't render section if no featured programs at all
    if (isLoading || (featured.length === 0 && rotational.length === 0)) {
        return null;
    }

    return (
        <section className="py-16 bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 mb-4">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Featured Programs</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                        Top Institutions & Programs
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Discover programs from our premium partner institutions
                    </p>
                </div>

                {/* Featured tier — premium gold cards */}
                {featured.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {featured.map((program) => (
                            <Link
                                key={program.id}
                                href={`/login`}
                                className="group relative bg-card rounded-xl border-2 border-amber-500/30 p-6 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)] transition-all duration-300 overflow-hidden"
                            >
                                {/* Gold top accent */}
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400" />

                                {/* Featured badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        Featured
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {program.applicants} applicant{program.applicants !== 1 ? "s" : ""}
                                    </span>
                                </div>

                                {/* Program title */}
                                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                                    {program.title}
                                </h3>

                                {/* Institution */}
                                <p className="text-sm text-muted-foreground mb-3">
                                    {program.institution.name}
                                    {program.institution.city && ` · ${program.institution.city}`}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {program.category && (
                                        <span className="text-xs border border-amber-500/20 bg-amber-500/5 rounded-full px-3 py-1 text-amber-700 dark:text-amber-400 font-medium">
                                            {program.category}
                                        </span>
                                    )}
                                    {program.duration && (
                                        <span className="text-xs border border-border bg-muted/50 rounded-full px-3 py-1 text-muted-foreground font-medium">
                                            {program.duration}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pro tier — rotational "Also Trending" */}
                {rotational.length > 0 && (
                    <>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-purple-500">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Also Trending
                            </span>
                            <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="grid md:grid-cols-3 gap-5">
                            {rotational.map((program) => (
                                <Link
                                    key={program.id}
                                    href={`/login`}
                                    className="group bg-card rounded-lg border border-purple-500/20 p-5 hover:border-purple-500/40 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            Pro
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                        {program.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {program.institution.name}
                                        {program.institution.city && ` · ${program.institution.city}`}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
