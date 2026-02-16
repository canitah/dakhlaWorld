import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { institutionProfileSchema } from "@/lib/validations";

// GET /api/institutions/profile — Get current institution's profile
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
            include: {
                user: { select: { email: true, phone: true, status: true } },
                _count: { select: { programs: true } },
                payment_requests: {
                    where: { status: "approved" },
                    include: { plan: true },
                    orderBy: { updated_at: "desc" },
                    take: 1,
                },
            },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Get institution profile error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/institutions/profile — Update institution profile
export async function PUT(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const parsed = institutionProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const profile = await prisma.institutionProfile.update({
            where: { user_id: authResult.user.userId },
            data: parsed.data,
        });

        return NextResponse.json({ profile, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update institution profile error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
