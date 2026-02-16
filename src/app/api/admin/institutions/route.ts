import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/admin/institutions — List institutions (filterable by status)
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status"); // pending | approved | rejected

        const where = status ? { status } : {};

        const institutions = await prisma.institutionProfile.findMany({
            where,
            include: {
                user: { select: { email: true, phone: true, created_at: true } },
                _count: { select: { programs: true } },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({ institutions });
    } catch (error) {
        console.error("List institutions error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
