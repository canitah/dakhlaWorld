import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/admin/billing — List all payment requests
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const where = status ? { status } : {};

        const requests = await prisma.paymentRequest.findMany({
            where,
            include: {
                institution: { select: { id: true, name: true, city: true } },
                plan: true,
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({ requests });
    } catch (error) {
        console.error("List billing requests error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
