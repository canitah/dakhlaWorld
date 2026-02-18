// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useAuthStore } from "@/store/auth-store";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { toast } from "sonner";

// export default function SignupPage() {
//     const router = useRouter();
//     const { setAuth } = useAuthStore();
//     const [isLoading, setIsLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         email: "",
//         phone: "",
//         password: "",
//         confirmPassword: "",
//         role: "student" as "student" | "institution",
//     });

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);

//         if (formData.password !== formData.confirmPassword) {
//             toast.error("Passwords do not match");
//             setIsLoading(false);
//             return;
//         }

//         try {
//             const res = await fetch("/api/auth/signup", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     email: formData.email || undefined,
//                     phone: formData.phone || undefined,
//                     password: formData.password,
//                     role: formData.role,
//                 }),
//             });

//             const data = await res.json();

//             if (!res.ok) {
//                 toast.error(data.error || "Signup failed");
//                 return;
//             }

//             setAuth(data.user, data.accessToken);
//             document.cookie = `access_token=${data.accessToken}; path=/; max-age=900; samesite=strict`;

//             toast.success("Account created! Please verify your email.");

//             // Send OTP if email provided
//             if (formData.email) {
//                 await fetch("/api/auth/send-otp", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ email: formData.email, type: "signup" }),
//                 });
//                 router.push(`/verify-otp?userId=${data.user.id}`);
//             } else {
//                 router.push(`/${data.user.role}`);
//             }
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
//                     <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
//                     <CardDescription>Join GAP and start your journey</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         {/* Role Selector */}
//                         <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
//                             <button
//                                 type="button"
//                                 className={`py-2.5 text-sm font-medium rounded-md transition-all ${formData.role === "student"
//                                         ? "bg-white text-blue-700 shadow-sm"
//                                         : "text-gray-600 hover:text-gray-900"
//                                     }`}
//                                 onClick={() => setFormData({ ...formData, role: "student" })}
//                             >
//                                 🎓 Student
//                             </button>
//                             <button
//                                 type="button"
//                                 className={`py-2.5 text-sm font-medium rounded-md transition-all ${formData.role === "institution"
//                                         ? "bg-white text-blue-700 shadow-sm"
//                                         : "text-gray-600 hover:text-gray-900"
//                                     }`}
//                                 onClick={() => setFormData({ ...formData, role: "institution" })}
//                             >
//                                 🏫 Institution
//                             </button>
//                         </div>

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
//                             />
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="phone">Phone (optional)</Label>
//                             <Input
//                                 id="phone"
//                                 type="tel"
//                                 placeholder="+92 300 1234567"
//                                 value={formData.phone}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, phone: e.target.value })
//                                 }
//                             />
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="password">Password</Label>
//                             <Input
//                                 id="password"
//                                 type="password"
//                                 placeholder="Min 8 characters"
//                                 value={formData.password}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, password: e.target.value })
//                                 }
//                                 required
//                                 minLength={8}
//                             />
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="confirmPassword">Confirm Password</Label>
//                             <Input
//                                 id="confirmPassword"
//                                 type="password"
//                                 placeholder="Re-enter password"
//                                 value={formData.confirmPassword}
//                                 onChange={(e) =>
//                                     setFormData({ ...formData, confirmPassword: e.target.value })
//                                 }
//                                 required
//                             />
//                         </div>

//                         <Button
//                             type="submit"
//                             className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
//                             disabled={isLoading}
//                         >
//                             {isLoading ? "Creating account..." : "Create Account"}
//                         </Button>
//                     </form>
//                     <div className="mt-6 text-center text-sm text-muted-foreground">
//                         Already have an account?{" "}
//                         <Link href="/login" className="text-blue-600 font-semibold hover:underline">
//                             Sign in
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 mb-4">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
                    <p className="text-muted-foreground">Join GAP and start your journey</p>
                </div>

                <Card className="border border-border shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Role Selector */}
                            <div>
                                <Label className="text-sm font-medium text-foreground mb-3 block">
                                    I am a
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${formData.role === "student"
                                                ? "border-blue-600 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                                : "border-border bg-card text-foreground hover:border-muted-foreground"
                                            }`}
                                        onClick={() =>
                                            setFormData({ ...formData, role: "student" })
                                        }
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        <span className="font-medium">Student</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${formData.role === "institution"
                                                ? "border-blue-600 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                                : "border-border bg-card text-foreground hover:border-muted-foreground"
                                            }`}
                                        onClick={() =>
                                            setFormData({ ...formData, role: "institution" })
                                        }
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                        <span className="font-medium">Institution</span>
                                    </button>
                                </div>
                            </div>

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
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                                    Phone Number <span className="text-muted-foreground">(optional)</span>
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
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+92 300 1234567"
                                        className="pl-10 h-11 border-border"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Password
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
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Min 8 characters"
                                        className="pl-10 h-11 border-border"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required
                                        minLength={8}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters long
                                </p>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Confirm Password
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
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                    </div>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter password"
                                        className="pl-10 h-11 border-border"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium shadow-sm"
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
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs text-center text-muted-foreground">
                                By creating an account, you agree to our{" "}
                                <Link href="/terms" className="text-blue-600 hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-blue-600 hover:underline">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
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