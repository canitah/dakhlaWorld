import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// PUT /api/billing/auto-renew — Toggle auto-renewal on/off
export async function PUT(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const autoRenew = Boolean(body.auto_renew);

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        await prisma.institutionProfile.update({
            where: { id: profile.id },
            data: { auto_renew: autoRenew },
        });

        return NextResponse.json({
            auto_renew: autoRenew,
            message: autoRenew ? "Auto-renewal enabled" : "Auto-renewal disabled",
        });
    } catch (error) {
        console.error("Toggle auto-renew error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
