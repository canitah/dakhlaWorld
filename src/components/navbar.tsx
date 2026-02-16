"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const POLL_INTERVAL = 15000; // 15 seconds

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
    const router = useRouter();
    const notifRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

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
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setNotifOpen]);

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

    if (!isMounted) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-screen-2xl mx-auto">
                {/* Logo */}
                <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-3 group"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold transition-transform group-hover:scale-105">
                        <svg
                            className="w-6 h-6"
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
                    <div className="hidden sm:block">
                        <h1 className="text-xl font-bold text-gray-900">GAP</h1>
                        <p className="text-xs text-gray-500 -mt-0.5">Global Admissions</p>
                    </div>
                </Link>

                {/* Right Section */}
                <div className="flex items-center gap-3 md:gap-4">
                    {isAuthenticated && user ? (
                        <>
                            {/* User Info - Hidden on mobile */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user.email || user.phone}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {user.role} Account
                                    </p>
                                </div>
                            </div>

                            {/* Notifications Button + Dropdown */}
                            <div className="relative" ref={notifRef}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative h-10 w-10 rounded-full hover:bg-gray-100"
                                    onClick={() => setNotifOpen(!notifOpen)}
                                >
                                    <svg
                                        className="h-5 w-5 text-gray-600"
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
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </Button>

                                {/* Notification Dropdown */}
                                {notifOpen && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                                            <h3 className="text-sm font-semibold text-gray-900">
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
                                                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.is_read
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

                            {/* User Dropdown Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-blue-100 transition-all"
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-gray-200">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                                {getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2">
                                    {/* User Info Header */}
                                    <div className="px-3 py-3 bg-gray-50 rounded-lg mb-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-lg">
                                                    {getInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {user.email || user.phone}
                                                </p>
                                                <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
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
                                            className="h-4 w-4 mr-3 text-gray-500"
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
                                className="font-medium hover:bg-gray-100"
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