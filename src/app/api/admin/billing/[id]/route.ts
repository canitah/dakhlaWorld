import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { approvalSchema } from "@/lib/validations";

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
        });

        if (!paymentRequest) {
            return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
        }

        const updated = await prisma.paymentRequest.update({
            where: { id: parseInt(id) },
            data: { status: parsed.data.status },
            include: { plan: true, institution: true },
        });

        return NextResponse.json({
            request: updated,
            message: `Payment request ${parsed.data.status}`,
        });
    } catch (error) {
        console.error("Verify billing error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
