import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

// DELETE /api/notifications/[id] — Remove a specific notification
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await authenticateRequest(request);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const notificationId = parseInt(id, 10);
        if (isNaN(notificationId)) {
            return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
        }

        // Ensure the notification belongs to the authenticated user
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, user_id: authResult.user.userId },
        });

        if (!notification) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        await prisma.notification.delete({
            where: { id: notificationId },
        });

        return NextResponse.json({ message: "Notification removed" });
    } catch (error) {
        console.error("Delete notification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
