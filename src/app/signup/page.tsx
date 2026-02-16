"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function SignupPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "student" as "student" | "institution",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email || undefined,
                    phone: formData.phone || undefined,
                    password: formData.password,
                    role: formData.role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Signup failed");
                return;
            }

            setAuth(data.user, data.accessToken);
            document.cookie = `access_token=${data.accessToken}; path=/; max-age=900; samesite=strict`;

            toast.success("Account created! Please verify your email.");

            // Send OTP if email provided
            if (formData.email) {
                await fetch("/api/auth/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email, type: "signup" }),
                });
                router.push(`/verify-otp?userId=${data.user.id}`);
            } else {
                router.push(`/${data.user.role}`);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg mb-4">
                        G
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>Join GAP and start your journey</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selector */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                            <button
                                type="button"
                                className={`py-2.5 text-sm font-medium rounded-md transition-all ${formData.role === "student"
                                        ? "bg-white text-blue-700 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                                onClick={() => setFormData({ ...formData, role: "student" })}
                            >
                                🎓 Student
                            </button>
                            <button
                                type="button"
                                className={`py-2.5 text-sm font-medium rounded-md transition-all ${formData.role === "institution"
                                        ? "bg-white text-blue-700 shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                                onClick={() => setFormData({ ...formData, role: "institution" })}
                            >
                                🏫 Institution
                            </button>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (optional)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+92 300 1234567"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min 8 characters"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                }
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
