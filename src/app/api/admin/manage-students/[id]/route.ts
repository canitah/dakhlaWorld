import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function PATCH(
    req: Request, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const profileId = parseInt(resolvedParams.id);

        const body = await req.json();

        if (isNaN(profileId)) {
            return NextResponse.json({ error: "Invalid ID provided" }, { status: 400 });
        }

        // ✅ IMPORTANT: correct status extraction
        const newStatus = body.status || body.user?.status;

        const updated = await prisma.studentProfile.update({
            where: { id: profileId },
            data: {
                full_name: body.full_name,
                city: body.city,
                student_type: body.student_type,
                education_level: body.education_level,
                intended_field: body.intended_field,
                user: {
                    update: {
                        phone: body.phone,
                        status: newStatus, // ✅ FIXED
                    }
                }
            },
            include: {
                user: true // 🔥 VERY IMPORTANT for reload
            }
        });

        return NextResponse.json({ success: true, data: updated });

    } catch (error: any) {
        console.error("Prisma Error:", error);
        return NextResponse.json({ 
            error: "Update failed", 
            details: error.message 
        }, { status: 500 });
    }
}