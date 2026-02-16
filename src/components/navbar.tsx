// "use client";

// import Link from "next/link";
// import { useAuthStore } from "@/store/auth-store";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// export function Navbar() {
//     const { user, isAuthenticated, logout } = useAuthStore();
//     const router = useRouter();

//     const handleLogout = async () => {
//         await fetch("/api/auth/logout", { method: "POST" });
//         logout();
//         router.push("/login");
//     };

//     const getInitials = () => {
//         if (!user) return "?";
//         if (user.email) return user.email[0].toUpperCase();
//         return user.role[0].toUpperCase();
//     };

//     const getDashboardLink = () => {
//         if (!user) return "/";
//         return `/${user.role}`;
//     };

//     return (
//         <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
//             <div className="flex h-16 items-center justify-between px-6">
//                 <Link href={getDashboardLink()} className="flex items-center gap-2">
//                     <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm">
//                         G
//                     </div>
//                     <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
//                         GAP
//                     </span>
//                 </Link>

//                 <div className="flex items-center gap-4">
//                     {isAuthenticated && user ? (
//                         <>
//                             <span className="text-sm text-muted-foreground hidden sm:block">
//                                 {user.email || user.phone}
//                             </span>
//                             <DropdownMenu>
//                                 <DropdownMenuTrigger asChild>
//                                     <Button
//                                         variant="ghost"
//                                         className="relative h-10 w-10 rounded-full"
//                                     >
//                                         <Avatar className="h-10 w-10 border-2 border-blue-200">
//                                             <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
//                                                 {getInitials()}
//                                             </AvatarFallback>
//                                         </Avatar>
//                                     </Button>
//                                 </DropdownMenuTrigger>
//                                 <DropdownMenuContent align="end" className="w-56">
//                                     <div className="px-3 py-2">
//                                         <p className="text-sm font-medium">{user.email || user.phone}</p>
//                                         <p className="text-xs text-muted-foreground capitalize">
//                                             {user.role} account
//                                         </p>
//                                     </div>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
//                                         Dashboard
//                                     </DropdownMenuItem>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem
//                                         onClick={handleLogout}
//                                         className="text-red-600 focus:text-red-600"
//                                     >
//                                         Log out
//                                     </DropdownMenuItem>
//                                 </DropdownMenuContent>
//                             </DropdownMenu>
//                         </>
//                     ) : (
//                         <div className="flex gap-2">
//                             <Button variant="ghost" asChild>
//                                 <Link href="/login">Log in</Link>
//                             </Button>
//                             <Button asChild className="bg-blue-600 hover:bg-blue-700">
//                                 <Link href="/signup">Sign up</Link>
//                             </Button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </header>
//     );
// }
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

                            {/* Notifications Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-10 w-10 rounded-full hover:bg-gray-100"
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
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            </Button>

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