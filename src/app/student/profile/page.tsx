"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProfilePictureCropper } from "@/components/profile-picture-cropper";
import { Button } from "@/components/ui/button";
import { Input as ShadInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    message,
    Spin,
    Progress,
} from "antd";
import {
    IdcardOutlined,
} from "@ant-design/icons";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    User,
    MapPin,
    GraduationCap,
    BookOpen,
    Briefcase,
    DollarSign,
    Sparkles,
    Clock,
    Rocket,
    FileText,
    Users,
    AlertCircle,
    Save,
    Camera,
} from "lucide-react";

// ─── Mandatory fields that must be filled before the student can access other pages ───
const MANDATORY_KEYS = [
    "full_name",
    "student_type",
    "city",
    "age_range",
    "education_level",
    "experience_level",
    "preferred_field",
    "preferred_schedule",
    "budget_min",
    "budget_max",
];

// ─── Wizard Steps ───
const STEPS = [
    { key: "full_name", label: "What's your full name?", icon: User, placeholder: "Enter your full name", mandatory: true },
    {
        key: "student_type", label: "What type of student are you?", icon: GraduationCap, type: "select" as const, mandatory: true, options: [
            { value: "local", label: "Local Student", desc: "Studying within Pakistan" },
            { value: "international", label: "International Student", desc: "Coming from outside Pakistan" },
        ]
    },
    { key: "city", label: "Which city are you from?", icon: MapPin, placeholder: "e.g., Lahore, Karachi", mandatory: true },
    {
        key: "age_range", label: "What's your age range?", icon: Users, type: "select" as const, mandatory: true, options: [
            { value: "16-20", label: "16–20", desc: "High school or early college" },
            { value: "21-25", label: "21–25", desc: "College / University age" },
            { value: "26-30", label: "26–30", desc: "Early career" },
            { value: "31+", label: "31+", desc: "Mature learner" },
        ]
    },
    {
        key: "education_level", label: "What's your education level?", icon: GraduationCap, type: "select" as const, mandatory: true, options: [
            { value: "Matriculation", label: "Matriculation", desc: "Grade 10 / O-Levels" },
            { value: "Intermediate", label: "Intermediate", desc: "Grade 12 / A-Levels" },
            { value: "Bachelors", label: "Bachelor's", desc: "Undergraduate degree" },
            { value: "Masters", label: "Master's", desc: "Postgraduate degree" },
            { value: "PhD", label: "PhD", desc: "Doctoral degree" },
            { value: "Other", label: "Other", desc: "Diploma, Certificate, etc." },
        ]
    },
    {
        key: "experience_level", label: "What's your experience level?", icon: Briefcase, type: "select" as const, mandatory: true, options: [
            { value: "none", label: "No Experience", desc: "Just starting out" },
            { value: "beginner", label: "Beginner", desc: "Some basic knowledge" },
            { value: "intermediate", label: "Intermediate", desc: "Comfortable with fundamentals" },
            { value: "experienced", label: "Experienced", desc: "Strong background" },
        ]
    },
    { key: "preferred_field", label: "What field interests you most?", icon: BookOpen, placeholder: "e.g., Computer Science, Business, Arts", mandatory: true },
    { key: "intended_field", label: "Intended field of study (optional)", icon: BookOpen, placeholder: "e.g., Computer Science, Medicine", mandatory: false },
    { key: "learning_goal", label: "What's your learning goal? (optional)", icon: Rocket, placeholder: "e.g., Get a degree, learn new skills", mandatory: false },
    {
        key: "preferred_schedule", label: "What's your preferred study schedule?", icon: Clock, type: "select" as const, mandatory: true, options: [
            { value: "Full-time", label: "Full-time", desc: "Regular in-person classes" },
            { value: "Part-time", label: "Part-time", desc: "Flexible hours" },
            { value: "Remote", label: "Remote", desc: "100% online" },
            { value: "Hybrid", label: "Hybrid", desc: "Mix of online & in-person" },
        ]
    },
    { key: "budget", label: "What's your budget range?", icon: DollarSign, type: "budget" as const, mandatory: true },
    { key: "personal_statement", label: "Tell us about yourself (optional)", icon: FileText, type: "textarea" as const, placeholder: "Share your goals, interests, and what motivates you...", mandatory: false },
];

interface Profile {
    id: number;
    student_type: string | null;
    full_name: string | null;
    city: string | null;
    age_range: string | null;
    intended_field: string | null;
    personal_statement: string | null;
    education_level: string | null;
    experience_level: string | null;
    learning_goal: string | null;
    cv_url: string | null;
    profile_picture_url: string | null;
    preferred_schedule: string | null;
    budget_min: number | null;
    budget_max: number | null;
    preferred_field: string | null;
}

function isProfileComplete(p: Profile | null): boolean {
    if (!p) return false;
    for (const key of MANDATORY_KEYS) {
        const val = (p as unknown as Record<string, unknown>)[key];
        if (val === null || val === undefined || val === "") return false;
    }
    return true;
}

