import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Use the same adapter setup as the app's lib/prisma.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const plans = [
    {
        name: "Starter",
        price_pkr: 0,
        features_json: JSON.stringify({
            active_admissions: "2",
            standard_search_listing: true,
            highlighted_admission_card: false,
            priority_search_ranking: false,
            homepage_featured_section: false,
            institution_badge: "",
            profile_customization: "Basic",
            view_application_count: false,
            view_click_analytics: false,
            social_media_mention: false,
            support_level: "Standard",
        }),
    },
    {
        name: "Growth",
        price_pkr: 1500,
        features_json: JSON.stringify({
            active_admissions: "10",
            standard_search_listing: true,
            highlighted_admission_card: true,
            priority_search_ranking: "Above Free",
            homepage_featured_section: false,
            institution_badge: "Verified",
            profile_customization: "Basic",
            view_application_count: true,
            view_click_analytics: false,
            social_media_mention: false,
            support_level: "Priority Email",
        }),
    },
    {
        name: "Pro",
        price_pkr: 3000,
        features_json: JSON.stringify({
            active_admissions: "20",
            standard_search_listing: true,
            highlighted_admission_card: true,
            priority_search_ranking: "Above Growth",
            homepage_featured_section: "Rotational",
            institution_badge: "Pro",
            profile_customization: "Enhanced",
            view_application_count: true,
            view_click_analytics: true,
            social_media_mention: "Optional Add-on",
            support_level: "Priority Email",
        }),
    },
    {
        name: "Featured",
        price_pkr: 5000,
        features_json: JSON.stringify({
            active_admissions: "Unlimited",
            standard_search_listing: true,
            highlighted_admission_card: true,
            priority_search_ranking: "Top Priority",
            homepage_featured_section: "Fixed Featured Slot",
            institution_badge: "Featured",
            profile_customization: "Premium Layout",
            view_application_count: true,
            view_click_analytics: "Advanced (Clicks + Views)",
            social_media_mention: "1 Monthly Mention",
            support_level: "Priority + Fast Response",
        }),
    },
];

async function main() {
    console.log("Seeding payment plans...");

    for (const plan of plans) {
        await prisma.paymentPlan.upsert({
            where: { name: plan.name },
            update: {
                price_pkr: plan.price_pkr,
                features_json: plan.features_json,
            },
            create: plan,
        });
        console.log(`  ✓ ${plan.name} — PKR ${plan.price_pkr.toLocaleString()}`);
    }

    console.log("Done seeding payment plans.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
