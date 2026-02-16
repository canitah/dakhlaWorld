import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { applicationStatusSchema } from "@/lib/validations";

// PUT /api/institutions/applications/[id] — Update application status
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const body = await request.json();
        const parsed = applicationStatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        // Verify the application belongs to this institution's programs
        const application = await prisma.application.findFirst({
            where: {
                id: parseInt(id),
                program: { institution_id: profile!.id },
            },
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        const updated = await prisma.application.update({
            where: { id: parseInt(id) },
            data: { status: parsed.data.status },
        });

        return NextResponse.json({ application: updated, message: "Status updated" });
    } catch (error) {
        console.error("Update application status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
