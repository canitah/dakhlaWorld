import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { paymentRequestSchema } from "@/lib/validations";

// GET /api/billing/my-requests — View billing history
export async function GET(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
            include: { current_plan: true },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const requests = await prisma.paymentRequest.findMany({
            where: { institution_id: profile.id },
            include: { plan: true },
            orderBy: { created_at: "desc" },
        });

        // Get available plans — auto-seed if none exist
        let plans = await prisma.paymentPlan.findMany({
            orderBy: { price_pkr: "asc" },
        });

        if (plans.length === 0) {
            const seedPlans = [
                { name: "Starter", price_pkr: 0, features_json: JSON.stringify({ active_admissions: "2", standard_search_listing: true, highlighted_admission_card: false, priority_search_ranking: false, homepage_featured_section: false, institution_badge: "", profile_customization: "Basic", view_application_count: false, view_click_analytics: false, social_media_mention: false, support_level: "Standard" }) },
                { name: "Growth", price_pkr: 1500, features_json: JSON.stringify({ active_admissions: "10", standard_search_listing: true, highlighted_admission_card: true, priority_search_ranking: "Above Free", homepage_featured_section: false, institution_badge: "Verified", profile_customization: "Basic", view_application_count: true, view_click_analytics: false, social_media_mention: false, support_level: "Priority Email" }) },
                { name: "Pro", price_pkr: 3000, features_json: JSON.stringify({ active_admissions: "20", standard_search_listing: true, highlighted_admission_card: true, priority_search_ranking: "Above Growth", homepage_featured_section: "Rotational", institution_badge: "Pro", profile_customization: "Enhanced", view_application_count: true, view_click_analytics: true, social_media_mention: "Optional Add-on", support_level: "Priority Email" }) },
                { name: "Featured", price_pkr: 5000, features_json: JSON.stringify({ active_admissions: "Unlimited", standard_search_listing: true, highlighted_admission_card: true, priority_search_ranking: "Top Priority", homepage_featured_section: "Fixed Featured Slot", institution_badge: "Featured", profile_customization: "Premium Layout", view_application_count: true, view_click_analytics: "Advanced (Clicks + Views)", social_media_mention: "1 Monthly Mention", support_level: "Priority + Fast Response" }) },
            ];
            for (const sp of seedPlans) {
                await prisma.paymentPlan.upsert({ where: { name: sp.name }, update: { price_pkr: sp.price_pkr, features_json: sp.features_json }, create: sp });
            }
            plans = await prisma.paymentPlan.findMany({ orderBy: { price_pkr: "asc" } });
        }

        return NextResponse.json({
            requests,
            plans,
            current_plan: profile.current_plan,
            auto_renew: profile.auto_renew,
            plan_expires_at: profile.plan_expires_at,
        });
    } catch (error) {
        console.error("Get billing error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/billing/request — Submit a billing/plan upgrade request
export async function POST(request: Request) {
    try {
        const authResult = await authenticateRequest(request, ["institution"]);
        if ("error" in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const parsed = paymentRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const profile = await prisma.institutionProfile.findUnique({
            where: { user_id: authResult.user.userId },
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Verify plan exists
        const plan = await prisma.paymentPlan.findUnique({
            where: { id: parsed.data.plan_id },
        });

        if (!plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 });
        }

        const paymentRequest = await prisma.paymentRequest.create({
            data: {
                institution_id: profile.id,
                plan_id: parsed.data.plan_id,
                transaction_ref: parsed.data.transaction_ref,
                screenshot_url: parsed.data.screenshot_url,
                status: "pending",
            },
            include: { plan: true },
        });

        return NextResponse.json(
            { request: paymentRequest, message: "Payment request submitted" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create billing request error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
