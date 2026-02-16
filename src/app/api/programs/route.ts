import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/programs — List programs with filters (public for authenticated users)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const city = searchParams.get("city") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const featured = searchParams.get("featured") === "true";

        const where: Record<string, unknown> = {
            is_active: true,
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

        // For featured, sort by institutions with approved featured payment plans
        const orderBy: Record<string, string>[] = [{ created_at: "desc" }];

        const [programs, total] = await Promise.all([
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
                        },
                    },
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.program.count({ where }),
        ]);

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
