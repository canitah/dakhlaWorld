import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student", "institution"]);
        if ("error" in authResult) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        const formData = await request.formData();
        const file = formData.get("image") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        // Upload to Cloudinary
        const url = await uploadToCloudinary(file, "gap/profile-pictures");

        // Update the appropriate profile using raw SQL
        // (typed client may not reflect the new column yet)
        const { userId, role } = authResult.user;

        if (role === "student") {
            await prisma.$executeRaw`
                UPDATE student_profiles SET profile_picture_url = ${url} WHERE user_id = ${userId}
            `;
        } else if (role === "institution") {
            await prisma.$executeRaw`
                UPDATE institution_profiles SET profile_picture_url = ${url} WHERE user_id = ${userId}
            `;
        }

        return NextResponse.json({ url, message: "Profile picture updated successfully" });
    } catch (error) {
        console.error("Profile picture upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload profile picture" },
            { status: 500 }
        );
    }
}
