import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// GET /api/notifications — Fetch notifications for authenticated user
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const notifications = await prisma.notification.findMany({
            where: { user_id: authResult.user.userId },
            orderBy: { created_at: "desc" },
            take: 50,
        });

        const unreadCount = await prisma.notification.count({
            where: { user_id: authResult.user.userId, is_read: false },
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Fetch notifications error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
