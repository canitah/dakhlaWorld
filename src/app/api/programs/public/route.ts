import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlanRank } from "@/lib/plan-utils";

// GET /api/programs/public — Public endpoint for homepage program listings
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

        const where: Record<string, unknown> = {
            is_active: true,
            institution: { status: "approved" },
        };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { institution: { name: { contains: search, mode: "insensitive" } } },
                { study_field: { contains: search, mode: "insensitive" } },
            ];
        }

        if (category) where.category = category;

        // Build institution filter
        const instFilter: Record<string, unknown> = { status: "approved" };
        if (city) instFilter.city = city;
        if (company) instFilter.name = company;
        if (city || company) where.institution = instFilter;

        if (scheduleType) where.schedule_type = scheduleType;

        if (feeMin !== null || feeMax !== null) {
            const feeFilter: Record<string, number> = {};
            if (feeMin !== null) feeFilter.gte = feeMin;
            if (feeMax !== null) feeFilter.lte = feeMax;
            where.fee = feeFilter;
        }

        // Date posted filter
        if (datePosted) {
            const now = new Date();
            let sinceDate: Date | null = null;
            if (datePosted === "today") {
                sinceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (datePosted === "3days") {
                sinceDate = new Date(now.getTime() - 3 * 86400000);
            } else if (datePosted === "7days") {
                sinceDate = new Date(now.getTime() - 7 * 86400000);
            } else if (datePosted === "14days") {
                sinceDate = new Date(now.getTime() - 14 * 86400000);
            }
            if (sinceDate) {
                where.created_at = { gte: sinceDate };
            }
        }

        const [allPrograms, total] = await Promise.all([
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

        // Sort by plan rank then by date
        const sorted = allPrograms.sort((a: any, b: any) => {
            const rankA = getPlanRank(a.institution.payment_requests[0]?.plan?.name);
            const rankB = getPlanRank(b.institution.payment_requests[0]?.plan?.name);
            if (rankB !== rankA) return rankB - rankA;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const paginated = sorted.slice((page - 1) * limit, page * limit);

        // Get filter options
        const [categories, cities, scheduleTypes, institutions] = await Promise.all([
            prisma.program.findMany({ where: { is_active: true, institution: { status: "approved" } }, select: { category: true }, distinct: ["category"] }),
            prisma.institutionProfile.findMany({ where: { status: "approved" }, select: { city: true }, distinct: ["city"] }),
            prisma.program.findMany({ where: { is_active: true, institution: { status: "approved" } }, select: { schedule_type: true }, distinct: ["schedule_type"] }),
            prisma.institutionProfile.findMany({ where: { status: "approved" }, select: { name: true }, orderBy: { name: "asc" } }),
        ]);

        const programs = paginated.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            category: p.category,
            duration: p.duration,
            deadline: p.deadline,
            fee: p.fee,
            schedule_type: p.schedule_type,
            study_field: p.study_field,
            eligibility: p.eligibility,
            application_method: p.application_method,
            external_url: p.external_url,
            program_code: p.program_code,
            created_at: p.created_at,
            institution: {
                id: p.institution.id,
                name: p.institution.name,
                city: p.institution.city,
                category: p.institution.category,
                profilePicture: p.institution.profile_picture_url,
                planTier: p.institution.payment_requests[0]?.plan?.name || "Starter",
            },
            applicants: p._count.applications,
        }));

        return NextResponse.json({
            programs,
            filters: {
                categories: categories.map(c => c.category).filter(Boolean),
                cities: cities.map(c => c.city).filter(Boolean),
                scheduleTypes: scheduleTypes.map(s => s.schedule_type).filter(Boolean),
                companies: institutions.map(i => i.name).filter(Boolean),
            },
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("Public programs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
