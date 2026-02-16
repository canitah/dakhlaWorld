"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Plan {
    id: number;
    name: string;
    price_pkr: number;
    features_json: string | null;
}

interface PaymentReq {
    id: number;
    status: string;
    transaction_ref: string | null;
    screenshot_url: string | null;
    created_at: string;
    plan: Plan;
}

export default function InstitutionBillingPage() {
    const { fetchWithAuth } = useApi();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [requests, setRequests] = useState<PaymentReq[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [transRef, setTransRef] = useState("");
    const [screenshotUrl, setScreenshotUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const res = await fetchWithAuth("/billing");
        if (res.ok) {
            const data = await res.json();
            setPlans(data.plans);
            setRequests(data.requests);
        }
        setIsLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan) return;
        setIsSubmitting(true);

        const res = await fetchWithAuth("/billing", {
            method: "POST",
            body: JSON.stringify({
                plan_id: selectedPlan,
                transaction_ref: transRef || undefined,
                screenshot_url: screenshotUrl || undefined,
            }),
        });

        if (res.ok) {
            toast.success("Payment request submitted for verification");
            setSelectedPlan(null);
            setTransRef("");
            setScreenshotUrl("");
            loadData();
        } else {
            const data = await res.json();
            toast.error(data.error);
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <DashboardLayout role="institution">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="institution">
            <h1 className="text-2xl font-bold mb-6">Billing & Plans</h1>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`cursor-pointer transition-all ${selectedPlan === plan.id
                                ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                                : "hover:shadow-md"
                            } ${plan.name === "Featured" ? "border-amber-300" : ""}`}
                        onClick={() => setSelectedPlan(plan.id)}
                    >
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-lg">
                                {plan.name === "Featured" && "⭐ "}
                                {plan.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-3xl font-bold text-blue-700 mb-2">
                                PKR {plan.price_pkr.toLocaleString()}
                            </p>
                            {plan.features_json && (
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    {JSON.parse(plan.features_json).map((f: string, i: number) => (
                                        <li key={i}>✓ {f}</li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Payment Form */}
            {selectedPlan && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Submit Payment Proof</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-700 font-medium">
                                📱 Scan the QR code or transfer to our bank account and paste your transaction reference & screenshot URL below.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Transaction Reference</Label>
                                <Input
                                    value={transRef}
                                    onChange={(e) => setTransRef(e.target.value)}
                                    placeholder="e.g., TXN-2026-XXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Screenshot URL (proof of payment)</Label>
                                <Input
                                    value={screenshotUrl}
                                    onChange={(e) => setScreenshotUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit for Verification"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Payment History */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <p className="text-center py-6 text-muted-foreground">No payment requests yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Plan</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Amount</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Reference</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((req) => (
                                        <tr key={req.id} className="border-b last:border-0">
                                            <td className="py-3 text-sm font-medium">{req.plan.name}</td>
                                            <td className="py-3 text-sm">PKR {req.plan.price_pkr.toLocaleString()}</td>
                                            <td className="py-3 text-sm text-muted-foreground">{req.transaction_ref || "—"}</td>
                                            <td className="py-3"><StatusBadge status={req.status} /></td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
