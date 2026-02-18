import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { approvalSchema } from "@/lib/validations";
import { sendInstitutionApprovalEmail } from "@/lib/mail";

// PUT /api/admin/institutions/[id] — Approve or reject an institution
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
        const parsed = approvalSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const institution = await prisma.institutionProfile.findUnique({
            where: { id: parseInt(id) },
            include: { user: { select: { id: true, email: true } } },
        });

        if (!institution) {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 });
        }

        // Block approval if profile is incomplete
        if (parsed.data.status === "approved") {
            const requiredFields = ["name", "category", "city", "description", "contact_email"] as const;
            const missingFields = requiredFields.filter(
                (f) => !institution[f] || (institution[f] as string).trim() === ""
            );
            if (missingFields.length > 0) {
                return NextResponse.json(
                    {
                        error: `Cannot approve: institution profile is incomplete. Missing fields: ${missingFields.join(", ")}`,
                        missingFields,
                    },
                    { status: 400 }
                );
            }
        }

        const updated = await prisma.institutionProfile.update({
            where: { id: parseInt(id) },
            data: {
                status: parsed.data.status,
                rejection_reason: parsed.data.status === "rejected"
                    ? (parsed.data.reason || null)
                    : null,
            },
        });

        // Send email notification and create in-app notification
        const statusText = parsed.data.status === "approved" ? "approved" : "rejected";

        if (institution.user.email) {
            sendInstitutionApprovalEmail(
                institution.user.email,
                institution.name,
                statusText,
                parsed.data.reason
            ).catch(() => { });
        }

        // Create in-app notification for the institution user
        const rejectionNote = parsed.data.reason
            ? ` Reason: ${parsed.data.reason}`
            : "";
        await prisma.notification.create({
            data: {
                user_id: institution.user.id,
                title: `Institution ${statusText === "approved" ? "Approved" : "Rejected"}`,
                message: statusText === "approved"
                    ? `Your institution "${institution.name}" has been approved! You can now post programs and manage applications.`
                    : `Your institution "${institution.name}" registration has been rejected.${rejectionNote}`,
                type: `institution_${statusText}`,
                link: "/institution",
            },
        });

        return NextResponse.json({
            institution: updated,
            message: `Institution ${parsed.data.status}`,
        });
    } catch (error) {
        console.error("Update institution status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
