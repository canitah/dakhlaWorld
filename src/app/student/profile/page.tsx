"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ProfilePictureCropper } from "@/components/profile-picture-cropper";

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
}

export default function StudentProfilePage() {
    const { fetchWithAuth } = useApi();
    const { setProfilePicture } = useAuthStore();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [isUploadingCv, setIsUploadingCv] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        const res = await fetchWithAuth("/students/profile");
        if (res.ok) {
            const data = await res.json();
            setProfile(data.profile);
        }
        setIsLoading(false);
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetchWithAuth("/students/profile", {
                method: "PUT",
                body: JSON.stringify(profile),
            });

            if (res.ok) {
                toast.success("Profile updated successfully");
            } else {
                const data = await res.json();
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCvUpload = async () => {
        if (!cvFile) return;
        setIsUploadingCv(true);

        try {
            const formData = new FormData();
            formData.append("cv", cvFile);

            const res = await fetchWithAuth("/students/profile/cv", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setProfile((prev) => prev ? { ...prev, cv_url: data.cv_url } : prev);
                toast.success("CV uploaded successfully");
                setCvFile(null);
            } else {
                const data = await res.json();
                toast.error(data.error);
            }
        } catch {
            toast.error("Failed to upload CV");
        } finally {
            setIsUploadingCv(false);
        }
    };

    if (isLoading || !profile) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>

            <div className="grid gap-6">
                {/* Profile Picture */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <ProfilePictureCropper
                            currentImageUrl={profile.profile_picture_url}
                            onUploadSuccess={(url) => {
                                setProfile((prev) => prev ? { ...prev, profile_picture_url: url } : prev);
                                setProfilePicture(url);
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={profile.full_name || ""}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Student Type</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={profile.student_type || ""}
                                    onChange={(e) => setProfile({ ...profile, student_type: e.target.value })}
                                >
                                    <option value="">Select type</option>
                                    <option value="local">Local</option>
                                    <option value="international">International</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                    value={profile.city || ""}
                                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                    placeholder="Your city"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Age Range</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={profile.age_range || ""}
                                    onChange={(e) => setProfile({ ...profile, age_range: e.target.value })}
                                >
                                    <option value="">Select range</option>
                                    <option value="16-20">16-20</option>
                                    <option value="21-25">21-25</option>
                                    <option value="26-30">26-30</option>
                                    <option value="31+">31+</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Education Level</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={profile.education_level || ""}
                                    onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                                >
                                    <option value="">Select level</option>
                                    <option value="matric">Matric</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="bachelors">Bachelors</option>
                                    <option value="masters">Masters</option>
                                    <option value="phd">PhD</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Experience Level</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={profile.experience_level || ""}
                                    onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    <option value="none">No Experience</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="experienced">Experienced</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Intended Field of Study</Label>
                                <Input
                                    value={profile.intended_field || ""}
                                    onChange={(e) => setProfile({ ...profile, intended_field: e.target.value })}
                                    placeholder="e.g., Computer Science, Business..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Learning Goal</Label>
                                <Input
                                    value={profile.learning_goal || ""}
                                    onChange={(e) => setProfile({ ...profile, learning_goal: e.target.value })}
                                    placeholder="What do you want to achieve?"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Personal Statement</Label>
                                <Textarea
                                    value={profile.personal_statement || ""}
                                    onChange={(e) => setProfile({ ...profile, personal_statement: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* CV Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>CV / Resume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profile.cv_url && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700">
                                    ✅ CV uploaded.{" "}
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await fetchWithAuth("/students/profile/cv");
                                                if (!res.ok) throw new Error();
                                                const data = await res.json();
                                                window.open(data.url, "_blank");
                                            } catch {
                                                toast.error("Failed to load CV");
                                            }
                                        }}
                                        className="underline cursor-pointer"
                                    >
                                        View PDF
                                    </button>
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3 items-end">
                            <div className="flex-1">
                                <Label>Upload CV (PDF only, max 5MB)</Label>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                    className="mt-1"
                                    disabled={isUploadingCv}
                                />
                            </div>
                            <Button
                                onClick={handleCvUpload}
                                disabled={!cvFile || isUploadingCv}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isUploadingCv ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Upload"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
