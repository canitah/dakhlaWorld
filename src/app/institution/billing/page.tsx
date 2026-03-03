"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { message } from "antd";
import {
    CheckCircleFilled,
    CloseCircleFilled,
    CrownFilled,
    StarFilled,
    ThunderboltFilled,
    RocketFilled,
} from "@ant-design/icons";
import {
    Sparkles,
    Zap,
    Shield,
    TrendingUp,
    Eye,
    BarChart3,
    Share2,
    Headphones,
    CreditCard,
    Clock,
    Check,
    X,
    ArrowRight,
} from "lucide-react";

/* ─── Static plan definitions (always shown, no DB dependency) ─── */

interface PlanDef {
    name: string;
    dbName: string;
    price: number;
    color: string;
    dotColor: string;
    gradient: string;
    btnClass: string;
    iconBg: string;
    badge?: string;
    icon: React.ReactNode;
    jazzCashAccount: string;
    features: Record<string, string | boolean>;
}

const JAZZCASH_ACCOUNT = "03001234567"; // Replace with your actual JazzCash number

const QR_IMAGES: Record<string, string> = {
    Growth: "/qr-growth.jpeg",
    Pro: "/qr-pro.jpeg",
    Featured: "/qr-featured.jpeg",
};

const PLANS: PlanDef[] = [
    {
        name: "Starter",
        dbName: "Starter",
        price: 0,
        color: "text-emerald-500",
        dotColor: "bg-emerald-500",
        gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
        btnClass: "",
        iconBg: "bg-emerald-500/10 text-emerald-500",
        icon: <Shield className="size-5" />,
        jazzCashAccount: JAZZCASH_ACCOUNT,
        features: {
            monthly_price: "Free",
            active_admissions: "2",
            standard_search_listing: true,
            highlighted_admission_card: false,
            priority_search_ranking: false,
            homepage_featured_section: false,
            institution_badge: false,
            profile_customization: "Basic",
            view_application_count: false,
            view_click_analytics: false,
            social_media_mention: false,
            support_level: "Standard",
        },
    },
    {
        name: "Growth",
        dbName: "Growth",
        price: 1500,
        color: "text-blue-500",
        dotColor: "bg-blue-500",
        gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
        btnClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25",
        iconBg: "bg-blue-500/10 text-blue-500",
        icon: <TrendingUp className="size-5" />,
        jazzCashAccount: JAZZCASH_ACCOUNT,
        features: {
            monthly_price: "1,500 PKR",
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
        },
    },
    {
        name: "Pro",
        dbName: "Pro",
        price: 3000,
        color: "text-purple-500",
        dotColor: "bg-purple-500",
        gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
        btnClass: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/25",
        iconBg: "bg-purple-500/10 text-purple-500",
        icon: <Zap className="size-5" />,
        jazzCashAccount: JAZZCASH_ACCOUNT,
        features: {
            monthly_price: "3,000 PKR",
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
        },
    },
    {
        name: "Featured",
        dbName: "Featured",
        price: 5000,
        color: "text-amber-500",
        dotColor: "bg-amber-500",
        gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
        btnClass: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25",
        iconBg: "bg-amber-500/10 text-amber-500",
        badge: "Most Popular",
        icon: <Sparkles className="size-5" />,
        jazzCashAccount: JAZZCASH_ACCOUNT,
        features: {
            monthly_price: "5,000 PKR",
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
        },
    },
];

const FEATURE_ROWS: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: "active_admissions", label: "Active Admissions", icon: <CreditCard className="size-4" /> },
    { key: "standard_search_listing", label: "Search Listing", icon: <Eye className="size-4" /> },
    { key: "highlighted_admission_card", label: "Highlighted Card", icon: <StarFilled style={{ fontSize: 14 }} /> },
    { key: "priority_search_ranking", label: "Priority Ranking", icon: <TrendingUp className="size-4" /> },
    { key: "homepage_featured_section", label: "Homepage Featured", icon: <RocketFilled style={{ fontSize: 14 }} /> },
    { key: "institution_badge", label: "Badge", icon: <CrownFilled style={{ fontSize: 14 }} /> },
    { key: "profile_customization", label: "Profile Customization", icon: <ThunderboltFilled style={{ fontSize: 14 }} /> },
    { key: "view_application_count", label: "Application Count", icon: <BarChart3 className="size-4" /> },
    { key: "view_click_analytics", label: "Click Analytics", icon: <BarChart3 className="size-4" /> },
    { key: "social_media_mention", label: "Social Media Mention", icon: <Share2 className="size-4" /> },
    { key: "support_level", label: "Support Level", icon: <Headphones className="size-4" /> },
];

