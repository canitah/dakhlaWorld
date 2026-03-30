import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { applicationStatusSchema } from "@/lib/validations";
import { sendApplicationStatusEmail } from "@/lib/mail";

// PUT /api/admin/applications/[id] — Update application status (accept/reject/view)
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const body = await request.json();
        const parsed = applicationStatusSchema.safeParse({
    status: body.status,
});

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        // Find the application
        const application = await prisma.application.findUnique({
            where: { id: parseInt(id) },
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
    data: {
        status: parsed.data.status,

        // ✅ update student fields if provided
        student: body.student
            ? {
                update: {
                    full_name: body.student.full_name,
                    city: body.student.city,
                },
            }
            : undefined,
    },
});

        const newStatus = parsed.data.status;

        if (newStatus === "accepted" || newStatus === "rejected") {
            // Send email to student (from DAKHLA Platform, not institution)
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
                        ? `Congratulations! Your application for "${application.program.title}" has been accepted by DAKHLA Platform!`
                        : `Your application for "${application.program.title}" has been rejected by DAKHLA Platform.`,
                    type: `application_${newStatus}`,
                    link: `/student/applications?highlight=${parseInt(id)}`,
                },
            });
        } else if (newStatus === "viewed") {
            await prisma.notification.create({
                data: {
                    user_id: application.student.user_id,
                    title: "Application Viewed",
                    message: `DAKHLA Platform has viewed your application for "${application.program.title}".`,
                    type: "application_viewed",
                    link: `/student/applications?highlight=${parseInt(id)}`,
                },
            });
        }

        return NextResponse.json({ application: updated, message: "Status updated" });
    } catch (error) {
        console.error("Admin update application status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
