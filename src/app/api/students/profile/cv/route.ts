import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// POST /api/students/profile/cv — Upload CV (PDF only)
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const formData = await request.formData();
        const file = formData.get("cv") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate PDF only
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
        }

        const cv_url = await uploadToCloudinary(file, "gap/cvs");

        await prisma.studentProfile.update({
            where: { user_id: authResult.user.userId },
            data: { cv_url },
        });

        return NextResponse.json({ cv_url, message: "CV uploaded successfully" });
    } catch (error) {
        console.error("CV upload error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
