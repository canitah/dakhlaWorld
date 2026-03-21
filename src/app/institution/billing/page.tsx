"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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
    Upload,
    FileText,
    ImageIcon,
} from "lucide-react";

// --- Interfaces ---
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

// --- Constants ---
const JAZZCASH_ACCOUNT = "03001234567";

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

const FEATURE_ROWS = [
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

// --- Sub-components ---
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

export default function InstitutionBillingPage() {
    const { fetchWithAuth } = useApi();
    const router = useRouter();
    const [dbPlans, setDbPlans] = useState<DbPlan[]>([]);
    const [requests, setRequests] = useState<PaymentReq[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<{ id: number; name: string; price_pkr: number } | null>(null);
    const [autoRenew, setAutoRenew] = useState(true);
    const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
    const [togglingAutoRenew, setTogglingAutoRenew] = useState(false);
    
    // Payment dialog state
    const [selectedPlan, setSelectedPlan] = useState<PlanDef | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [transRef, setTransRef] = useState("");
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const screenshotInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetchWithAuth("/billing");
            if (res.ok) {
                const data = await res.json();
                setDbPlans(data.plans || []);
                setRequests(data.requests || []);
                setCurrentPlan(data.current_plan || null);
                setAutoRenew(data.auto_renew ?? true);
                setPlanExpiresAt(data.plan_expires_at || null);
            }
        } catch (err) { console.error(err); }
        setIsLoading(false);
    }

    const handleSelectPlan = (plan: PlanDef) => {
        if (plan.price === 0) return;
        setSelectedPlan(plan);
        setShowDialog(true);
        setTransRef("");
        setScreenshotFile(null);
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
        let screenshotUrl: string | undefined;

        if (screenshotFile) {
            try {
                const formData = new FormData();
                formData.append("file", screenshotFile);
                formData.append("folder", "gap/payment-screenshots");
                const uploadRes = await fetchWithAuth("/upload", { method: "POST", body: formData });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    screenshotUrl = uploadData.url;
                }
            } catch (err) { console.error(err); }
        }

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
            {/* Header */}
            <div className="mb-8 px-1">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <CreditCard className="size-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Institution Pricing Plans</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">Select a plan to boost your institution's visibility</p>
                    </div>
                </div>
            </div>

            {/* Plan Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
                {PLANS.map((plan) => (
                    <Card key={plan.name} className={`relative overflow-hidden transition-all hover:shadow-md ${plan.badge ? "ring-2 ring-amber-500/50" : ""}`}>
                        <div className={`absolute inset-x-0 top-0 h-1`} style={{ 
                            background: plan.name === "Starter" ? "linear-gradient(to right, #10b981, #34d399)" : 
                                        plan.name === "Growth" ? "linear-gradient(to right, #3b82f6, #60a5fa)" : 
                                        plan.name === "Pro" ? "linear-gradient(to right, #8b5cf6, #a78bfa)" : 
                                        "linear-gradient(to right, #f59e0b, #f97316)" 
                        }} />
                        
                        {plan.badge && (
                            <div className="absolute top-3 right-3">
                                <Badge className="bg-amber-500 text-white border-0 text-[10px] font-bold uppercase">{plan.badge}</Badge>
                            </div>
                        )}

                        <CardContent className="pt-6 pb-5 px-5 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-xl ${plan.iconBg}`}>{plan.icon}</div>
                                <div>
                                    <h3 className="text-base font-bold">{plan.name}</h3>
                                    <p className="text-[10px] text-muted-foreground">{plan.price === 0 ? "Free forever" : "per month"}</p>
                                </div>
                            </div>

                            <div className="mb-5">
                                <div className="flex items-baseline gap-1">
                                    {plan.price === 0 ? <span className="text-2xl font-extrabold">Free</span> : (
                                        <>
                                            <span className="text-xs font-medium text-muted-foreground">PKR</span>
                                            <span className={`text-2xl font-extrabold ${plan.color}`}>{plan.price.toLocaleString()}</span>
                                            <span className="text-xs text-muted-foreground">/mo</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Separator className="mb-4" />

                            <div className="space-y-2.5 mb-6">
                                {FEATURE_ROWS.slice(0, 5).map((row) => {
                                    const val = plan.features[row.key];
                                    const isIncluded = val === true || (typeof val === "string" && val !== "false");
                                    return (
                                        <div key={row.key} className="flex items-center gap-2.5 text-xs">
                                            {isIncluded ? <CheckCircleFilled className="text-emerald-500" /> : <CloseCircleFilled className="text-muted-foreground/30" />}
                                            <span className={isIncluded ? "text-foreground font-medium" : "text-muted-foreground/60"}>
                                                {row.label} {typeof val === "string" && <span className="text-muted-foreground ml-1 text-[10px]">({val})</span>}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-auto">
                                {(() => {
                                    const isCurrentPlan = currentPlan?.name === plan.dbName;
                                    if (isCurrentPlan) return <Button variant="outline" disabled className="w-full text-xs h-9">✓ Current Plan</Button>;
                                    if (plan.price === 0) return <Button variant="outline" disabled className="w-full text-xs h-9">Basic Plan</Button>;
                                    return (
                                        <Button className={`w-full text-xs h-9 text-white ${plan.btnClass}`} onClick={() => handleSelectPlan(plan)}>
                                            {currentPlan ? "Upgrade" : "Select Plan"} <ArrowRight className="size-3 ml-1" />
                                        </Button>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Active Plan Info */}
            {currentPlan && (
                <Card className="mb-8 border-blue-100 bg-blue-50/30">
                    <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-blue-200 shadow-lg">
                                    <Shield className="size-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Plan</p>
                                    <p className="text-base font-bold">{currentPlan.name}</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:items-end">
                                <p className="text-xs font-medium">{autoRenew ? "Auto-renews" : "Expires"} on:</p>
                                <p className="text-sm font-bold">{planExpiresAt ? new Date(planExpiresAt).toLocaleDateString() : "—"}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-blue-100 self-start sm:self-center">
                                <span className="text-xs font-bold px-1">Auto-Renew</span>
                                <button
                                    onClick={async () => {
                                        setTogglingAutoRenew(true);
                                        try {
                                            const res = await fetchWithAuth("/billing/auto-renew", { method: "PUT", body: JSON.stringify({ auto_renew: !autoRenew }) });
                                            if (res.ok) { setAutoRenew(!autoRenew); message.success(autoRenew ? "Disabled" : "Enabled"); }
                                        } catch { /* ignore */ }
                                        setTogglingAutoRenew(false);
                                    }}
                                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${autoRenew ? "bg-blue-600" : "bg-gray-300"}`}
                                >
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoRenew ? "translate-x-6" : "translate-x-0.5"}`} />
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* History Table */}
            <Card className="rounded-2xl overflow-hidden border-muted/60">
                <CardHeader className="bg-muted/30 py-4">
                    <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <CardTitle className="text-base">Payment History</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        {requests.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">No payment history found.</div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/20">
                                    <TableRow>
                                        <TableHead className="text-xs font-bold uppercase">Plan</TableHead>
                                        <TableHead className="text-xs font-bold uppercase">Amount</TableHead>
                                        <TableHead className="text-xs font-bold uppercase">Status</TableHead>
                                        <TableHead className="text-xs font-bold uppercase text-right">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="text-sm font-bold">{req.plan.name}</TableCell>
                                            <TableCell className="text-sm">PKR {req.plan.price_pkr.toLocaleString()}</TableCell>
                                            <TableCell><StatusBadge status={req.status} /></TableCell>
                                            <TableCell className="text-xs text-right text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Payment Dialog */}
            <Dialog open={showDialog} onOpenChange={(open) => { if (!open) { setShowDialog(false); setSelectedPlan(null); } }}>
                <DialogContent className="max-w-[95vw] sm:max-w-[500px] p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
                    <div className="max-h-[90vh] overflow-y-auto bg-card">
                        <div className="bg-blue-600 p-6 text-white">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <CreditCard className="size-5" /> Confirm Payment
                            </h2>
                            <p className="text-blue-100 text-xs mt-1">Upgrade to {selectedPlan?.dbName} Plan</p>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="bg-accent/50 p-4 rounded-2xl text-center border border-dashed border-blue-200">
                                <p className="text-lg font-bold">Total: PKR {selectedPlan?.price.toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Pay via JazzCash to {JAZZCASH_ACCOUNT}</p>
                            </div>

                            {selectedPlan && QR_IMAGES[selectedPlan.dbName] && (
                                <div className="rounded-2xl border overflow-hidden p-2 bg-white">
                                    <img src={QR_IMAGES[selectedPlan.dbName]} alt="QR" className="w-full h-auto" />
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Transaction Reference *</Label>
                                    <Input value={transRef} onChange={(e) => setTransRef(e.target.value)} placeholder="Enter JazzCash Transaction ID" className="h-11 rounded-xl" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Screenshot (Optional)</Label>
                                    <div className="border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => screenshotInputRef.current?.click()}>
                                        <input ref={screenshotInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setScreenshotFile(e.target.files[0]); }} />
                                        {screenshotFile ? (
                                            <div className="flex items-center justify-between text-left">
                                                <div className="flex items-center gap-2">
                                                    <ImageIcon className="size-5 text-blue-500" />
                                                    <span className="text-xs font-bold truncate max-w-[150px]">{screenshotFile.name}</span>
                                                </div>
                                                <X className="size-4 text-red-500" onClick={(e) => { e.stopPropagation(); setScreenshotFile(null); }} />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                                <Upload className="size-5" />
                                                <span className="text-xs font-medium">Click to upload proof</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Submit Payment"} <ArrowRight className="size-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}