/* ─── Feature cell renderer ─── */

function FeatureCell({ value }: { value: string | boolean }) {
    if (value === true) return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10">
            <Check className="size-3.5 text-emerald-500" />
        </span>
    );
    if (value === false) return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10">
            <X className="size-3.5 text-red-400" />
        </span>
    );
    return (
        <Badge variant="secondary" className="text-[11px] font-medium">
            {value}
        </Badge>
    );
}

/* ─── Payment history types ─── */

interface DbPlan {
    id: number;
    name: string;
    price_pkr: number;
}

interface PaymentReq {
    id: number;
    status: string;
    transaction_ref: string | null;
    screenshot_url: string | null;
    created_at: string;
    plan: DbPlan;
}

/* ─── Page component ─── */

export default function InstitutionBillingPage() {
    const { fetchWithAuth } = useApi();
    const router = useRouter();
    const [dbPlans, setDbPlans] = useState<DbPlan[]>([]);
    const [requests, setRequests] = useState<PaymentReq[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Payment dialog state
    const [selectedPlan, setSelectedPlan] = useState<PlanDef | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [transRef, setTransRef] = useState("");
    const [screenshotUrl, setScreenshotUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const res = await fetchWithAuth("/billing");
            if (res.ok) {
                const data = await res.json();
                setDbPlans(data.plans || []);
                setRequests(data.requests || []);
            }
        } catch {
            // Billing API may fail if no plans seeded — page still renders
        }
        setIsLoading(false);
    }

    const handleSelectPlan = (plan: PlanDef) => {
        if (plan.price === 0) return;
        setSelectedPlan(plan);
        setShowDialog(true);
        setTransRef("");
        setScreenshotUrl("");
    };

    const handleSubmit = async () => {
        if (!selectedPlan) return;
        if (!transRef.trim()) {
            message.warning("Please enter your transaction reference.");
            return;
        }

        const matchingPlan = dbPlans.find((p) => p.name === selectedPlan.dbName);

        if (!matchingPlan) {
            message.error("Plans not found in database. Please ask admin to seed plans first.");
            return;
        }

        setIsSubmitting(true);

        const res = await fetchWithAuth("/billing", {
            method: "POST",
            body: JSON.stringify({
                plan_id: matchingPlan.id,
                transaction_ref: transRef || undefined,
                screenshot_url: screenshotUrl || undefined,
            }),
        });

        if (res.ok) {
            message.success("Payment request submitted for verification!");
            setShowDialog(false);
            setSelectedPlan(null);
            loadData();
        } else {
            const data = await res.json();
            message.error(data.error || "Submission failed");
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <DashboardLayout role="institution">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="institution">
            {/* ─── Page Header ─── */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <CreditCard className="size-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            Institution Pricing Plans
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Choose the plan that best fits your institution&apos;s needs
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Plan Cards ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                {PLANS.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${plan.badge ? "ring-2 ring-amber-500/50" : ""}`}
                    >
                        {/* Gradient top accent */}
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${plan.gradient.replace("/10", "").replace("/5", "").replace("to-transparent", plan.dotColor.replace("bg-", "to-"))}`}
                            style={{
                                background: plan.name === "Starter" ? "linear-gradient(to right, #10b981, #34d399)"
                                    : plan.name === "Growth" ? "linear-gradient(to right, #3b82f6, #60a5fa)"
                                        : plan.name === "Pro" ? "linear-gradient(to right, #8b5cf6, #a78bfa)"
                                            : "linear-gradient(to right, #f59e0b, #f97316)"
                            }}
                        />

                        {plan.badge && (
                            <div className="absolute top-3 right-3">
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                    <Sparkles className="size-3 mr-0.5" />
                                    {plan.badge}
                                </Badge>
                            </div>
                        )}

                        <CardContent className="pt-6 pb-5 px-5 flex flex-col h-full">
                            {/* Icon & name */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2.5 rounded-xl ${plan.iconBg}`}>
                                    {plan.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {plan.price === 0 ? "Free forever" : "per month"}
                                    </p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-5">
                                <div className="flex items-baseline gap-1">
                                    {plan.price === 0 ? (
                                        <span className="text-3xl font-extrabold text-foreground">Free</span>
                                    ) : (
                                        <>
                                            <span className="text-sm font-medium text-muted-foreground">PKR</span>
                                            <span className={`text-3xl font-extrabold ${plan.color}`}>
                                                {plan.price.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-muted-foreground">/mo</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Separator className="mb-4" />

                            {/* Key features (top 5) */}
                            <div className="space-y-2.5 mb-5">
                                {FEATURE_ROWS.slice(0, 5).map((row) => {
                                    const val = plan.features[row.key];
                                    const isIncluded = val === true || (typeof val === "string" && val !== "false");
                                    return (
                                        <div key={row.key} className="flex items-center gap-2.5 text-sm">
                                            {isIncluded ? (
                                                <CheckCircleFilled className="text-emerald-500 shrink-0" style={{ fontSize: 14 }} />
                                            ) : (
                                                <CloseCircleFilled className="text-muted-foreground/40 shrink-0" style={{ fontSize: 14 }} />
                                            )}
                                            <span className={isIncluded ? "text-foreground" : "text-muted-foreground/60"}>
                                                {row.label}
                                                {typeof val === "string" && <span className="text-muted-foreground ml-1 text-xs">({val})</span>}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* CTA Button — pushed to bottom */}
                            <div className="mt-auto">
                                {plan.price === 0 ? (
                                    <Button variant="outline" disabled className="w-full text-sm">
                                        Current Plan
                                    </Button>
                                ) : (
                                    <Button
                                        className={`w-full text-sm text-white shadow-lg transition-all duration-200 ${plan.btnClass}`}
                                        onClick={() => handleSelectPlan(plan)}
                                    >
                                        Get {plan.name}
                                        <ArrowRight className="size-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>


            {/* ─── Payment History ─── */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Clock className="size-5 text-muted-foreground" />
                        <CardTitle className="text-lg">Payment History</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4">
                                <CreditCard className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">No payment requests yet</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Select a plan above to get started
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold">Plan</TableHead>
                                    <TableHead className="font-semibold">Amount</TableHead>
                                    <TableHead className="font-semibold">Reference</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.plan.name}</TableCell>
                                        <TableCell>PKR {req.plan.price_pkr.toLocaleString()}</TableCell>
                                        <TableCell className="text-muted-foreground font-mono text-xs">
                                            {req.transaction_ref || "—"}
                                        </TableCell>
                                        <TableCell><StatusBadge status={req.status} /></TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* ─── QR Code Payment Dialog (shadcn — auto dark/light) ─── */}
            <Dialog open={showDialog} onOpenChange={(open) => { if (!open) { setShowDialog(false); setSelectedPlan(null); } }}>
                <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="size-5" />
                            Pay for {selectedPlan?.dbName} Plan
                        </DialogTitle>
                        <DialogDescription>
                            Scan the QR code below to make payment via JazzCash, then submit your transaction reference.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPlan && (
                        <div className="space-y-5">
                            {/* Plan summary */}
                            <div className="bg-accent rounded-xl p-4 text-center border border-border">
                                <p className="text-sm text-muted-foreground">You are upgrading to</p>
                                <p className="text-xl font-bold text-foreground mt-1">
                                    {selectedPlan.dbName} Plan
                                </p>
                                <p className="text-2xl font-extrabold text-blue-500 mt-1">
                                    PKR {selectedPlan.price.toLocaleString()}
                                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                                </p>
                            </div>

                            {/* QR Code — actual JazzCash images */}
                            {QR_IMAGES[selectedPlan.dbName] && (
                                <div className="rounded-xl overflow-hidden border border-border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={QR_IMAGES[selectedPlan.dbName]}
                                        alt={`JazzCash QR Code — Rs. ${selectedPlan.price.toLocaleString()}`}
                                        className="w-full h-auto"
                                    />
                                </div>
                            )}

                            {/* Payment proof form */}
                            <div className="space-y-3">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                        📱 After scanning and paying, enter your transaction reference below and optionally paste a screenshot URL as proof.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Transaction Reference <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={transRef}
                                        onChange={(e) => setTransRef(e.target.value)}
                                        placeholder="e.g., TXN-2026-XXXX or JazzCash ID"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">Screenshot URL (optional proof)</Label>
                                    <Input
                                        value={screenshotUrl}
                                        onChange={(e) => setScreenshotUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Payment for Verification"}
                                    {!isSubmitting && <ArrowRight className="size-4 ml-1" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
