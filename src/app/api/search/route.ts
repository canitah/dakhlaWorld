import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

interface SearchResult {
    type: string;
    title: string;
    subtitle: string;
    link: string;
}

// Static navigation items for different roles
const studentNavItems: SearchResult[] = [
    { type: "Page", title: "Dashboard", subtitle: "Student dashboard", link: "/student" },
    { type: "Page", title: "Explore Programs", subtitle: "Browse all programs", link: "/student/explore" },
    { type: "Page", title: "My Applications", subtitle: "View your applications", link: "/student/applications" },
    { type: "Page", title: "Saved Programs", subtitle: "Your saved programs", link: "/student/saved" },
    { type: "Page", title: "My Profile", subtitle: "Edit your profile", link: "/student/profile" },
];

const institutionNavItems: SearchResult[] = [
    { type: "Page", title: "Dashboard", subtitle: "Institution dashboard", link: "/institution" },
    { type: "Page", title: "My Programs", subtitle: "Manage your programs", link: "/institution/programs" },
    { type: "Page", title: "Applications", subtitle: "View received applications", link: "/institution/applications" },
    { type: "Page", title: "Billing & Plans", subtitle: "Manage billing", link: "/institution/billing" },
    { type: "Page", title: "Profile", subtitle: "Edit institution profile", link: "/institution/profile" },
];

const adminNavItems: SearchResult[] = [
    { type: "Page", title: "Dashboard", subtitle: "Admin dashboard", link: "/admin" },
    { type: "Page", title: "Institutions", subtitle: "Manage institutions", link: "/admin/institutions" },
    { type: "Page", title: "Payments", subtitle: "Manage payments", link: "/admin/payments" },
    { type: "Page", title: "Applications", subtitle: "View all applications", link: "/admin/applications" },
    { type: "Page", title: "Categories", subtitle: "Manage categories", link: "/admin/categories" },
    { type: "Page", title: "Cities", subtitle: "Manage cities", link: "/admin/cities" },
];

export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request);
        if ("error" in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q")?.trim() || "";

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        const results: SearchResult[] = [];
        const { role } = authResult.user;

        // Search navigation items
        const navItems =
            role === "student"
                ? studentNavItems
                : role === "institution"
                    ? institutionNavItems
                    : adminNavItems;

        const matchingNavItems = navItems.filter(
            (item) =>
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.subtitle.toLowerCase().includes(query.toLowerCase())
        );
        results.push(...matchingNavItems);

        // Search programs
        if (role === "student" || role === "admin") {
            const programs = await prisma.program.findMany({
                where: {
                    is_active: true,
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { category: { contains: query, mode: "insensitive" } },
                    ],
                },
                include: {
                    institution: { select: { name: true } },
                },
                take: 5,
            });

            programs.forEach((p: any) => {
                results.push({
                    type: "Program",
                    title: p.title,
                    subtitle: `${p.institution.name}${p.category ? ` · ${p.category}` : ""}`,
                    link: role === "student" ? "/student/explore" : "/admin/applications",
                });
            });
        }

        if (role === "institution") {
            const instProfile = await prisma.institutionProfile.findUnique({
                where: { user_id: authResult.user.userId },
            });
            if (instProfile) {
                const programs = await prisma.program.findMany({
                    where: {
                        institution_id: instProfile.id,
                        OR: [
                            { title: { contains: query, mode: "insensitive" } },
                            { category: { contains: query, mode: "insensitive" } },
                        ],
                    },
                    take: 5,
                });

                programs.forEach((p: any) => {
                    results.push({
                        type: "Program",
                        title: p.title,
                        subtitle: p.category || "Program",
                        link: "/institution/programs",
                    });
                });
            }
        }

        // Search institutions (for students and admins)
        if (role === "student" || role === "admin") {
            const institutions = await prisma.institutionProfile.findMany({
                where: {
                    ...(role === "student" ? { status: "approved" } : {}),
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { city: { contains: query, mode: "insensitive" } },
                        { category: { contains: query, mode: "insensitive" } },
                    ],
                },
                take: 5,
            });

            institutions.forEach((inst: any) => {
                results.push({
                    type: "Institution",
                    title: inst.name,
                    subtitle: `${inst.city || ""}${inst.category ? ` · ${inst.category}` : ""}`,
                    link: role === "admin" ? "/admin/institutions" : "/student/explore",
                });
            });
        }

        // Search categories
        if (role === "admin") {
            const categories = await prisma.category.findMany({
                where: { name: { contains: query, mode: "insensitive" } },
                take: 5,
            });

            categories.forEach((c: any) => {
                results.push({
                    type: "Category",
                    title: c.name,
                    subtitle: "Category",
                    link: "/admin/categories",
                });
            });
        }

        // Search cities
        if (role === "admin") {
            const cities = await prisma.city.findMany({
                where: { name: { contains: query, mode: "insensitive" } },
                take: 5,
            });

            cities.forEach((c: any) => {
                results.push({
                    type: "City",
                    title: c.name,
                    subtitle: "City",
                    link: "/admin/cities",
                });
            });
        }

        return NextResponse.json({ results: results.slice(0, 15) });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
