import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { applicationStatusSchema } from "@/lib/validations";
import { sendApplicationStatusEmail } from "@/lib/mail";

// PUT /api/institutions/applications/[id] — Update application status
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const body = await request.json();
        const parsed = applicationStatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        // Verify the application belongs to this institution's programs
        const application = await prisma.application.findFirst({
            where: {
                id: parseInt(id),
                program: { institution_id: profile!.id },
            },
            include: {
                program: { select: { title: true } },
                student: {
                    select: {
                        user_id: true,
                        user: { select: { email: true } },
                    },
                },
            },
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        const updated = await prisma.application.update({
            where: { id: parseInt(id) },
            data: { status: parsed.data.status },
        });

        // Send email and notification to student on status change
        const newStatus = parsed.data.status;

        // Get institution name for notification message
        const instProfile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
            select: { name: true },
        });
        const instName = instProfile?.name || "An institution";

        if (newStatus === "accepted" || newStatus === "rejected") {
            // Send email to student
            if (application.student.user.email) {
                sendApplicationStatusEmail(
                    application.student.user.email,
                    application.program.title,
                    newStatus
                ).catch(() => { });
            }

            // Create in-app notification for the student
            await prisma.notification.create({
                data: {
                    user_id: application.student.user_id,
                    title: `Application ${newStatus === "accepted" ? "Accepted" : "Rejected"}`,
                    message: newStatus === "accepted"
                        ? `Congratulations! Your application for "${application.program.title}" has been accepted by ${instName}!`
                        : `Your application for "${application.program.title}" has been rejected by ${instName}.`,
                    type: `application_${newStatus}`,
                    link: "/student/applications",
                },
            });
        } else if (newStatus === "viewed") {
            // Create in-app notification for the student (no email for viewed)
            await prisma.notification.create({
                data: {
                    user_id: application.student.user_id,
                    title: "Application Viewed",
                    message: `${instName} has viewed your application for "${application.program.title}".`,
                    type: "application_viewed",
                    link: "/student/applications",
                },
            });
        }

        return NextResponse.json({ application: updated, message: "Status updated" });
    } catch (error) {
        console.error("Update application status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
