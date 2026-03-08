import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/applications/track?code=APP-XXXXXXXX — Track application by code or program name
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "Application code or program name is required" }, { status: 400 });
        }

        const includeRelations = {
            program: {
                include: {
                    institution: {
                        select: { name: true, city: true },
                    },
                },
            },
        };

        // If input looks like an application code (starts with APP-), search by code
        if (code.toUpperCase().startsWith("APP-")) {
            const application = await prisma.application.findUnique({
                where: { application_code: code },
                include: includeRelations,
            });

            if (!application) {
                return NextResponse.json({ error: "No application found with this code" }, { status: 404 });
            }

            return NextResponse.json({ application });
        }

        // Otherwise, search by program name for this student
        const profile = await prisma.studentProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const application = await prisma.application.findFirst({
            where: {
                student_id: profile.id,
                program: {
                    title: { contains: code, mode: "insensitive" },
                },
            },
            include: includeRelations,
            orderBy: { created_at: "desc" },
        });

        if (!application) {
            return NextResponse.json({ error: "No application found matching this program name" }, { status: 404 });
        }

        return NextResponse.json({ application });
    } catch (error) {
        console.error("Track application error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

