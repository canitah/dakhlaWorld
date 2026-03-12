import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { programSchema } from "@/lib/validations";

// PUT /api/admin/programs/[id] — Update an admin-posted program
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
        const parsed = programSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const existing = await prisma.program.findFirst({
            where: { id: parseInt(id), posted_by_admin: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        const program = await prisma.program.update({
            where: { id: parseInt(id) },
            data: {
                ...parsed.data,
                deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
            },
        });

        // Update questions if provided
        if (body.questions !== undefined && Array.isArray(body.questions)) {
            await prisma.programQuestion.deleteMany({ where: { program_id: program.id } });
            const questionsData = body.questions
                .filter((q: any) => typeof q.question === "string" && q.question.trim())
                .map((q: any) => ({
                    program_id: program.id,
                    question: q.question.trim(),
                    is_required: q.is_required !== false,
                }));
            if (questionsData.length > 0) {
                await prisma.programQuestion.createMany({ data: questionsData });
            }
        }

        return NextResponse.json({ program, message: "Program updated successfully" });
    } catch (error) {
        console.error("Update admin program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/programs/[id] — Delete an admin-posted program
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const existing = await prisma.program.findFirst({
            where: { id: parseInt(id), posted_by_admin: true },
        });

        if (!existing) {
            return NextResponse.json({ error: "Program not found" }, { status: 404 });
        }

        await prisma.program.delete({ where: { id: parseInt(id) } });

        return NextResponse.json({ message: "Program deleted successfully" });
    } catch (error) {
        console.error("Delete admin program error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
