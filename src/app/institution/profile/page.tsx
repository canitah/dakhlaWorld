"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProfilePictureCropper } from "@/components/profile-picture-cropper";
import { Button } from "@/components/ui/button";
import { Input as ShadInput } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Alert,
    Spin,
    Progress,
    message,
} from "antd";
import {
    IdcardOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Building2,
    MapPin,
    Mail,
    Tag,
    FileText,
    Sparkles,
    AlertCircle,
    Save,
    Camera,
    Globe,
    Linkedin,
} from "lucide-react";

// ─── Mandatory fields ───
const MANDATORY_KEYS = ["name", "category", "city", "contact_email", "description"];

// ─── Wizard Steps ───
const CATEGORY_OPTIONS = [
    { value: "University", label: "University", desc: "Degree-granting higher education" },
    { value: "College", label: "College", desc: "Undergraduate programs" },
    { value: "Academy", label: "Academy", desc: "Skills & training programs" },
    { value: "Institute", label: "Institute", desc: "Specialized courses & certifications" },
    { value: "School", label: "School", desc: "Primary or secondary education" },
    { value: "Other", label: "Other", desc: "Online, vocational, etc." },
];

const STEPS = [
    { key: "name", label: "What's your institution's name?", icon: Building2, placeholder: "e.g., Lahore School of Economics", mandatory: true },
    { key: "category", label: "What type of institution are you?", icon: Tag, type: "select" as const, mandatory: true, options: CATEGORY_OPTIONS },
    { key: "city", label: "Where is your institution located?", icon: MapPin, placeholder: "e.g., Lahore", mandatory: true },
    { key: "contact_email", label: "What's the best contact email?", icon: Mail, placeholder: "admissions@example.com", mandatory: true },
    { key: "description", label: "Describe your institution briefly", icon: FileText, type: "textarea" as const, placeholder: "Tell students what makes your institution special...", mandatory: true },
    { key: "linkedin_url", label: "LinkedIn page URL (optional)", icon: Linkedin, placeholder: "https://linkedin.com/company/...", mandatory: false },
    { key: "facebook_url", label: "Facebook page URL (optional)", icon: Globe, placeholder: "https://facebook.com/...", mandatory: false },
    { key: "instagram_url", label: "Instagram page URL (optional)", icon: Globe, placeholder: "https://instagram.com/...", mandatory: false },
];

interface Profile {
    name: string;
    category: string | null;
    city: string | null;
    description: string | null;
    contact_email: string | null;
    status: string;
    profile_picture_url: string | null;
    linkedin_url: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
}

function isProfileComplete(p: Profile | null): boolean {
    if (!p) return false;
    for (const key of MANDATORY_KEYS) {
        const val = (p as unknown as Record<string, unknown>)[key];
        if (val === null || val === undefined || String(val).trim() === "") return false;
    }
    return true;
}

export default function InstitutionProfilePage() {
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
    const [wizardData, setWizardData] = useState<Record<string, string>>({
        name: "", category: "", city: "", contact_email: "", description: "",
        linkedin_url: "", facebook_url: "", instagram_url: "",
    });
    const [wizardError, setWizardError] = useState("");

    // Profile picture is always visible for completed profiles

    useEffect(() => { loadProfile(); }, []);

    async function loadProfile() {
        const res = await fetchWithAuth("/institutions/profile");
        if (res.ok) {
            const data = await res.json();
            setProfile(data.profile);
            const complete = isProfileComplete(data.profile);
            setProfileComplete(complete);
            if (data.profile) {
                const p = data.profile;
                setWizardData({
                    name: p.name || "",
                    category: p.category || "",
                    city: p.city || "",
                    contact_email: p.contact_email || "",
                    description: p.description || "",
                    linkedin_url: p.linkedin_url || "",
                    facebook_url: p.facebook_url || "",
                    instagram_url: p.instagram_url || "",
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
        const val = wizardData[currentStep.key];
        if (!currentStep.mandatory) return true;
        if (currentStep.key === "name") return val.length >= 2;
        if (currentStep.key === "contact_email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        return !!val;
    };

    const handleNext = () => {
        if (!canProceed()) {
            if (currentStep.key === "contact_email") setWizardError("Please enter a valid email");
            else if (currentStep.key === "name") setWizardError("Name must be at least 2 characters");
            else setWizardError("This field is required");
            return;
        }
        setWizardError("");
        if (isLastStep) { handleWizardSave(); return; }
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
            const res = await fetchWithAuth("/institutions/profile", {
                method: "PUT",
                body: JSON.stringify(wizardData),
            });
            if (res.ok) {
                if (!profileComplete) {
                    // First time completing — redirect to dashboard
                    message.success("Institution profile setup completed!");
                    router.replace("/institution");
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
            <DashboardLayout role="institution">
                <div className="flex items-center justify-center h-64">
                    <Spin size="large" />
                </div>
            </DashboardLayout>
        );
    }

    // ─── Always render step-by-step wizard ───
    const StepIcon = currentStep.icon;

    return (
        <DashboardLayout role="institution">
            <div className="w-full">
                {/* Title and Step Counter */}
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        {profileComplete ? "Institution Profile" : "Institution Profile Wizard"}
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

                {/* Status Banners */}
                {profileComplete && profile!.status === "pending" && (
                    <Alert
                        type="info"
                        showIcon
                        icon={<ClockCircleOutlined />}
                        className="mb-6"
                        message="Awaiting Admin Approval"
                        description="Your profile is complete. Our admin team will review and approve your institution shortly."
                    />
                )}
                {profileComplete && profile!.status === "rejected" && (
                    <Alert
                        type="error"
                        showIcon
                        icon={<CloseCircleOutlined />}
                        className="mb-6"
                        message="Registration Rejected"
                        description="Your institution registration was rejected. Please update your profile and re-apply."
                    />
                )}

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
                                <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-full">
                                    * Required
                                </span>
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
                            ) : "type" in currentStep && currentStep.type === "textarea" ? (
                                <textarea
                                    autoFocus
                                    placeholder={currentStep.placeholder}
                                    value={wizardData[currentStep.key]}
                                    onChange={(e) => { setWizardData({ ...wizardData, [currentStep.key]: e.target.value }); setWizardError(""); }}
                                    className={`w-full h-32 px-4 py-3 text-base rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${wizardError ? "border-red-500 ring-1 ring-red-500" : "border-border"}`}
                                />
                            ) : (
                                <ShadInput
                                    autoFocus
                                    type={currentStep.key === "contact_email" ? "email" : "text"}
                                    placeholder={currentStep.placeholder}
                                    value={wizardData[currentStep.key]}
                                    onChange={(e) => { setWizardData({ ...wizardData, [currentStep.key]: e.target.value }); setWizardError(""); }}
                                    className={`h-14 text-lg px-4 rounded-xl ${wizardError ? "border-red-500 ring-1 ring-red-500" : "border-border"}`}
                                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                                />
                            )}

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
