import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { approvalSchema } from "@/lib/validations";
import { sendPlanActivatedEmail } from "@/lib/mail";

// PUT /api/admin/billing/[id] — Approve or reject a payment request
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

        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { id: parseInt(id) },
            include: { plan: true, institution: { include: { user: true } } },
        });

        if (!paymentRequest) {
            return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
        }

        const isApproving = parsed.data.status === "approved";
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // Update the payment request status
        const updated = await prisma.paymentRequest.update({
            where: { id: parseInt(id) },
            data: {
                status: parsed.data.status,
                ...(isApproving ? { approved_at: now } : {}),
            },
            include: { plan: true, institution: true },
        });

        // If approved, set as the institution's current plan
        if (isApproving) {
            await prisma.institutionProfile.update({
                where: { id: paymentRequest.institution_id },
                data: {
                    current_plan_id: paymentRequest.plan_id,
                    plan_expires_at: expiresAt,
                },
            });

            // Send activation email
            const email = paymentRequest.institution.user.email;
            if (email) {
                sendPlanActivatedEmail(
                    email,
                    paymentRequest.institution.name,
                    paymentRequest.plan.name,
                    expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                ).catch(() => { });
            }
        }

        return NextResponse.json({
            request: updated,
            message: `Payment request ${parsed.data.status}`,
        });
    } catch (error) {
        console.error("Verify billing error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
