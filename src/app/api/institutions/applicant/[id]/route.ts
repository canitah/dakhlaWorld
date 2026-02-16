import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/institutions/applicant/[id] — View student profile
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;

        // Verify this student has applied to this institution's programs
        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        const hasApplication = await prisma.application.findFirst({
            where: {
                student_id: parseInt(id),
                program: { institution_id: profile!.id },
            },
        });

        if (!hasApplication) {
            return NextResponse.json(
                { error: "You can only view profiles of students who applied to your programs" },
                { status: 403 }
            );
        }

        const student = await prisma.studentProfile.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: { select: { email: true, phone: true } },
            },
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        return NextResponse.json({ student });
    } catch (error) {
        console.error("View applicant error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
