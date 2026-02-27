import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// POST /api/notifications/report — Report a notification to admins
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json().catch(() => ({}));
        const { notificationId, reason } = body as { notificationId?: number; reason?: string };

        if (!notificationId) {
            return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
        }

        // Verify notification exists and belongs to the user
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, user_id: authResult.user.userId },
        });

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        // Get all admin users
        const admins = await prisma.user.findMany({
            where: { role: "admin" },
            select: { id: true },
        });

        // Create a notification for each admin about the report
        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map((admin: any) => ({
                    user_id: admin.id,
                    title: "Notification Reported",
                    message: `User #${authResult.user.userId} reported notification #${notificationId}${reason ? `: "${reason}"` : ""}. Original: "${notification.title}"`,
                    type: "notification_reported",
                    link: null,
                })),
            });
        }

        return NextResponse.json({ message: "Notification reported to admins" });
    } catch (error) {
        console.error("Report notification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
