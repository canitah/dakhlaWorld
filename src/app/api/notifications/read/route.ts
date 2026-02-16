import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// PUT /api/notifications/read — Mark notifications as read
export async function PUT(request: Request) {
    try {
        const authResult = await authenticateRequest(request);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json().catch(() => ({}));
        const { id } = body as { id?: number };

        if (id) {
            // Mark single notification as read
            await prisma.notification.updateMany({
                where: { id, user_id: authResult.user.userId },
                data: { is_read: true },
            });
        } else {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { user_id: authResult.user.userId, is_read: false },
                data: { is_read: true },
            });
        }

        return NextResponse.json({ message: "Notifications marked as read" });
    } catch (error) {
        console.error("Mark notifications read error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
