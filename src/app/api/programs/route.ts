import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlanRank } from "@/lib/plan-utils";

// GET /api/programs — List programs with filters (public for authenticated users)
// Programs are sorted by institution plan tier (Featured > Pro > Growth > Starter), then by created_at desc
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const city = searchParams.get("city") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");

        const where: Record<string, unknown> = {
            is_active: true,
            institution: { status: "approved" },
        };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { institution: { name: { contains: search, mode: "insensitive" } } },
            ];
        }

        if (category) {
            where.category = category;
        }

        if (city) {
            where.institution = { ...(where.institution as object || {}), city };
        }

        // Fetch all matching programs with institution payment info for ranking
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
                            status: true,
                            payment_requests: {
                                where: { status: "approved" },
                                include: { plan: true },
                                orderBy: { updated_at: "desc" },
                                take: 1,
                            },
                        },
                    },
                },
            }),
            prisma.program.count({ where }),
        ]);

        // Sort by plan rank (descending) then by created_at (descending)
        const sorted = allPrograms.sort((a, b) => {
            const rankA = getPlanRank(a.institution.payment_requests[0]?.plan?.name);
            const rankB = getPlanRank(b.institution.payment_requests[0]?.plan?.name);
            if (rankB !== rankA) return rankB - rankA;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        // Paginate after sorting
        const paginated = sorted.slice((page - 1) * limit, page * limit);

        // Map to response format — include plan tier for frontend card styling
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
            institution: {
                id: p.institution.id,
                name: p.institution.name,
                city: p.institution.city,
                category: p.institution.category,
                status: p.institution.status,
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
