import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlanRank } from "@/lib/plan-utils";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const city = searchParams.get("city") || "";
        const scheduleType = searchParams.get("schedule_type") || "";
        const company = searchParams.get("company") || "";
        const datePosted = searchParams.get("date_posted") || "";
        const feeMin = searchParams.get("fee_min") ? parseInt(searchParams.get("fee_min")!) : null;
        const feeMax = searchParams.get("fee_max") ? parseInt(searchParams.get("fee_max")!) : null;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        // 1. Core Logic: Approved Institutions OR Admin Posted
        const where: any = {
            is_active: true,
            OR: [
                { institution: { status: "approved" } },
                { posted_by_admin: true }
            ]
        };

        // 2. Search Logic
        if (search) {
            where.AND = [
                {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { institute_name: { contains: search, mode: "insensitive" } },
                        { study_field: { contains: search, mode: "insensitive" } },
                    ]
                }
            ];
        }

        if (category) where.category = category;
        if (scheduleType) where.schedule_type = scheduleType;

        // 3. City/Company filters (Strictly for approved institutions)
        if (city || company) {
            where.institution = {
                status: "approved",
                ...(city && { city: { contains: city, mode: "insensitive" } }),
                ...(company && { name: { contains: company, mode: "insensitive" } })
            };
        }

        if (feeMin !== null || feeMax !== null) {
            where.fee = {
                ...(feeMin !== null && { gte: feeMin }),
                ...(feeMax !== null && { lte: feeMax })
            };
        }

        if (datePosted) {
            const now = new Date();
            let sinceDate: Date | null = null;
            if (datePosted === "today") sinceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            else if (datePosted === "3days") sinceDate = new Date(now.getTime() - 3 * 86400000);
            else if (datePosted === "7days") sinceDate = new Date(now.getTime() - 7 * 86400000);
            else if (datePosted === "14days") sinceDate = new Date(now.getTime() - 14 * 86400000);
            if (sinceDate) where.created_at = { gte: sinceDate };
        }

        const [allProgramsRaw, total] = await Promise.all([
            prisma.program.findMany({
                where,
                include: {
                    institution: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            category: true,
                            profile_picture_url: true,
                            user: { select: { unique_id: true } },
                            payment_requests: {
                                where: { status: "approved" },
                                include: { plan: true },
                                orderBy: { updated_at: "desc" },
                                take: 1,
                            },
                        },
                    },
                    _count: { select: { applications: true } },
                },
            }),
            prisma.program.count({ where }),
        ]);

        // 4. Safe Sorting
        const sorted = allProgramsRaw.sort((a: any, b: any) => {
            const rankA = a.institution?.payment_requests?.[0]?.plan?.name 
                ? getPlanRank(a.institution.payment_requests[0].plan.name) 
                : (a.posted_by_admin ? 10 : 0);
            const rankB = b.institution?.payment_requests?.[0]?.plan?.name 
                ? getPlanRank(b.institution.payment_requests[0].plan.name) 
                : (b.posted_by_admin ? 10 : 0);
            
            if (rankB !== rankA) return rankB - rankA;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const paginated = sorted.slice((page - 1) * limit, page * limit);

        const programs = paginated.map((p: any) => ({
            id: p.id,
            title: p.title,
            institute_name: p.institute_name || null, // For frontend display
            description: p.description,
            category: p.category,
            duration: p.duration,
            deadline: p.deadline,
            fee: p.fee,
            schedule_type: p.schedule_type,
            study_field: p.study_field,
            created_at: p.created_at,
            postedByPlatform: p.posted_by_admin || !p.institution,
            institution: p.institution ? {
                id: p.institution.id,
                name: p.institution.name,
                city: p.institution.city,
                category: p.institution.category,
                profilePicture: p.institution.profile_picture_url,
                uniqueId: p.institution.user?.unique_id || String(p.institution.id),
                planTier: p.institution.payment_requests[0]?.plan?.name || "Starter",
            } : {
                id: 0,
                name: "DAKHLA Platform",
                city: "Online/Global",
                category: "Official",
                profilePicture: null,
                uniqueId: "admin",
                planTier: "Premium"
            },
            applicants: p._count?.applications || 0,
        }));

        // 5. FETCH ALL FILTERS DATA (Fix for .map error)
        const [categoriesData, citiesData, institutionsData, scheduleTypesData] = await Promise.all([
            prisma.program.findMany({ where: { is_active: true }, select: { category: true }, distinct: ["category"] }),
            prisma.institutionProfile.findMany({ where: { status: "approved" }, select: { city: true }, distinct: ["city"] }),
            prisma.institutionProfile.findMany({ where: { status: "approved" }, select: { name: true }, orderBy: { name: "asc" } }),
            prisma.program.findMany({ where: { is_active: true }, select: { schedule_type: true }, distinct: ["schedule_type"] }),
        ]);

        return NextResponse.json({
            programs,
            filters: {
                categories: categoriesData.map(c => c.category).filter(Boolean),
                cities: citiesData.map(c => c.city).filter(Boolean),
                companies: institutionsData.map(i => i.name).filter(Boolean),
                scheduleTypes: scheduleTypesData.map(s => s.schedule_type).filter(Boolean),
            },
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });

    } catch (error) {
        console.error("Public API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}