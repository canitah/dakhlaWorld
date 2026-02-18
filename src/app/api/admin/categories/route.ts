import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

// GET /api/admin/categories
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
        });

        // Count programs per category name (category is stored as a plain string on Program)
        const programCounts = await prisma.program.groupBy({
            by: ["category"],
            _count: { category: true },
        });
        const countMap = new Map(programCounts.map((pc) => [pc.category, pc._count.category]));

        const categoriesWithCounts = categories.map((cat) => ({
            ...cat,
            _count: { programs: countMap.get(cat.name) || 0 },
        }));

        return NextResponse.json({ categories: categoriesWithCounts });
    } catch (error) {
        console.error("List categories error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/admin/categories
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const parsed = categorySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: { name: parsed.data.name },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return NextResponse.json({ error: "Category already exists" }, { status: 409 });
        }
        console.error("Create category error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/categories
export async function DELETE(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Category ID required" }, { status: 400 });
        }

        await prisma.category.delete({ where: { id: parseInt(id) } });

        return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
        console.error("Delete category error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
