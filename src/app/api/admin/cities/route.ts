import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { citySchema } from "@/lib/validations";

// GET /api/admin/cities
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const cities = await prisma.city.findMany({
            orderBy: { name: "asc" },
        });

        // Count institutions per city name (city is stored as a plain string on InstitutionProfile)
        const instCounts = await prisma.institutionProfile.groupBy({
            by: ["city"],
            _count: { city: true },
        });
        const countMap = new Map(instCounts.map((ic) => [ic.city, ic._count.city]));

        const citiesWithCounts = cities.map((c) => ({
            ...c,
            _count: { institutions: countMap.get(c.name) || 0 },
        }));

        return NextResponse.json({ cities: citiesWithCounts });
    } catch (error) {
        console.error("List cities error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/admin/cities
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const parsed = citySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const city = await prisma.city.create({
            data: { name: parsed.data.name },
        });

        return NextResponse.json({ city }, { status: 201 });
    } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return NextResponse.json({ error: "City already exists" }, { status: 409 });
        }
        console.error("Create city error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/admin/cities
export async function DELETE(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["admin"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "City ID required" }, { status: 400 });
        }

        await prisma.city.delete({ where: { id: parseInt(id) } });

        return NextResponse.json({ message: "City deleted" });
    } catch (error) {
        console.error("Delete city error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