export default function StudentProfilePage() {
    const router = useRouter();
    const { fetchWithAuth } = useApi();
    const { setProfilePicture } = useAuthStore();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profileComplete, setProfileComplete] = useState(false);

    // Wizard state
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState<"forward" | "backward">("forward");
    const [wizardData, setWizardData] = useState<Record<string, string | number | null>>({
        full_name: "", student_type: "", city: "", age_range: "",
        education_level: "", experience_level: "", preferred_field: "",
        intended_field: "", learning_goal: "", preferred_schedule: "",
        budget_min: null, budget_max: null, personal_statement: "",
    });
    const [wizardError, setWizardError] = useState("");

    // Profile picture section toggle — removed, always shown for complete profiles

    useEffect(() => { loadProfile(); }, []);

    async function loadProfile() {
        const res = await fetchWithAuth("/students/profile");
        if (res.ok) {
            const data = await res.json();
            setProfile(data.profile);
            const complete = isProfileComplete(data.profile);
            setProfileComplete(complete);
            // Pre-fill wizard data from existing profile
            if (data.profile) {
                const p = data.profile;
                setWizardData({
                    full_name: p.full_name || "",
                    student_type: p.student_type || "",
                    city: p.city || "",
                    age_range: p.age_range || "",
                    education_level: p.education_level || "",
                    experience_level: p.experience_level || "",
                    preferred_field: p.preferred_field || "",
                    intended_field: p.intended_field || "",
                    learning_goal: p.learning_goal || "",
                    preferred_schedule: p.preferred_schedule || "",
                    budget_min: p.budget_min,
                    budget_max: p.budget_max,
                    personal_statement: p.personal_statement || "",
                });
            }
        }
        setIsLoading(false);
    }

    /* ═══════════ Wizard Handlers ═══════════ */

    const currentStep = STEPS[step];
    const isLastStep = step === STEPS.length - 1;
    const progressPercent = Math.round(((step + 1) / STEPS.length) * 100);

    const canProceed = () => {
        setWizardError("");
        const s = STEPS[step];
        if (!s.mandatory) return true;
        const key = s.key;
        if (key === "budget") {
            return wizardData.budget_min !== null && wizardData.budget_max !== null;
        }
        return !!wizardData[key];
    };

    const handleNext = () => {
        if (!canProceed()) {
            setWizardError("This field is required");
            return;
        }
        setWizardError("");
        if (isLastStep) {
            handleWizardSave();
            return;
        }
        setDirection("forward");
        setStep((s) => s + 1);
    };

    const handleBack = () => {
        setWizardError("");
        setDirection("backward");
        setStep((s) => Math.max(0, s - 1));
    };

    const handleWizardSave = async () => {
        setIsSaving(true);
        try {
            const payload: Record<string, unknown> = {
                full_name: wizardData.full_name || undefined,
                student_type: wizardData.student_type || undefined,
                city: wizardData.city || undefined,
                age_range: wizardData.age_range || undefined,
                education_level: wizardData.education_level || undefined,
                experience_level: wizardData.experience_level || undefined,
                preferred_field: wizardData.preferred_field || undefined,
                intended_field: wizardData.intended_field || undefined,
                learning_goal: wizardData.learning_goal || undefined,
                preferred_schedule: wizardData.preferred_schedule || undefined,
                personal_statement: wizardData.personal_statement || undefined,
                budget_min: wizardData.budget_min ? Number(wizardData.budget_min) : undefined,
                budget_max: wizardData.budget_max ? Number(wizardData.budget_max) : undefined,
            };

            const res = await fetchWithAuth("/students/profile", {
                method: "PUT",
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                if (!profileComplete) {
                    // First time completing — redirect to explore
                    message.success("Profile setup completed!");
                    router.replace("/student/explore");
                } else {
                    // Already completed — just save and stay
                    message.success("Profile updated successfully!");
                    setIsSaving(false);
                }
            } else {
                message.error("Failed to save profile. Please try again.");
                setIsSaving(false);
            }
        } catch {
            message.error("Something went wrong. Please try again.");
            setIsSaving(false);
        }
    };

    /* ═══════════ Render ═══════════ */

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-64">
                    <Spin size="large" />
                </div>
            </DashboardLayout>
        );
    }

    // ─── Always render step-by-step wizard ───
    const StepIcon = currentStep.icon;

    return (
        <DashboardLayout role="student">
            <div className="w-full">
                {/* Title and Step Counter */}
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        {profileComplete ? "My Profile" : "Student Profile Wizard"}
                    </h1>
                    <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                        Step {step + 1} of {STEPS.length}
                    </span>
                </div>

                {/* Progress Bar */}
                <Progress
                    percent={progressPercent}
                    showInfo={false}
                    strokeColor={{ from: '#3b82f6', to: '#6366f1' }}
                    trailColor="var(--border)"
                    size={["100%", 8]}
                    className="mb-6"
                />

                {/* Profile Picture Section — always visible for completed profiles */}
                {profileComplete && (
                    <div className="mb-6 p-6 rounded-2xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <IdcardOutlined className="text-blue-500" />
                            <span className="font-semibold text-foreground">Profile Picture</span>
                        </div>
                        <div className="flex justify-center">
                            <ProfilePictureCropper
                                currentImageUrl={profile!.profile_picture_url}
                                onUploadSuccess={(url) => {
                                    setProfile((prev) => prev ? { ...prev, profile_picture_url: url } : prev);
                                    setProfilePicture(url);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Step Content */}
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-full max-w-md">
                        <div
                            key={step}
                            className="animate-in fade-in duration-300"
                            style={{ animationName: direction === "forward" ? "slideInRight" : "slideInLeft" }}
                        >
                            {/* Step icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <StepIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            {/* Question + mandatory badge */}
                            <h2 className="text-xl md:text-2xl font-bold text-center text-foreground mb-2">
                                {currentStep.label}
                            </h2>
                            <div className="flex justify-center mb-6">
                                {currentStep.mandatory ? (
                                    <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-full">
                                        * Required
                                    </span>
                                ) : (
                                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                                        Optional
                                    </span>
                                )}
                            </div>

                            {/* Input */}
                            {"type" in currentStep && currentStep.type === "select" ? (
                                <div className="space-y-3">
                                    {currentStep.options.map((opt) => (
                                        <Card
                                            key={opt.value}
                                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${wizardData[currentStep.key] === opt.value
                                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-md ring-1 ring-blue-500"
                                                : wizardError ? "border-red-300 dark:border-red-700 hover:border-red-400" : "border-border hover:border-blue-300 dark:hover:border-blue-700"
                                                }`}
                                            onClick={() => { setWizardData({ ...wizardData, [currentStep.key]: opt.value }); setWizardError(""); }}
                                        >
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${wizardData[currentStep.key] === opt.value
                                                    ? "border-blue-500 bg-blue-500"
                                                    : "border-muted-foreground/30"
                                                    }`}>
                                                    {wizardData[currentStep.key] === opt.value && (
                                                        <Check className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{opt.label}</p>
                                                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : "type" in currentStep && currentStep.type === "budget" ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Minimum (PKR) <span className="text-red-500">*</span></Label>
                                            <ShadInput
                                                type="number"
                                                placeholder="e.g., 50000"
                                                value={wizardData.budget_min ?? ""}
                                                onChange={(e) => { setWizardData({ ...wizardData, budget_min: e.target.value ? parseInt(e.target.value) : null }); setWizardError(""); }}
                                                className={`h-12 text-lg ${wizardError ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Maximum (PKR) <span className="text-red-500">*</span></Label>
                                            <ShadInput
                                                type="number"
                                                placeholder="e.g., 500000"
                                                value={wizardData.budget_max ?? ""}
                                                onChange={(e) => { setWizardData({ ...wizardData, budget_max: e.target.value ? parseInt(e.target.value) : null }); setWizardError(""); }}
                                                className={`h-12 text-lg ${wizardError ? "border-red-500 ring-1 ring-red-500" : ""}`}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center">
                                        This helps us show programs within your budget.
                                    </p>
                                </div>
                            ) : "type" in currentStep && currentStep.type === "textarea" ? (
                                <div className="space-y-2">
                                    <textarea
                                        autoFocus
                                        placeholder={"placeholder" in currentStep ? currentStep.placeholder : ""}
                                        value={(wizardData[currentStep.key] as string) || ""}
                                        onChange={(e) => setWizardData({ ...wizardData, [currentStep.key]: e.target.value })}
                                        className="w-full h-32 px-4 py-3 text-base rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            ) : (
                                <ShadInput
                                    autoFocus
                                    placeholder={"placeholder" in currentStep ? currentStep.placeholder : ""}
                                    value={(wizardData[currentStep.key] as string) || ""}
                                    onChange={(e) => { setWizardData({ ...wizardData, [currentStep.key]: e.target.value }); setWizardError(""); }}
                                    className={`h-14 text-lg px-4 rounded-xl ${wizardError ? "border-red-500 ring-1 ring-red-500" : "border-border"}`}
                                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                                />
                            )}

                            {/* Error message */}
                            {wizardError && (
                                <div className="flex items-center gap-2 mt-3 text-red-500 text-sm font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    {wizardError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer navigation */}
                <div className="pt-6 mt-4 border-t border-border">
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="ghost" onClick={handleBack} disabled={step === 0} className="gap-2">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={isSaving}
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-full shadow-md shadow-blue-600/20"
                        >
                            {isSaving ? "Saving..." : isLastStep ? (
                                profileComplete ? (
                                    <><Save className="w-4 h-4" /> Save Profile</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Complete Setup</>
                                )
                            ) : (
                                <>Next <ChevronRight className="w-4 h-4" /></>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes slideInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
                @keyframes slideInLeft  { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
            `}</style>
        </DashboardLayout>
    );
}
