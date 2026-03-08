"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ThemeLogo } from "@/components/theme-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    DollarSign,
    Briefcase,
    BookOpen,
    Moon,
    Sun,
    Menu,
    X,
} from "lucide-react";

interface InstitutionDetail {
    id: number;
    name: string;
    category: string | null;
    city: string | null;
    description: string | null;
    contact_email: string | null;
    profile_picture_url: string | null;
    created_at: string;
    programs: ProgramItem[];
    _count: { programs: number };
}

interface ProgramItem {
    id: number;
    program_code: string;
    title: string;
    category: string | null;
    duration: string | null;
    eligibility: string | null;
    deadline: string | null;
    fee: number | null;
    schedule_type: string | null;
    study_field: string | null;
    application_method: string | null;
    external_url: string | null;
    created_at: string;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function PublicInstitutionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const id = params.id as string;

    const [institution, setInstitution] = useState<InstitutionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/institutions/public/${id}`);
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
    }, [id]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* ═══ Navbar ═══ */}
            <header className="sticky top-0 z-50 bg-card border-b border-border">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <Link href="/" className="flex items-center gap-2 shrink-0">
                                <ThemeLogo className="h-10 sm:h-12 w-auto object-contain" />
                            </Link>
                            <nav className="hidden sm:flex items-center gap-1">
                                <Link href="/" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Home
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link href="/signup?role=institution" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Employers / Post Program
                            </Link>
                            <div className="h-5 w-px bg-border hidden sm:block" />
                            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                Sign in
                            </Link>
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            >
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                            <button className="sm:hidden p-1.5 rounded-md hover:bg-accent" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] sm:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute top-0 left-0 h-full w-64 bg-card border-r border-border shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
                        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
                            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                <ThemeLogo className="h-10 w-auto object-contain" />
                            </Link>
                            <button className="p-1.5 rounded-md hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 py-3 px-3 space-y-1">
                            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                            <Link href="/signup?role=institution" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>Employers / Post Program</Link>
                            <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-lg" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                        </nav>
                    </div>
                </div>
            )}

            {/* ═══ Content ═══ */}
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-6">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer"
                >
                    <ArrowLeft className="size-4" />
                    Back to Programs
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
                        <p className="text-sm text-muted-foreground">Loading institution…</p>
                    </div>
                ) : error || !institution ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Building2 className="size-12 text-muted-foreground/40 mb-4" />
                        <p className="text-lg font-semibold text-foreground mb-1">Institution not found</p>
                        <p className="text-sm text-muted-foreground mb-6">{error || "This institution doesn't exist or is not available."}</p>
                        <Button variant="outline" onClick={() => router.push("/")} className="cursor-pointer">
                            <ArrowLeft className="size-4 mr-2" />
                            Go Home
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* ── Institution Header ── */}
                        <Card className="mb-6 overflow-hidden">
                            <CardContent className="px-6 py-6 sm:px-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
                                        {institution.profile_picture_url ? (
                                            <img src={institution.profile_picture_url} alt={institution.name} className="w-full h-full object-cover" />
                                        ) : (
                                            institution.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                                            {institution.name}
                                        </h1>
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
                                        onClick={() => router.push("/")}
                                    >
                                        <CardContent className="p-4 sm:p-5">
                                            <h3 className="text-base font-bold text-foreground leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                                                {program.title}
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                                                {program.category && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Category</p>
                                                        <p className="text-xs text-foreground font-medium flex items-center gap-1"><Tag className="size-3 text-muted-foreground" />{program.category}</p>
                                                    </div>
                                                )}
                                                {program.duration && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Duration</p>
                                                        <p className="text-xs text-foreground font-medium flex items-center gap-1"><Clock className="size-3 text-muted-foreground" />{program.duration}</p>
                                                    </div>
                                                )}
                                                {program.fee !== null && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Fee</p>
                                                        <p className="text-xs text-foreground font-medium flex items-center gap-1"><DollarSign className="size-3 text-muted-foreground" />PKR {program.fee.toLocaleString()}</p>
                                                    </div>
                                                )}
                                                {program.schedule_type && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Schedule</p>
                                                        <p className="text-xs text-foreground font-medium flex items-center gap-1"><Briefcase className="size-3 text-muted-foreground" />{program.schedule_type}</p>
                                                    </div>
                                                )}
                                                {program.study_field && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Study Field</p>
                                                        <p className="text-xs text-foreground font-medium flex items-center gap-1"><BookOpen className="size-3 text-muted-foreground" />{program.study_field}</p>
                                                    </div>
                                                )}
                                                {program.deadline && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Deadline</p>
                                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1"><Calendar className="size-3" />{formatDate(program.deadline)}</p>
                                                    </div>
                                                )}
                                                {program.eligibility && (
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Eligibility</p>
                                                        <p className="text-xs text-foreground font-medium">{program.eligibility}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <Separator className="mb-3" />

                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs font-medium gap-1">
                                                    {program.application_method === "external" ? (
                                                        <><ExternalLink className="size-3" /> External</>
                                                    ) : (
                                                        <><GraduationCap className="size-3" /> via GAP</>
                                                    )}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    Posted {formatDate(program.created_at)}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ═══ Footer ═══ */}
            <footer className="bg-card border-t border-border py-6 mt-auto">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                        <ThemeLogo className="h-10 w-auto object-contain" />
                        <span className="text-xs text-muted-foreground">© 2026 dakhla. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
                        <Link href="/help" className="hover:text-blue-600 transition-colors">Help</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
