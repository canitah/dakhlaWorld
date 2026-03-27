import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/admin/students — List all students with application data
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const students = await prisma.studentProfile.findMany({
            include: {
                user: {
                    select: { email: true, phone: true, created_at: true, status: true }
                },
                applications: {
                    include: {
                        program: {
                            select: {
                                title: true,
                                institution: { select: { name: true } },
                            },
                        },
                    },
                    orderBy: { created_at: "desc" },
                },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({ students });
    } catch (error) {
        console.error("Admin get students error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
