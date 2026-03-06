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
            include: {
                program: { select: { title: true } },
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

        // Notify student that institution viewed their profile (once per institution per application, avoid spam)
        const existingViewNotif = await prisma.notification.findFirst({
            where: {
                user_id: student.user_id,
                type: "profile_viewed",
                message: { contains: profile!.name },
                link: { startsWith: "/student/applications" },
            },
        });

        if (!existingViewNotif) {
            await prisma.notification.create({
                data: {
                    user_id: student.user_id,
                    title: "Profile Viewed",
                    message: `${profile!.name} has viewed your profile for "${hasApplication.program.title}".`,
                    type: "profile_viewed",
                    link: `/student/applications?highlight=${hasApplication.id}`,
                },
            });
        }

        return NextResponse.json({ student });
    } catch (error) {
        console.error("View applicant error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
