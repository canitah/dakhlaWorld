import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { uploadToCloudinary, cloudinary } from "@/lib/cloudinary";

// GET /api/students/profile/cv — Generate signed URL for CV and redirect
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        // Support viewing another student's CV (for institutions) via query param
        const { searchParams } = new URL(request.url);
        const studentUserId = searchParams.get("userId");

        const targetUserId = studentUserId
            ? parseInt(studentUserId, 10)
            : authResult.user.userId;

        const profile = await prisma.studentProfile.findUnique({
            where: { user_id: targetUserId },
            select: { cv_url: true },
        });

        if (!profile?.cv_url) {
            return NextResponse.json({ error: "No CV found" }, { status: 404 });
        }

        const cvUrl = profile.cv_url;

        // Extract public_id from the Cloudinary URL
        // URL format: https://res.cloudinary.com/<cloud>/[raw|image]/upload/v<version>/<public_id>
        const match = cvUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        if (!match) {
            // Fallback: just redirect to the stored URL
            return NextResponse.redirect(cvUrl);
        }

        const publicId = match[1];

        // Determine resource type from URL
        const resourceType = cvUrl.includes("/raw/upload/") ? "raw" : "image";

        // Generate a signed URL valid for 1 hour
        const signedUrl = cloudinary.url(publicId, {
            sign_url: true,
            resource_type: resourceType,
            type: "upload",
            format: "pdf",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
        });

        return NextResponse.json({ url: signedUrl });
    } catch (error) {
        console.error("Get CV error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

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

        // Upload CV to Cloudinary
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
