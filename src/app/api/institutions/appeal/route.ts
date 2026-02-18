import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { sendInstitutionAppealEmail } from "@/lib/mail";

// POST /api/institutions/appeal — Re-submit a rejected institution for approval
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        // Get the institution profile
        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
            include: { user: { select: { email: true } } },
        });

        if (!profile) {
            return NextResponse.json({ error: "Institution profile not found" }, { status: 404 });
        }

        if (profile.status !== "rejected") {
            return NextResponse.json(
                { error: "Only rejected institutions can appeal" },
                { status: 400 }
            );
        }

        // Update status back to pending
        await prisma.institutionProfile.update({
            where: { id: profile.id },
            data: { status: "pending" },
        });

        // Find all admin users to notify them
        const admins = await prisma.user.findMany({
            where: { role: "admin" },
            select: { id: true, email: true },
        });

        // Create in-app notification for each admin
        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map((admin) => ({
                    user_id: admin.id,
                    title: "Institution Appeal Received",
                    message: `"${profile.name}" has appealed their rejection and re-submitted for approval. Please review their profile.`,
                    type: "institution_appeal",
                    link: "/admin/institutions",
                })),
            });
        }

        // Send email to each admin
        for (const admin of admins) {
            if (admin.email) {
                sendInstitutionAppealEmail(admin.email, profile.name).catch(() => { });
            }
        }

        return NextResponse.json({ message: "Appeal submitted successfully. Your institution is now pending re-approval." });
    } catch (error) {
        console.error("Institution appeal error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
