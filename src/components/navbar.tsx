"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { useSidebar } from "@/store/sidebar-store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    } = useNotificationStore();
    const { theme, setTheme } = useTheme();
    const { toggleSidebar } = useSidebar();
    const router = useRouter();
    const notifRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
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
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
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

    const getNotifIcon = (type: string) => {
        switch (type) {
            case "institution_approved":
                return "✅";
            case "institution_rejected":
                return "❌";
            case "application_submitted":
                return "📩";
            case "application_accepted":
                return "🎉";
            case "application_rejected":
                return "😔";
            case "application_viewed":
                return "👁️";
            case "profile_viewed":
                return "👀";
            default:
                return "🔔";
        }
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

    if (!isMounted) return null;

    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left Section: Logo + Hamburger + Search */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <Link
                        href={getDashboardLink()}
                        className="flex items-center gap-2.5 group flex-shrink-0"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold transition-transform group-hover:scale-105">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                        <span className="hidden sm:block text-xl font-bold text-foreground tracking-tight">GAP</span>
                    </Link>

                    {/* Hamburger Toggle */}
                    {isAuthenticated && (
                        <button
                            onClick={toggleSidebar}
                            className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            title="Toggle sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}

                    {/* Search Bar */}
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center relative" ref={searchRef}>
                            <svg
                                className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => {
                                    if (searchResults.length > 0) setShowSearchResults(true);
                                }}
                                onKeyDown={handleSearchKeyDown}
                                className="w-48 lg:w-64 h-9 pl-9 pr-3 rounded-lg border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                            />

                            {/* Search Results Dropdown */}
                            {showSearchResults && (
                                <div className="absolute top-full left-0 mt-1.5 w-80 bg-popover rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                                                    className="w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-accent/50 transition-colors"
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
                    )}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {/* Sun icon (shown in light mode) */}
                        <svg className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {/* Moon icon (shown in dark mode) */}
                        <svg className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </Button>

                    {isAuthenticated && user ? (
                        <>
                            {/* Notifications Button + Dropdown */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setNotifOpen(!notifOpen)}
                                    className="flex items-center gap-1.5 h-9 px-2 md:px-3 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative"
                                >
                                    <svg
                                        className="h-[18px] w-[18px]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                        />
                                    </svg>
                                    <span className="hidden md:inline text-sm font-medium">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                    <svg className="hidden md:block w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Notification Dropdown */}
                                {notifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-popover rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
                                            <h3 className="text-sm font-semibold text-foreground">
                                                Notifications
                                            </h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>

                                        {/* List */}
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-10 text-center">
                                                    <div className="text-3xl mb-2">🔔</div>
                                                    <p className="text-sm text-gray-500">
                                                        No notifications yet
                                                    </p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <button
                                                        key={notif.id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b border-accent/50 last:border-0 ${!notif.is_read
                                                            ? "bg-blue-50/60"
                                                            : ""
                                                            }`}
                                                    >
                                                        <span className="text-lg mt-0.5 flex-shrink-0">
                                                            {getNotifIcon(notif.type)}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p
                                                                    className={`text-sm truncate ${!notif.is_read
                                                                        ? "font-semibold text-gray-900"
                                                                        : "font-medium text-gray-700"
                                                                        }`}
                                                                >
                                                                    {notif.title}
                                                                </p>
                                                                {!notif.is_read && (
                                                                    <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-[11px] text-gray-400 mt-1">
                                                                {timeAgo(notif.created_at)}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px h-7 bg-border" />

                            {/* User Dropdown Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2.5 h-9 px-2 rounded-lg hover:bg-accent transition-colors">
                                        <Avatar className="h-8 w-8 border-2 border-border">
                                            {user.profile_picture_url && (
                                                <AvatarImage src={user.profile_picture_url} alt="Profile" />
                                            )}
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                                                {getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:flex flex-col items-start">
                                            <span className="text-sm font-medium text-foreground leading-tight truncate max-w-[120px]">
                                                {user.email || user.phone}
                                            </span>
                                        </div>
                                        <svg className="hidden md:block w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2">
                                    {/* User Info Header */}
                                    <div className="px-3 py-3 bg-muted/50 rounded-lg mb-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                                {user.profile_picture_url && (
                                                    <AvatarImage src={user.profile_picture_url} alt="Profile" />
                                                )}
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                                                    {getInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    {user.email || user.phone}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                                    {user.role} account
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <DropdownMenuSeparator />

                                    {/* Dashboard Link */}
                                    <DropdownMenuItem
                                        onClick={() => router.push(getDashboardLink())}
                                        className="cursor-pointer py-2.5 px-3 rounded-md"
                                    >
                                        <svg
                                            className="h-4 w-4 mr-3 text-muted-foreground"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                            />
                                        </svg>
                                        <span className="text-sm font-medium">Dashboard</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    {/* Logout */}
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer py-2.5 px-3 rounded-md text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                        <svg
                                            className="h-4 w-4 mr-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                            />
                                        </svg>
                                        <span className="text-sm font-medium">Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                asChild
                                className="font-medium hover:bg-accent"
                            >
                                <Link href="/login">
                                    <span className="hidden sm:inline">Log in</span>
                                    <span className="sm:hidden">
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                            />
                                        </svg>
                                    </span>
                                </Link>
                            </Button>
                            <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 font-medium shadow-sm"
                            >
                                <Link href="/signup">
                                    <span className="hidden sm:inline">Sign up</span>
                                    <span className="sm:hidden">
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                            />
                                        </svg>
                                    </span>
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}