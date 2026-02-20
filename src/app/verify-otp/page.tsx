"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { message } from "antd";

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: Number(userId), code: otp }),
            });

            const data = await res.json();

            if (!res.ok) {
                message.error(data.error || "Verification failed");
                return;
            }

            message.success("Email verified successfully!");
            router.push("/login");
        } catch {
            message.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        message.info("Resending OTP...");
        // Would need email from context; for now just redirect
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl mb-4">
                        ✉️
                    </div>
                    <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code sent to your email address
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                            maxLength={6}
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? "Verifying..." : "Verify Email"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleResend}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Didn&apos;t receive code? Resend
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
