"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSidebar } from "@/store/sidebar-store";
import { useTheme } from "next-themes";
import { Tooltip } from "antd";
import { PlanBadgeCompact } from "@/components/plan-badge";
import { ThemeLogo } from "@/components/theme-logo";

interface SidebarLink {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export const studentLinks: SidebarLink[] = [
    {
        label: "Dashboard",
        href: "/student",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        label: "Explore Programs",
        href: "/student/explore",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
    {
        label: "My Applications",
        href: "/student/applications",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        label: "Saved Programs",
        href: "/student/saved",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        ),
    },
    {
        label: "My Profile",
        href: "/student/profile",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

export const institutionLinks: SidebarLink[] = [
    {
        label: "Dashboard",
        href: "/institution",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        label: "My Programs",
        href: "/institution/programs",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
    {
        label: "Applications",
        href: "/institution/applications",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        label: "Billing & Plans",
        href: "/institution/billing",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
    },
    {
        label: "Profile",
        href: "/institution/profile",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
];

export const adminLinks: SidebarLink[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        label: "Institutions",
        href: "/admin/institutions",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
    {
        label: "Payments",
        href: "/admin/payments",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        label: "Applications",
        href: "/admin/applications",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        label: "Students",
        href: "/admin/students",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
];

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR — Modern glassmorphism with gradient accents
   ═══════════════════════════════════════════════════════════════════ */
export function Sidebar({
    role,
    isCollapsed,
    setIsCollapsed,
}: {
    role: string;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [planName, setPlanName] = useState<string | null>(null);

    // Listen for navbar hamburger button toggle
    useEffect(() => {
        const handler = () => setIsMobileOpen((prev) => !prev);
        window.addEventListener("toggle-mobile-sidebar", handler);
        return () => window.removeEventListener("toggle-mobile-sidebar", handler);
    }, []);

    // Fetch current plan for institution sidebar badge
    useEffect(() => {
        if (role !== "institution") return;
        const fetchPlan = async () => {
            try {
                const stored = localStorage.getItem("auth-storage");
                const token = stored ? JSON.parse(stored)?.state?.accessToken || "" : "";
                const res = await fetch("/api/billing", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setPlanName(data.current_plan?.name || null);
                }
            } catch { /* ignore */ }
        };
        fetchPlan();
    }, [role]);

    const links =
        role === "student"
            ? studentLinks
            : role === "institution"
                ? institutionLinks
                : adminLinks;

    // Role-specific accent colors
    const accentConfig = role === "admin"
        ? { gradient: "from-violet-600 to-indigo-600", bg: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", activeBg: "bg-violet-500/10 dark:bg-violet-500/15", ring: "ring-violet-500/20" }
        : role === "institution"
            ? { gradient: "from-blue-600 to-cyan-600", bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", activeBg: "bg-blue-500/10 dark:bg-blue-500/15", ring: "ring-blue-500/20" }
            : { gradient: "from-blue-600 to-indigo-600", bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", activeBg: "bg-blue-500/10 dark:bg-blue-500/15", ring: "ring-blue-500/20" };

    const navContent = (isMobile: boolean) => (
        <nav className={cn("flex-1 overflow-y-auto", isMobile ? "px-3 py-3" : "px-3 py-3")}>
            {/* Section label */}
            {!isCollapsed && !isMobile && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">
                    Navigation
                </p>
            )}
            <div className="space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Tooltip key={link.href} title={isCollapsed && !isMobile ? link.label : ""} placement="right">
                            <Link
                                href={link.href}
                                onClick={() => isMobile && setIsMobileOpen(false)}
                                className={cn(
                                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? `${accentConfig.activeBg} ${accentConfig.text} shadow-sm`
                                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                                    isCollapsed && !isMobile && "justify-center px-2"
                                )}
                            >
                                {/* Active indicator — gradient bar */}
                                {isActive && (
                                    <div className={cn(
                                        "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b",
                                        accentConfig.gradient
                                    )} />
                                )}
                                <span className={cn(
                                    "flex-shrink-0 transition-transform duration-200",
                                    isActive ? "scale-110" : "group-hover:scale-105"
                                )}>
                                    {link.icon}
                                </span>
                                {(isMobile || !isCollapsed) && (
                                    <span className="truncate">{link.label}</span>
                                )}
                                {/* Hover glow effect */}
                                {isActive && (
                                    <div className={cn(
                                        "absolute inset-0 rounded-xl ring-1 pointer-events-none",
                                        accentConfig.ring
                                    )} />
                                )}
                            </Link>
                        </Tooltip>
                    );
                })}
            </div>
        </nav>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* ── Mobile Sidebar ── */}
            <aside
                className={cn(
                    "md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transform transition-transform duration-300 ease-out",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Mobile Header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-border/50">
                    <Link href={`/${role}`} className="flex items-center gap-3">
                        <ThemeLogo className="h-12 w-auto object-contain" />
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 hover:bg-accent/60 rounded-xl transition-all duration-200 cursor-pointer group"
                    >
                        <svg className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Plan Badge (mobile) */}
                {planName && planName !== "Starter" && (
                    <div className="px-5 py-2.5 border-b border-border/50">
                        <PlanBadgeCompact planName={planName} />
                    </div>
                )}

                {navContent(true)}

                {/* Bottom decoration */}
                <div className="px-4 py-4 border-t border-border/50">
                    <div className={cn(
                        "rounded-xl bg-gradient-to-r p-3 text-white text-center",
                        accentConfig.gradient
                    )}>
                        <p className="text-xs font-semibold opacity-90 capitalize">{role} Portal</p>
                        <p className="text-[10px] opacity-70 mt-0.5">Global Admissions Platform</p>
                    </div>
                </div>
            </aside>

            {/* ── Desktop Sidebar ── */}
            <aside
                className={cn(
                    "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 bg-card/80 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ease-out z-40",
                    isCollapsed ? "md:w-[72px]" : "md:w-[260px]"
                )}
            >
                {/* Logo Section */}
                <div className={cn(
                    "h-16 flex items-center flex-shrink-0 transition-all duration-300",
                    isCollapsed ? "justify-center px-2" : "px-5"
                )}>
                    <Link href={`/${role}`} className="flex items-center gap-3 group">
                        <ThemeLogo
                            className={cn(
                                "object-contain transition-all duration-300 group-hover:scale-105",
                                isCollapsed ? "h-10 w-auto" : "h-12 w-auto"
                            )}
                        />
                    </Link>
                </div>

                {/* Plan Badge (desktop) */}
                {planName && planName !== "Starter" && (
                    <div className={cn(
                        "border-b border-border/50 flex-shrink-0 transition-all duration-300",
                        isCollapsed ? "flex justify-center py-2" : "px-4 py-2.5"
                    )}>
                        <PlanBadgeCompact planName={planName} collapsed={isCollapsed} />
                    </div>
                )}

                {/* Navigation */}
                {navContent(false)}

                {/* Bottom info card — collapsed shows icon only */}
                {!isCollapsed && (
                    <div className="px-3 py-3 border-t border-border/50 flex-shrink-0">
                        <div className={cn(
                            "rounded-xl bg-gradient-to-br p-3.5 text-white relative overflow-hidden",
                            accentConfig.gradient
                        )}>
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-10 h-10 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />
                            <p className="text-xs font-bold capitalize relative z-10">{role} Portal</p>
                            <p className="text-[10px] opacity-75 mt-0.5 relative z-10">Global Admissions Platform</p>
                        </div>
                    </div>
                )}

            </aside>
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD LAYOUT — wraps sidebar + content
   ═══════════════════════════════════════════════════════════════════ */
export function DashboardLayout({
    role,
    children,
}: {
    role: string;
    children: React.ReactNode;
}) {
    const { isCollapsed, setIsCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-background">
            <Sidebar role={role} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main
                className={cn(
                    "transition-all duration-300 p-4 md:p-6",
                    isCollapsed ? "md:ml-[72px]" : "md:ml-[260px]"
                )}
            >
                {children}
            </main>
        </div>
    );
}