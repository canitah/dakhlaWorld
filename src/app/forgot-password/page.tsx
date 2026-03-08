"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { message } from "antd";
import { ThemeLogo } from "@/components/theme-logo";

/* ═══════════════════════════════════════════════════
   SVG Icons
   ═══════════════════════════════════════════════════ */
const MailIcon = () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const LockIcon = () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);
const ShieldIcon = () => (
    <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);
const CheckCircleIcon = () => (
    <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

/* ═══════════════════════════════════════════════════
   Spinner
   ═══════════════════════════════════════════════════ */
const Spinner = () => (
    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */
type Step = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Cooldown timer for resend
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    /* ─── Step 1: Send OTP ───────────────────────── */
    const handleSendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!email.trim()) return;
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                message.error(data.error || "Something went wrong");
                return;
            }
            message.success("Verification code sent to your email!");
            setStep("otp");
            setCooldown(60);
            // Focus first OTP input
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch {
            message.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    /* ─── OTP Input Handling ─────────────────────── */
    const handleOtpChange = useCallback((index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    }, [otp]);

    const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    }, [otp]);

    const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(""));
            otpRefs.current[5]?.focus();
        }
    }, []);

    /* ─── Step 2 → 3: Verify & set step ──────────── */
    const handleVerifyOtp = () => {
        const code = otp.join("");
        if (code.length < 6) {
            message.warning("Please enter the complete 6-digit code");
            return;
        }
        setStep("password");
    };

    /* ─── Step 3: Reset Password ─────────────────── */
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            message.warning("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            message.warning("Passwords don't match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    code: otp.join(""),
                    password,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                message.error(data.error || "Failed to reset password");
                // If OTP expired, go back to email step
                if (data.error?.includes("expired")) {
                    setStep("email");
                    setOtp(["", "", "", "", "", ""]);
                }
                return;
            }
            message.success("Password reset successfully!");
            setStep("success");
        } catch {
            message.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    /* ─── Progress Steps ─────────────────────────── */
    const stepIndex = step === "email" ? 0 : step === "otp" ? 1 : step === "password" ? 2 : 3;
    const steps = [
        { label: "Email", done: stepIndex > 0 },
        { label: "Verify", done: stepIndex > 1 },
        { label: "Reset", done: stepIndex > 2 },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <ThemeLogo className="h-16 w-auto object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {step === "email" && "Forgot Password?"}
                        {step === "otp" && "Verify Your Email"}
                        {step === "password" && "Create New Password"}
                        {step === "success" && "All Done!"}
                    </h1>
                    <p className="text-muted-foreground">
                        {step === "email" && "No worries, we'll send you a verification code"}
                        {step === "otp" && `Enter the 6-digit code sent to ${email}`}
                        {step === "password" && "Choose a strong password for your account"}
                        {step === "success" && "Your password has been reset successfully"}
                    </p>
                </div>

                {/* Step Progress Bar */}
                {step !== "success" && (
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {steps.map((s, i) => (
                            <div key={s.label} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i === stepIndex
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-110"
                                    : s.done
                                        ? "bg-emerald-500 text-white"
                                        : "bg-muted text-muted-foreground"
                                    }`}>
                                    {s.done ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-12 h-1 rounded-full transition-colors duration-300 ${s.done ? "bg-emerald-500" : "bg-muted"
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <Card className="border border-border shadow-sm overflow-hidden">
                    <CardContent className="pt-6 pb-8">
                        {/* ═══ STEP 1: EMAIL ═══ */}
                        {step === "email" && (
                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                        <ShieldIcon />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email" className="text-sm font-medium text-foreground">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                            <MailIcon />
                                        </div>
                                        <Input
                                            id="reset-email"
                                            type="email"
                                            placeholder="your@email.com"
                                            className="pl-10 h-11 border-border"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium shadow-sm cursor-pointer"
                                    disabled={isLoading || !email.trim()}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2"><Spinner />Sending...</span>
                                    ) : (
                                        "Send Verification Code"
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* ═══ STEP 2: OTP ═══ */}
                        {step === "otp" && (
                            <div className="space-y-6">
                                <div className="flex justify-center mb-2">
                                    <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* OTP Input Grid */}
                                <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => { otpRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 
                                                bg-background text-foreground
                                                outline-none transition-all duration-200
                                                ${digit
                                                    ? "border-blue-500 shadow-sm shadow-blue-500/20"
                                                    : "border-border hover:border-blue-300 dark:hover:border-blue-700"
                                                }
                                                focus:border-blue-500 focus:shadow-md focus:shadow-blue-500/20
                                            `}
                                        />
                                    ))}
                                </div>

                                <Button
                                    onClick={handleVerifyOtp}
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium shadow-sm cursor-pointer"
                                    disabled={otp.join("").length < 6}
                                >
                                    Verify Code
                                </Button>

                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Didn&apos;t receive the code?{" "}
                                        {cooldown > 0 ? (
                                            <span className="text-muted-foreground font-medium">
                                                Resend in {cooldown}s
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleSendOtp()}
                                                className="text-blue-600 font-semibold hover:underline cursor-pointer"
                                                disabled={isLoading}
                                            >
                                                Resend Code
                                            </button>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ═══ STEP 3: NEW PASSWORD ═══ */}
                        {step === "password" && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="flex justify-center mb-4">
                                    <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                            <LockIcon />
                                        </div>
                                        <Input
                                            id="new-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            className="pl-10 pr-10 h-11 border-border"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    {/* Password strength indicator */}
                                    {password && (
                                        <div className="flex gap-1.5 mt-2">
                                            {[1, 2, 3, 4].map((level) => {
                                                const strength = password.length >= 12 ? 4 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1;
                                                return (
                                                    <div
                                                        key={level}
                                                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= strength
                                                            ? strength <= 1 ? "bg-red-500"
                                                                : strength === 2 ? "bg-amber-500"
                                                                    : strength === 3 ? "bg-blue-500"
                                                                        : "bg-emerald-500"
                                                            : "bg-muted"
                                                            }`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                            <LockIcon />
                                        </div>
                                        <Input
                                            id="confirm-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            className="pl-10 h-11 border-border"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            Passwords don&apos;t match
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium shadow-sm cursor-pointer"
                                    disabled={isLoading || password.length < 6 || password !== confirmPassword}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2"><Spinner />Resetting...</span>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* ═══ STEP 4: SUCCESS ═══ */}
                        {step === "success" && (
                            <div className="text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
                                        <CheckCircleIcon />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-base text-muted-foreground">
                                        Your password has been updated. You can now sign in with your new password.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => router.push("/login")}
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium shadow-sm cursor-pointer"
                                >
                                    Back to Sign In
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer links */}
                <div className="mt-6 text-center space-y-3">
                    {step !== "success" && (
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to sign in
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
