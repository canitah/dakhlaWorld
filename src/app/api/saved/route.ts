import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/saved — List saved programs
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const profile = await prisma.studentProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const saved = await prisma.savedAdmission.findMany({
            where: { student_id: profile.id },
            include: {
                program: {
                    include: {
                        institution: {
                            select: { id: true, name: true, city: true, category: true },
                        },
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({ saved });
    } catch (error) {
        console.error("List saved error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/saved — Save a program
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { program_id } = await request.json();

        const profile = await prisma.studentProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Toggle save/unsave
        const existing = await prisma.savedAdmission.findUnique({
            where: {
                student_id_program_id: {
                    student_id: profile.id,
                    program_id: parseInt(program_id),
                },
            },
        });

        if (existing) {
            await prisma.savedAdmission.delete({ where: { id: existing.id } });
            return NextResponse.json({ message: "Program unsaved", saved: false });
        }

        await prisma.savedAdmission.create({
            data: {
                student_id: profile.id,
                program_id: parseInt(program_id),
            },
        });

        return NextResponse.json({ message: "Program saved", saved: true }, { status: 201 });
    } catch (error) {
        console.error("Save program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
