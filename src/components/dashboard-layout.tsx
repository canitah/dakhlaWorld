"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLink {
    label: string;
    href: string;
    icon: string;
}

const studentLinks: SidebarLink[] = [
    { label: "Dashboard", href: "/student", icon: "🏠" },
    { label: "Explore Programs", href: "/student/explore", icon: "🎓" },
    { label: "My Applications", href: "/student/applications", icon: "📋" },
    { label: "Saved Programs", href: "/student/saved", icon: "💾" },
    { label: "My Profile", href: "/student/profile", icon: "👤" },
];

const institutionLinks: SidebarLink[] = [
    { label: "Dashboard", href: "/institution", icon: "🏠" },
    { label: "My Programs", href: "/institution/programs", icon: "📚" },
    { label: "Applications", href: "/institution/applications", icon: "📩" },
    { label: "Billing & Plans", href: "/institution/billing", icon: "💳" },
    { label: "Profile", href: "/institution/profile", icon: "🏫" },
];

const adminLinks: SidebarLink[] = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Institutions", href: "/admin/institutions", icon: "🏫" },
    { label: "Payments", href: "/admin/payments", icon: "💰" },
    { label: "Applications", href: "/admin/applications", icon: "📋" },
    { label: "Categories", href: "/admin/categories", icon: "🏷️" },
    { label: "Cities", href: "/admin/cities", icon: "🏙️" },
];

export function Sidebar({ role }: { role: string }) {
    const pathname = usePathname();

    const links =
        role === "student"
            ? studentLinks
            : role === "institution"
                ? institutionLinks
                : adminLinks;

    return (
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16 bg-white border-r">
            <nav className="flex-1 px-4 py-6 space-y-1">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            pathname === link.href
                                ? "bg-blue-50 text-blue-700 shadow-sm"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <span className="text-lg">{link.icon}</span>
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

export function DashboardLayout({
    role,
    children,
}: {
    role: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <Sidebar role={role} />
            <main className="md:ml-64 p-6 pt-6">{children}</main>
        </div>
    );
}
