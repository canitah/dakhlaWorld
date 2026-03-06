import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// POST /api/upload — Upload a file to Cloudinary (server-side, authenticated)
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["student", "institution", "admin"]);
        if ("error" in authResult) {
            console.error("Upload auth error:", authResult.error);
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "gap/uploads";

        if (!file) {
            console.error("Upload error: No file in FormData");
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log(`Upload: file=${file.name}, size=${file.size}, type=${file.type}, folder=${folder}`);

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 5MB allowed." }, { status: 400 });
        }

        // Validate file type (images only for screenshots)
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP, GIF allowed.` },
                { status: 400 }
            );
        }

        const url = await uploadToCloudinary(file, folder);
        console.log("Upload success:", url);
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("Upload error details:", error?.message || error);
        return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
    }
}
