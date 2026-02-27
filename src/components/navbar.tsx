"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { useSidebar } from "@/store/sidebar-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar as AntAvatar, Badge, Breadcrumb, Dropdown, message } from "antd";
import { BellOutlined, UserOutlined, LogoutOutlined, HomeOutlined, SearchOutlined, EllipsisOutlined, DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined, EyeOutlined, CrownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { studentLinks, institutionLinks, adminLinks } from "@/components/dashboard-layout";

const POLL_INTERVAL = 15000; // 15 seconds

interface SearchResult {
    type: string;
    title: string;
    subtitle: string;
    link: string;
}

export function Navbar() {
    const { user, accessToken, isAuthenticated, logout } = useAuthStore();
    const {
        notifications,
        unreadCount,
        isOpen: notifOpen,
        setNotifications,
        setOpen: setNotifOpen,
        markAsRead,
        markAllRead,
        removeNotification,
    } = useNotificationStore();
    const { theme, setTheme } = useTheme();
    const { isCollapsed } = useSidebar();
    const router = useRouter();
    const pathname = usePathname();
    const notifRef = useRef<HTMLDivElement>(null);

    // Breadcrumb logic — derive role from user or pathname
    const role = user?.role || pathname.split("/").filter(Boolean)[0] || "";

    const labelMap: Record<string, string> = useMemo(() => {
        const links =
            role === "student" ? studentLinks
                : role === "institution" ? institutionLinks
                    : adminLinks;
        const map: Record<string, string> = {
            student: "Dashboard",
            institution: "Dashboard",
            admin: "Dashboard",
        };
        for (const link of links) {
            const segments = link.href.split("/").filter(Boolean);
            const key = segments[segments.length - 1];
            map[key] = link.label;
        }
        return map;
    }, [role]);

    const breadcrumbItems = useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);
        if (segments.length === 0) return [];

        const roleSegment = segments[0];
        const items: { title: React.ReactNode }[] = [
            {
                title: (
                    <Link href={`/${roleSegment}`} className="flex items-center gap-1">
                        <HomeOutlined /> {labelMap[roleSegment] || roleSegment}
                    </Link>
                ),
            },
        ];

        for (let i = 1; i < segments.length; i++) {
            const seg = segments[i];
            const href = "/" + segments.slice(0, i + 1).join("/");

            // Special handling: when student views /student/institution/[id],
            // don't map "institution" to "Dashboard"
            let label: string;
            if (roleSegment === "student" && seg === "institution") {
                label = "Institution";
            } else if (/^(PRG|APP)-\d+$/.test(seg)) {
                // Program or application code segment — display as-is
                label = seg;
            } else if (/^\d+$/.test(seg)) {
                // Numeric ID segment — show as #ID
                label = `#${seg}`;
            } else {
                label = labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
            }

            if (i === segments.length - 1) {
                items.push({ title: <span className="font-medium">{label}</span> });
            } else {
                items.push({
                    title: <Link href={href}>{label}</Link>,
                });
            }
        }

        return items;
    }, [pathname, labelMap]);

    const searchRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch notifications with polling
    const fetchNotifications = useCallback(async () => {
        if (!accessToken) return;
        try {
            const res = await fetch("/api/notifications", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications, data.unreadCount);
            }
        } catch {
            // silently ignore
        }
    }, [accessToken, setNotifications]);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [isAuthenticated, accessToken, fetchNotifications]);

    // Close notification dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't close if clicking inside an antd dropdown portal (e.g. notification three-dot menu)
            if (target.closest?.(".ant-dropdown")) return;

            if (notifRef.current && !notifRef.current.contains(target)) {
                setNotifOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setNotifOpen]);

    // Search with debounce
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchQuery(value);

            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            if (!value.trim() || value.trim().length < 2) {
                setSearchResults([]);
                setShowSearchResults(false);
                return;
            }

            setIsSearching(true);
            setShowSearchResults(true);

            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const res = await fetch(
                        `/api/search?q=${encodeURIComponent(value.trim())}`,
                        {
                            headers: accessToken
                                ? { Authorization: `Bearer ${accessToken}` }
                                : {},
                        }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        setSearchResults(data.results || []);
                    }
                } catch {
                    // silently ignore
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        },
        [accessToken]
    );

    const handleSearchResultClick = (result: SearchResult) => {
        setShowSearchResults(false);
        setSearchQuery("");
        setSearchResults([]);
        router.push(result.link);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setShowSearchResults(false);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        // Clear access_token cookie
        document.cookie = "access_token=; path=/; max-age=0; samesite=strict";
        logout();
        router.push("/login");
    };

    const getInitials = () => {
        if (!user) return "?";
        if (user.email) return user.email[0].toUpperCase();
        return user.role[0].toUpperCase();
    };

    const getDashboardLink = () => {
        if (!user) return "/";
        return `/${user.role}`;
    };

    const handleMarkAllRead = async () => {
        markAllRead();
        if (accessToken) {
            fetch("/api/notifications/read", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            }).catch(() => { });
        }
    };

    const handleNotificationClick = async (notif: typeof notifications[0]) => {
        if (!notif.is_read) {
            markAsRead(notif.id);
            if (accessToken) {
                fetch("/api/notifications/read", {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: notif.id }),
                }).catch(() => { });
            }
        }
        setNotifOpen(false);
        if (notif.link) {
            router.push(notif.link);
        }
    };

    const handleRemoveNotification = async (notifId: number) => {
        removeNotification(notifId);
        if (accessToken) {
            try {
                await fetch(`/api/notifications/${notifId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                message.success("Notification removed");
            } catch {
                message.error("Failed to remove notification");
            }
        }
    };

    const handleReportNotification = async (notifId: number) => {
        if (accessToken) {
            try {
                const res = await fetch("/api/notifications/report", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ notificationId: notifId }),
                });
                if (res.ok) {
                    message.success("Issue reported to admin");
                } else {
                    message.error("Failed to report");
                }
            } catch {
                message.error("Failed to report notification");
            }
        }
    };

    const getNotifIcon = (type: string) => {
        const iconStyle = { fontSize: 16 };
        switch (type) {
            case "institution_approved":
                return <CheckCircleOutlined style={{ ...iconStyle, color: "#52c41a" }} />;
            case "institution_rejected":
                return <CloseCircleOutlined style={{ ...iconStyle, color: "#ff4d4f" }} />;
            case "application_submitted":
                return <MailOutlined style={{ ...iconStyle, color: "#1677ff" }} />;
            case "application_accepted":
                return <CheckCircleOutlined style={{ ...iconStyle, color: "#52c41a" }} />;
            case "application_rejected":
                return <CloseCircleOutlined style={{ ...iconStyle, color: "#ff4d4f" }} />;
            case "application_viewed":
                return <EyeOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
            case "profile_viewed":
                return <EyeOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
            case "notification_reported":
                return <ExclamationCircleOutlined style={{ ...iconStyle, color: "#faad14" }} />;
            default:
                return <BellOutlined style={{ ...iconStyle, color: "#1677ff" }} />;
        }
    };

    // Group notifications by date category
    const groupNotificationsByDate = (notifs: typeof notifications) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups: { label: string; items: typeof notifications }[] = [];
        const todayItems: typeof notifications = [];
        const yesterdayItems: typeof notifications = [];
        const earlierItems: typeof notifications = [];

        for (const notif of notifs) {
            const notifDate = new Date(notif.created_at);
            notifDate.setHours(0, 0, 0, 0);
            if (notifDate.getTime() === today.getTime()) {
                todayItems.push(notif);
            } else if (notifDate.getTime() === yesterday.getTime()) {
                yesterdayItems.push(notif);
            } else {
                earlierItems.push(notif);
            }
        }

        if (todayItems.length > 0) groups.push({ label: "Today", items: todayItems });
        if (yesterdayItems.length > 0) groups.push({ label: "Yesterday", items: yesterdayItems });
        if (earlierItems.length > 0) groups.push({ label: "Earlier", items: earlierItems });

        return groups;
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getSearchResultIcon = (type: string) => {
        switch (type) {
            case "Page":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case "Program":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                );
            case "Institution":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                );
            case "Category":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                );
            case "City":
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                );
        }
    };

    // Hide navbar on login, signup, and verify-otp pages (can check before mount)
    const isAuthPage = ["login", "signup", "verify-otp"].includes(pathname.split("/").filter(Boolean)[0] || "");
    if (isAuthPage) return null;

    // Determine if we're on a dashboard page (where the sidebar is visible)
    const isDashboardPage = /^\/(student|institution|admin)(\/|$)/.test(pathname);
    // Only show dashboard navbar features (search, breadcrumbs, profile) on dashboard pages
    const showDashboardNav = isAuthenticated && isDashboardPage;

    // Show a placeholder shell while mounting to avoid layout flash
    if (!isMounted) {
        if (!isDashboardPage) {
            return (
                <header className="sticky top-0 z-30 py-3 px-4 md:px-8 bg-background/60 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto bg-card/90 backdrop-blur-xl border border-border rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between shadow-sm">
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                            <img src="/logo.jpeg" alt="dazla." className="h-8 w-auto object-contain" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-1">
                            <span className="relative px-4 py-2 text-sm font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">
                                Home
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                            </span>
                            {["About", "Programs", "Contact"].map((label) => (
                                <span key={label} className="px-4 py-2 text-sm font-semibold tracking-wide uppercase text-muted-foreground">{label}</span>
                            ))}
                        </nav>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full" />
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 h-9 text-sm shadow-md shadow-blue-600/20">
                                <Link href="/signup">Get Started</Link>
                            </Button>
                        </div>
                    </div>
                </header>
            );
        }
        return (
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex h-16 items-center px-4 md:px-6">
                    <div className="h-8" />
                </div>
            </header>
        );
    }

    // Profile dropdown menu items (antd Dropdown)
    const profileMenuItems: MenuProps["items"] = user
        ? [
            {
                key: "user-info",
                label: (
                    <div className="flex items-center gap-3 py-1 px-1">
                        <AntAvatar
                            src={user.profile_picture_url}
                            size={40}
                            icon={<UserOutlined />}
                            style={{ backgroundColor: "#1677ff", flexShrink: 0 }}
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "inherit" }}>
                                {user.email || user.phone}
                            </p>
                            <p className="text-xs capitalize flex items-center gap-1" style={{ color: "rgba(128,128,128,0.85)" }}>
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                                {user.role} account
                            </p>
                        </div>
                    </div>
                ),
                style: { cursor: "default", padding: "8px 12px" },
            },
            { type: "divider" as const },
            {
                key: "dashboard",
                label: "Dashboard",
                icon: <HomeOutlined />,
                onClick: () => router.push(getDashboardLink()),
            },
            { type: "divider" as const },
            {
                key: "logout",
                label: "Log out",
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout,
            },
        ]
        : [];

    /* ═══════════════════════════════════════════════════════════════
       LANDING / PUBLIC PAGE NAVBAR — floating pill with centered links
       ═══════════════════════════════════════════════════════════════ */
    if (!showDashboardNav) {
        const landingLinks = [
            { label: "Home", href: "/" },
            { label: "About", href: "#about" },
            { label: "Programs", href: "#programs" },
            { label: "Contact", href: "#contact" },
        ];

        return (
            <header className="sticky top-0 z-30 py-3 px-4 md:px-8 bg-background/60 backdrop-blur-md">
                <div className="max-w-7xl mx-auto bg-card/90 backdrop-blur-xl border border-border rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between shadow-sm">
                    {/* Logo — left */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <Image
                            src="/logo.jpeg"
                            alt="dazla."
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Nav links — centered (desktop only) */}
                    <nav className="hidden md:flex items-center gap-1">
                        {landingLinks.map((link) => {
                            const isActive = link.href === "/" && pathname === "/";
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-colors",
                                        isActive
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right — theme toggle + auth buttons */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground relative cursor-pointer"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            <svg className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <svg className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        </button>

                        {/* Log in link — desktop only */}
                        <Button variant="ghost" asChild className="font-semibold text-sm hover:bg-accent rounded-full hidden md:inline-flex">
                            <Link href="/login">Log in</Link>
                        </Button>

                        {/* Get Started CTA — desktop only */}
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 h-9 text-sm shadow-md shadow-blue-600/20 hidden md:inline-flex">
                            <Link href="/signup">Get Started</Link>
                        </Button>

                        {/* Mobile hamburger toggle */}
                        <button
                            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground cursor-pointer"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden max-w-7xl mx-auto mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <nav className="flex flex-col py-2">
                            {landingLinks.map((link) => {
                                const isActive = link.href === "/" && pathname === "/";
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "px-5 py-3 text-sm font-semibold tracking-wide uppercase transition-colors",
                                            isActive
                                                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="border-t border-border px-5 py-4 flex flex-col gap-2">
                            <Button variant="outline" asChild className="w-full font-semibold rounded-full h-10">
                                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                            </Button>
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full h-10 shadow-md shadow-blue-600/20">
                                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </header>
        );
    }

    /* ═══════════════════════════════════════════════════════════════
       DASHBOARD NAVBAR — existing design (search, breadcrumbs, profile)
       ═══════════════════════════════════════════════════════════════ */
    return (
        <header
            className={cn(
                "sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300",
                isCollapsed
                    ? "md:ml-[72px]"
                    : "md:ml-[260px]"
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left Section: spacer (logo is in sidebar) */}
                <div className="hidden md:block" />

                {/* Breadcrumbs */}
                {user && breadcrumbItems.length > 0 && (
                    <div className="hidden md:block flex-shrink-0">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                )}

                {/* Search Bar */}
                <div className="flex-1 flex justify-center max-w-2xl ml-4 md:ml-8" ref={searchRef}>
                    <div className="relative w-full max-w-lg">
                        <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ fontSize: 16 }} />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => {
                                if (searchResults.length > 0) setShowSearchResults(true);
                            }}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full h-10 pl-11 pr-4 rounded-full bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                        />

                        {/* Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full left-0 mt-1.5 w-full bg-popover rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                {isSearching ? (
                                    <div className="px-4 py-6 text-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-xs text-muted-foreground">Searching...</p>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="px-4 py-6 text-center">
                                        <p className="text-sm text-muted-foreground">No results found</p>
                                    </div>
                                ) : (
                                    <div className="max-h-72 overflow-y-auto py-1">
                                        {searchResults.map((result, i) => (
                                            <button
                                                key={`${result.type}-${result.title}-${i}`}
                                                onClick={() => handleSearchResultClick(result)}
                                                className="w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-accent/50 transition-colors cursor-pointer"
                                            >
                                                <span className="mt-0.5 text-muted-foreground flex-shrink-0">
                                                    {getSearchResultIcon(result.type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {result.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {result.subtitle}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium mt-0.5 flex-shrink-0">
                                                    {result.type}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                {/* Right Section */}
                <div className="flex items-center gap-1.5 md:gap-2.5">
                    {/* Theme Toggle */}
                    <button
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground relative cursor-pointer"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {/* Sun icon */}
                        <svg className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {/* Moon icon */}
                        <svg className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </button>

                    {user && (
                        <>
                            {/* Notifications — icon only with antd Badge */}
                            <div className="relative" ref={notifRef}>
                                <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                                    <button
                                        onClick={() => setNotifOpen(!notifOpen)}
                                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground cursor-pointer"
                                    >
                                        <BellOutlined style={{ fontSize: 18 }} />
                                    </button>
                                </Badge>

                                {/* Notification Dropdown */}
                                {notifOpen && (
                                    <div className="absolute right-0 mt-2 w-[380px] sm:w-[420px] bg-popover rounded-2xl shadow-2xl border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                                            <h3 className="text-base font-bold text-foreground">
                                                Notifications
                                            </h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>

                                        {/* List */}
                                        <div className="max-h-[420px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-5 py-12 text-center">
                                                    <BellOutlined style={{ fontSize: 32 }} className="text-muted-foreground/40 mb-3 block" />
                                                    <p className="text-sm text-muted-foreground">
                                                        No notifications yet
                                                    </p>
                                                </div>
                                            ) : (
                                                groupNotificationsByDate(notifications).map((group) => (
                                                    <div key={group.label}>
                                                        {/* Date Group Header */}
                                                        <div className="px-5 py-2.5 bg-muted/30">
                                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                                {group.label}
                                                            </span>
                                                        </div>

                                                        {/* Notifications in group */}
                                                        {group.items.map((notif) => (
                                                            <div
                                                                key={notif.id}
                                                                onClick={() => handleNotificationClick(notif)}
                                                                className={cn(
                                                                    "w-full text-left px-5 py-4 flex items-start gap-3.5 hover:bg-accent/50 transition-colors cursor-pointer relative group/notif",
                                                                    !notif.is_read && "bg-blue-50/40 dark:bg-blue-500/5"
                                                                )}
                                                            >
                                                                {/* Unread dot */}
                                                                {!notif.is_read && (
                                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500" />
                                                                )}

                                                                {/* Icon Circle */}
                                                                <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                    {getNotifIcon(notif.type)}
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={cn(
                                                                        "text-sm leading-snug",
                                                                        !notif.is_read
                                                                            ? "font-semibold text-foreground"
                                                                            : "font-normal text-foreground/80"
                                                                    )}>
                                                                        <span className="font-bold">{notif.title}</span>
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                                                                        {notif.message}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground/60 mt-1.5">
                                                                        {timeAgo(notif.created_at)}
                                                                    </p>
                                                                </div>

                                                                {/* Three-dot menu — wrapped in div to stop all propagation */}
                                                                <div
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                >
                                                                    <Dropdown
                                                                        menu={{
                                                                            items: [
                                                                                {
                                                                                    key: "remove",
                                                                                    label: "Remove Notification",
                                                                                    icon: <DeleteOutlined />,
                                                                                    danger: true,
                                                                                    onClick: () => {
                                                                                        handleRemoveNotification(notif.id);
                                                                                    },
                                                                                },
                                                                                {
                                                                                    key: "report",
                                                                                    label: "Report issue",
                                                                                    icon: <ExclamationCircleOutlined />,
                                                                                    onClick: () => {
                                                                                        handleReportNotification(notif.id);
                                                                                    },
                                                                                },
                                                                            ],
                                                                        }}
                                                                        trigger={["click"]}
                                                                        placement="bottomRight"
                                                                    >
                                                                        <button
                                                                            className="opacity-0 group-hover/notif:opacity-100 w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-all flex-shrink-0 mt-0.5 text-muted-foreground cursor-pointer"
                                                                        >
                                                                            <EllipsisOutlined style={{ fontSize: 18 }} />
                                                                        </button>
                                                                    </Dropdown>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Avatar — antd Dropdown */}
                            <Dropdown
                                menu={{ items: profileMenuItems }}
                                trigger={["click"]}
                                placement="bottomRight"
                            >
                                <AntAvatar
                                    src={user.profile_picture_url}
                                    size={36}
                                    icon={<UserOutlined />}
                                    style={{
                                        cursor: "pointer",
                                        backgroundColor: user.profile_picture_url ? "transparent" : "#1677ff",
                                        border: "2px solid #e5e7eb",
                                    }}
                                >
                                    {!user.profile_picture_url && getInitials()}
                                </AntAvatar>
                            </Dropdown>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}