import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/applications/track?code=APP-XXXXXXXX — Track application by code
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "Application code is required" }, { status: 400 });
        }

        const application = await prisma.application.findUnique({
            where: { application_code: code },
            include: {
                program: {
                    include: {
                        institution: {
                            select: { name: true, city: true },
                        },
                    },
                },
            },
        });

        if (!application) {
            return NextResponse.json({ error: "No application found with this code" }, { status: 404 });
        }

        return NextResponse.json({ application });
    } catch (error) {
        console.error("Track application error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
