"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "antd";
import { message } from "antd";
import { ThemeLogo } from "@/components/theme-logo";
import {
    Mail,
    ShieldCheck,
    ArrowLeft,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Loader2,
} from "lucide-react";

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const reason = searchParams.get("reason");
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(30);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleInputChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "Enter" && otpCode.length === 6) {
            handleVerify();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasteData.length > 0) {
            const newOtp = [...otp];
            for (let i = 0; i < pasteData.length; i++) {
                newOtp[i] = pasteData[i];
            }
            setOtp(newOtp);
            const focusIndex = Math.min(pasteData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const otpCode = otp.join("");

    const handleVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (otpCode.length !== 6) return;
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: Number(userId), code: otpCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                message.error(data.error || "Verification failed");
                // Shake the inputs on error
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
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

    const handleResend = useCallback(async () => {
        if (!email || resendCooldown > 0) return;
        setIsResending(true);
        try {
            const res = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: "signup" }),
            });
            const data = await res.json();
            if (res.ok) {
                message.success("New OTP sent! Previous code has been expired.");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
                setResendCooldown(30);
            } else {
                message.error(data.error || "Failed to resend OTP");
            }
        } catch {
            message.error("Failed to resend OTP. Please try again.");
        } finally {
            setIsResending(false);
        }
    }, [email, resendCooldown]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <ThemeLogo className="h-16 w-auto object-contain" />
                    </div>

                    {/* Gradient Icon */}
                    <div className="flex justify-center mb-5">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/25 ring-4 ring-blue-500/10">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-foreground mb-2">Verify Your Email</h1>
                    <p className="text-muted-foreground">
                        {email ? (
                            <>We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span></>
                        ) : (
                            "Enter the 6-digit code sent to your email"
                        )}
                    </p>
                </div>

                {/* Alert Banners */}
                {reason === "login_unverified" && (
                    <Alert
                        type="warning"
                        showIcon
                        icon={<AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />}
                        message={<span className="font-semibold">Email Not Verified</span>}
                        description="You haven't verified your email yet. Please enter the verification code to continue logging in."
                        className="mb-4 rounded-xl border-amber-200 dark:border-amber-800"
                    />
                )}
                {reason === "unverified" && (
                    <Alert
                        type="error"
                        showIcon
                        icon={<AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />}
                        message={<span className="font-semibold">Verification Required</span>}
                        description="Please verify your email to access the platform. Enter the code below."
                        className="mb-4 rounded-xl"
                    />
                )}

                <Card className="border border-border shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleVerify} className="space-y-6">
                            {/* OTP Input Grid */}
                            <div>
                                <div className="flex items-center gap-1 mb-3">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">Verification Code</span>
                                </div>
                                <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background text-foreground outline-none transition-all duration-200
                                                ${digit
                                                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-sm shadow-blue-500/10"
                                                    : "border-border hover:border-blue-300 dark:hover:border-blue-700"
                                                }
                                                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-sm focus:shadow-blue-500/10
                                            `}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-2.5">
                                    Paste your code or type it digit by digit
                                </p>
                            </div>

                            {/* Verify Button */}
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium shadow-sm gap-2"
                                disabled={isLoading || otpCode.length !== 6}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Verify Email
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Resend Section */}
                        <div className="mt-5 pt-5 border-t border-border">
                            <div className="flex flex-col items-center gap-2">
                                {resendCooldown > 0 ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>Resend code in <span className="font-bold text-foreground tabular-nums">{resendCooldown}s</span></span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleResend}
                                        disabled={isResending || !email}
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                                        {isResending ? "Sending new code..." : "Didn\u0027t receive code? Resend"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {!email && (
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800">
                                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    Email not available. Please go back and sign up again.
                                </p>
                            </div>
                        )}

                        {/* Footer Links */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                <Link href="/login" className="hover:text-foreground hover:underline">
                                    Back to Login
                                </Link>
                                <span className="text-border">•</span>
                                <Link href="/signup" className="hover:text-foreground hover:underline">
                                    Sign Up
                                </Link>
                                <span className="text-border">•</span>
                                <Link href="/help" className="hover:text-foreground hover:underline">
                                    Help Center
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        }>
            <VerifyOtpContent />
        </Suspense>
    );
}
