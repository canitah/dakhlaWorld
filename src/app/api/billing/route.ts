import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { paymentRequestSchema } from "@/lib/validations";

// GET /api/billing/my-requests — View billing history
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const requests = await prisma.paymentRequest.findMany({
            where: { institution_id: profile.id },
            include: { plan: true },
            orderBy: { created_at: "desc" },
        });

        // Also get available plans
        const plans = await prisma.paymentPlan.findMany({
            orderBy: { price_pkr: "asc" },
        });

        return NextResponse.json({ requests, plans });
    } catch (error) {
        console.error("Get billing error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/billing/request — Submit a billing/plan upgrade request
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const parsed = paymentRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Verify plan exists
        const plan = await prisma.paymentPlan.findUnique({
            where: { id: parsed.data.plan_id },
        });

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        const paymentRequest = await prisma.paymentRequest.create({
            data: {
                institution_id: profile.id,
                plan_id: parsed.data.plan_id,
                transaction_ref: parsed.data.transaction_ref,
                screenshot_url: parsed.data.screenshot_url,
                status: "pending",
            },
            include: { plan: true },
        });

        return NextResponse.json(
            { request: paymentRequest, message: "Payment request submitted" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create billing request error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
