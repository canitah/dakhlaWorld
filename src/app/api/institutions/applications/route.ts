import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/institutions/applications — View applications to institution's programs
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const applications = await prisma.application.findMany({
            where: {
                program: { institution_id: profile.id },
            },
            select: {
                id: true,
                application_code: true,
                status: true,
                created_at: true,
                program: { select: { id: true, title: true, category: true } },
                student: {
                    select: {
                        id: true,
                        full_name: true,
                        city: true,
                        education_level: true,
                        user: { select: { email: true, phone: true } },
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({ applications });
    } catch (error) {
        console.error("List institution applications error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
