// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useAuthStore } from "@/store/auth-store";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "sonner";

// export default function LoginPage() {
//     const router = useRouter();
//     const { setAuth } = useAuthStore();
//     const [isLoading, setIsLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         email: "",
//         password: "",
//     });

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//             const res = await fetch("/api/auth/login", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(formData),
//             });

//             const data = await res.json();

//             if (!res.ok) {
//                 toast.error(data.error || "Login failed");
//                 return;
//             }

//             setAuth(data.user, data.accessToken);

//             // Store token in cookie for middleware
//             document.cookie = `access_token=${data.accessToken}; path=/; max-age=900; samesite=strict`;

//             toast.success("Welcome back!");
//             router.push(`/${data.user.role}`);
//         } catch {
//             toast.error("Something went wrong");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//             <Card className="w-full max-w-md shadow-xl border-0">
//                 <CardHeader className="text-center pb-2">
//                     <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg mb-4">
//                         G
//                     </div>
//                     <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
//                     <CardDescription>Sign in to your GAP account</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="email">Email</Label>
//                             <Input
//                                 id="email"
//                                 type="email"
//                                 placeholder="your@email.com"
//                                 value={formData.email}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, email: e.target.value })
//                                 }
//                                 required
//                             />
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="password">Password</Label>
//                             <Input
//                                 id="password"
//                                 type="password"
//                                 placeholder="••••••••"
//                                 value={formData.password}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, password: e.target.value })
//                                 }
//                                 required
//                             />
//                         </div>
//                         <Button
//                             type="submit"
//                             className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
//                             disabled={isLoading}
//                         >
//                             {isLoading ? "Signing in..." : "Sign In"}
//                         </Button>
//                     </form>
//                     <div className="mt-6 text-center text-sm text-muted-foreground">
//                         Don&apos;t have an account?{" "}
//                         <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
//                             Sign up
//                         </Link>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { message } from "antd";
import { ThemeLogo } from "@/components/theme-logo";

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                // If user hasn't verified email, redirect to verify-otp page
                if (res.status === 403 && data.requiresVerification) {
                    message.warning("You haven't verified your email yet. Please verify to login.");
                    router.push(`/verify-otp?userId=${data.userId}&email=${encodeURIComponent(data.email || '')}&reason=login_unverified`);
                    return;
                }
                message.error(data.error || "Login failed");
                return;
            }

            setAuth(data.user, data.accessToken);

            // Fetch full user data (including profile picture) before navigating
            try {
                const meRes = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${data.accessToken}` },
                });
                if (meRes.ok) {
                    const meData = await meRes.json();
                    const profilePicUrl =
                        meData.user.student_profile?.profile_picture_url ||
                        meData.user.institution_profile?.profile_picture_url ||
                        null;
                    const displayName =
                        meData.user.institution_profile?.name ||
                        meData.user.student_profile?.full_name ||
                        null;
                    setAuth(
                        { ...data.user, profile_picture_url: profilePicUrl, display_name: displayName },
                        data.accessToken
                    );
                }
            } catch {
                // Non-critical: profile pic will load on next refresh
            }

            // Store token in cookie for middleware
            document.cookie = `access_token=${data.accessToken}; path=/; max-age=900; samesite=strict`;

            message.success("Welcome back!");
            // Redirect institutions with incomplete profiles to dashboard (shows pending banner)
            if (data.user.role === "institution" && data.profileComplete === false) {
                router.push("/institution");
            }
            else if (data.user.role === "student") {
                router.push("/student/explore");
            }
            else {
                router.push(`/${data.user.role}`);
            }
        } catch {
            message.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <ThemeLogo className="h-16 w-auto object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to your Dakhla account</p>
                </div>

                <Card className="border border-border shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg
                                            className="h-5 w-5 text-muted-foreground"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        className="pl-10 h-11 border-border"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                        Password
                                    </Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-[#008cff] hover:text-[#0066cc] hover:underline font-medium"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg
                                            className="h-5 w-5 text-muted-foreground"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10 h-11 border-border"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required
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
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#008cff] hover:bg-[#0066cc] h-11 text-base font-medium shadow-sm"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/signup"
                                    className="text-[#008cff] font-semibold hover:text-[#0066cc] hover:underline"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        {/* <div className="mt-6 pt-6 border-t border-border">
                            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                <Link href="/terms" className="hover:text-foreground hover:underline">
                                    Terms of Service
                                </Link>
                                <span className="text-border">•</span>
                                <Link href="/privacy" className="hover:text-foreground hover:underline">
                                    Privacy Policy
                                </Link>
                                <span className="text-border">•</span>
                                <Link href="/help" className="hover:text-foreground hover:underline">
                                    Help Center
                                </Link>
                            </div>
                        </div> */}
                    </CardContent>
                </Card>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}