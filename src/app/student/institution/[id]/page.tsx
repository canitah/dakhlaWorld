"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { PlanBadge } from "@/components/plan-badge";
import {
    ArrowLeft,
    MapPin,
    Mail,
    Building2,
    GraduationCap,
    Calendar,
    Clock,
    ExternalLink,
    Tag,
} from "lucide-react";

/* ─── Types ─── */

interface InstitutionDetail {
    id: number;
    name: string;
    category: string | null;
    city: string | null;
    description: string | null;
    contact_email: string | null;
    profile_picture_url: string | null;
    created_at: string;
    current_plan?: { name: string } | null;
    programs: ProgramItem[];
    _count: { programs: number };
}

interface ProgramItem {
    id: number;
    title: string;
    category: string | null;
    duration: string | null;
    eligibility: string | null;
    deadline: string | null;
    application_method: string | null;
    external_url: string | null;
    program_code?: string;
    created_at: string;
}

/* ─── Page ─── */

export default function InstitutionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { fetchWithAuth } = useApi();
    const id = params.id as string;

    const [institution, setInstitution] = useState<InstitutionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetchWithAuth(`/institutions/${id}`);
                if (!res.ok) {
                    setError("Institution not found");
                    return;
                }
                const data = await res.json();
                setInstitution(data.institution);
            } catch {
                setError("Failed to load institution details");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, fetchWithAuth]);

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
                    <p className="text-sm text-muted-foreground">Loading institution…</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !institution) {
        return (
            <DashboardLayout role="student">
                <div className="flex flex-col items-center justify-center py-24">
                    <Building2 className="size-12 text-muted-foreground/40 mb-4" />
                    <p className="text-lg font-semibold text-foreground mb-1">Institution not found</p>
                    <p className="text-sm text-muted-foreground mb-6">{error || "This institution doesn't exist or is not available."}</p>
                    <Button variant="outline" onClick={() => router.back()} className="cursor-pointer">
                        <ArrowLeft className="size-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            {/* ── Back button ── */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
            >
                <ArrowLeft className="size-4" />
                Back to Explore
            </button>

            {/* ── Institution Header ── */}
            <Card className="mb-6 overflow-hidden">
                <CardContent className="px-6 py-6 sm:px-8">
                    <div className="flex items-start gap-5">
                        {/* Avatar */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
                            {institution.profile_picture_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={institution.profile_picture_url}
                                    alt={institution.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                institution.name.charAt(0).toUpperCase()
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                                    {institution.name}
                                </h1>
                                <PlanBadge planName={institution.current_plan?.name} size="md" />
                            </div>

                            {/* Labeled fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
                                {institution.city && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm">
                                            <span className="font-semibold text-foreground">City: </span>
                                            <span className="text-muted-foreground">{institution.city}</span>
                                        </span>
                                    </div>
                                )}
                                {institution.category && (
                                    <div className="flex items-center gap-2">
                                        <Tag className="size-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm">
                                            <span className="font-semibold text-foreground">Category: </span>
                                            <span className="text-muted-foreground">{institution.category}</span>
                                        </span>
                                    </div>
                                )}
                                {institution.contact_email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="size-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm">
                                            <span className="font-semibold text-foreground">Email: </span>
                                            <span className="text-muted-foreground">{institution.contact_email}</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 mt-4">
                                <Badge variant="secondary" className="text-xs font-medium gap-1">
                                    <GraduationCap className="size-3" />
                                    {institution._count.programs} Active Program{institution._count.programs !== 1 ? "s" : ""}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {institution.description && (
                        <>
                            <Separator className="my-5" />
                            <div>
                                <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {institution.description}
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ── Programs Section ── */}
            <div className="mb-2">
                <h2 className="text-lg font-bold text-foreground">
                    Programs by {institution.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {institution.programs.length} active program{institution.programs.length !== 1 ? "s" : ""} available
                </p>
            </div>

            <Separator className="mb-5" />

            {institution.programs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <GraduationCap className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">No active programs at the moment</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {institution.programs.map((program) => (
                        <Card
                            key={program.id}
                            className="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group"
                            onClick={() => router.push(`/student/explore?program=${program.program_code || program.id}`)}
                        >
                            <CardContent className="p-4 sm:p-5">
                                {/* Title */}
                                <h3 className="text-base font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
                                    {program.title}
                                </h3>

                                {/* Info fields */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                    {program.category && (
                                        <div>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Category</p>
                                            <p className="text-xs text-foreground font-medium flex items-center gap-1">
                                                <Tag className="size-3 text-muted-foreground" />
                                                {program.category}
                                            </p>
                                        </div>
                                    )}
                                    {program.duration && (
                                        <div>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Duration</p>
                                            <p className="text-xs text-foreground font-medium flex items-center gap-1">
                                                <Clock className="size-3 text-muted-foreground" />
                                                {program.duration}
                                            </p>
                                        </div>
                                    )}
                                    {program.deadline && (
                                        <div>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Deadline</p>
                                            <p className="text-xs text-foreground font-medium flex items-center gap-1">
                                                <Calendar className="size-3 text-muted-foreground" />
                                                {new Date(program.deadline).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                    {program.eligibility && (
                                        <div>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Eligibility</p>
                                            <p className="text-xs text-foreground font-medium truncate">{program.eligibility}</p>
                                        </div>
                                    )}
                                </div>

                                <Separator className="mb-3" />

                                {/* Footer badge — application method only */}
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs font-medium gap-1">
                                        {program.application_method === "external" ? (
                                            <><ExternalLink className="size-3" /> External</>
                                        ) : (
                                            <><GraduationCap className="size-3" /> via GAP</>
                                        )}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
