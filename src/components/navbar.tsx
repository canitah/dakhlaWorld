"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

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

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center justify-between px-6">
                <Link href={getDashboardLink()} className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm">
                        G
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                        GAP
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {isAuthenticated && user ? (
                        <>
                            <span className="text-sm text-muted-foreground hidden sm:block">
                                {user.email || user.phone}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-10 w-10 rounded-full"
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-blue-200">
                                            <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
                                                {getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium">{user.email || user.phone}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {user.role} account
                                        </p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" asChild>
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                <Link href="/signup">Sign up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
