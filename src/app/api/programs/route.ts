import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlanRank } from "@/lib/plan-utils";

// GET /api/programs — List programs with filters (public for authenticated users)
// Programs are sorted by institution plan tier (Featured > Pro > Growth > Starter), then by created_at desc
// Admin-posted programs (posted_by_admin = true) are also included and ranked highest
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const city = searchParams.get("city") || "";
        const scheduleType = searchParams.get("schedule_type") || "";
        const studyField = searchParams.get("study_field") || "";
        const feeMin = searchParams.get("fee_min") ? parseInt(searchParams.get("fee_min")!) : null;
        const feeMax = searchParams.get("fee_max") ? parseInt(searchParams.get("fee_max")!) : null;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");

        // Build base filter for shared fields
        const baseFilter: Record<string, unknown> = {
            is_active: true,
        };

        if (category) baseFilter.category = category;
        if (scheduleType) baseFilter.schedule_type = scheduleType;
        if (studyField) baseFilter.study_field = { contains: studyField, mode: "insensitive" };
        if (feeMin !== null || feeMax !== null) {
            const feeFilter: Record<string, number> = {};
            if (feeMin !== null) feeFilter.gte = feeMin;
            if (feeMax !== null) feeFilter.lte = feeMax;
            baseFilter.fee = feeFilter;
        }

        // Institution programs filter
        const instFilter: Record<string, unknown> = {
            ...baseFilter,
            posted_by_admin: false,
            institution: { status: "approved" },
        };
        if (city) {
            instFilter.institution = { ...(instFilter.institution as object || {}), city };
        }
        if (search) {
            instFilter.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { institution: { name: { contains: search, mode: "insensitive" } } },
            ];
        }

        // Admin programs filter
        const adminFilter: Record<string, unknown> = {
            ...baseFilter,
            posted_by_admin: true,
        };
        if (search) {
            adminFilter.title = { contains: search, mode: "insensitive" };
        }

        const where = { OR: [instFilter, adminFilter] };

        // Fetch all matching programs
        const [allPrograms, total] = await Promise.all([
            prisma.program.findMany({
                where: where as any,
                include: {
                    institution: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            category: true,
                            status: true,
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
            prisma.program.count({ where: where as any }),
        ]);

        // Sort by plan rank (descending) then by created_at (descending)
        // Admin programs get max rank (100) so they appear at the top
        const sorted = allPrograms.sort((a: any, b: any) => {
            const rankA = a.posted_by_admin ? 100 : getPlanRank(a.institution?.payment_requests?.[0]?.plan?.name);
            const rankB = b.posted_by_admin ? 100 : getPlanRank(b.institution?.payment_requests?.[0]?.plan?.name);
            if (rankB !== rankA) return rankB - rankA;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        // Paginate after sorting
        const paginated = sorted.slice((page - 1) * limit, page * limit);

        // Map to response format
        const programs = paginated.map((p: any) => ({
            id: p.id,
            title: p.title,
            category: p.category,
            duration: p.duration,
            eligibility: p.eligibility,
            deadline: p.deadline,
            application_method: p.application_method,
            external_url: p.external_url,
            is_active: p.is_active,
            created_at: p.created_at,
            program_code: p.program_code,
            fee: p.fee,
            schedule_type: p.schedule_type,
            study_field: p.study_field,
            applicants: p._count.applications,
            postedByPlatform: p.posted_by_admin || false,
            institution: p.posted_by_admin
                ? {
                    id: 0,
                    name: "DAKHLA Platform",
                    city: null,
                    category: null,
                    status: "approved",
                    profilePicture: null,
                    uniqueId: "platform",
                    planTier: "Featured",
                }
                : {
                    id: p.institution.id,
                    name: p.institution.name,
                    city: p.institution.city,
                    category: p.institution.category,
                    status: p.institution.status,
                    profilePicture: p.institution.profile_picture_url,
                    uniqueId: p.institution.user?.unique_id || String(p.institution.id),
                    planTier: p.institution.payment_requests[0]?.plan?.name || "Starter",
                },
        }));

        return NextResponse.json({
            programs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("List programs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
