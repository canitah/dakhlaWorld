import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { approvalSchema } from "@/lib/validations";

// PUT /api/admin/institutions/[id] — Approve or reject an institution
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

        const institution = await prisma.institutionProfile.findUnique({
            where: { id: parseInt(id) },
        });

        if (!institution) {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 });
        }

        const updated = await prisma.institutionProfile.update({
            where: { id: parseInt(id) },
            data: { status: parsed.data.status },
        });

        return NextResponse.json({
            institution: updated,
            message: `Institution ${parsed.data.status}`,
        });
    } catch (error) {
        console.error("Update institution status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
