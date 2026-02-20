"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useSidebar } from "@/store/sidebar-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarLink {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const studentLinks: SidebarLink[] = [
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

const institutionLinks: SidebarLink[] = [
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

const adminLinks: SidebarLink[] = [
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
        label: "Categories",
        href: "/admin/categories",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
    },
    {
        label: "Cities",
        href: "/admin/cities",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

export function Sidebar({
    role,
    isCollapsed,
    setIsCollapsed
}: {
    role: string;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { user } = useAuthStore();

    const links =
        role === "student"
            ? studentLinks
            : role === "institution"
                ? institutionLinks
                : adminLinks;

    const getInitials = () => {
        if (!user) return "?";
        if (user.email) return user.email[0].toUpperCase();
        return user.role[0].toUpperCase();
    };

    const getUserDisplay = () => {
        if (!user) return "User";
        return user.display_name || user.email || user.phone || "User";
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">GAP</span>
                    </div>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Mobile User Profile */}
                <div className="p-5 border-b border-border">
                    <div className="flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 border-3 border-blue-100 dark:border-blue-900/30 shadow-md">
                            {user?.profile_picture_url && (
                                <AvatarImage src={user.profile_picture_url} alt="Profile" />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="mt-3 text-sm font-semibold text-foreground truncate max-w-full">
                            {getUserDisplay()}
                        </h3>
                        <span className="mt-0.5 text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                            {role}
                        </span>
                    </div>
                </div>

                {/* Mobile Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative",
                                    isActive
                                        ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                                )}
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:top-16 bg-card border-r border-border transition-all duration-300",
                    isCollapsed ? "md:w-20" : "md:w-64"
                )}
            >
                {/* User Profile Section at Top */}
                <div className={cn(
                    "border-b border-border transition-all duration-300",
                    isCollapsed ? "p-3" : "p-5"
                )}>
                    <div className={cn(
                        "flex flex-col items-center text-center",
                        isCollapsed && "items-center"
                    )}>
                        {/* <Avatar className={cn(
                            " dark:border-blue-900/30 shadow-sm transition-all duration-300",
                            isCollapsed ? "h-10 w-10" : "h-14 w-14"
                        )}>
                            {user?.profile_picture_url && (
                                <AvatarImage src={user.profile_picture_url} alt="Profile" />
                            )}
                            <AvatarFallback className={cn(
                                "bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold transition-all duration-300",
                                isCollapsed ? "text-sm" : "text-lg"
                            )}>
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar> */}
                        {!isCollapsed && (
                            <>
                                <h3 className="mt-2.5 text-sm font-semibold text-foreground truncate max-w-full leading-tight">
                                    {getUserDisplay()}
                                </h3>
                                <span className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 capitalize font-medium px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10">
                                    {role}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group relative",
                                    isActive
                                        ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                    isCollapsed && "justify-center px-2"
                                )}
                                title={isCollapsed ? link.label : undefined}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                                )}
                                {link.icon}
                                {!isCollapsed && <span>{link.label}</span>}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-popover text-popover-foreground border border-border text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg font-medium">
                                        {link.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}

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
                    isCollapsed ? "md:ml-20" : "md:ml-64"
                )}
            >
                {children}
            </main>
        </div>
    );
}