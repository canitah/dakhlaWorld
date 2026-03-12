import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/admin/applications — List all applications for monitoring
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        const where = status ? { status } : {};

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                include: {
                    program: {
                        include: {
                            institution: { select: { name: true, city: true } },
                        },
                    },
                    student: {
                        select: {
                            full_name: true,
                            city: true,
                            cv_url: true,
                            user: { select: { email: true } },
                        },
                    },
                    answers: {
                        include: {
                            question: { select: { question: true } },
                        },
                    },
                },
                orderBy: { created_at: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.application.count({ where }),
        ]);

        return NextResponse.json({
            applications,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("Admin applications error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
