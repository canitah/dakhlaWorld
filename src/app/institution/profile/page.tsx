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
    name: string;
    category: string | null;
    city: string | null;
    description: string | null;
    contact_email: string | null;
    status: string;
    profile_picture_url: string | null;
}

const REQUIRED_FIELDS: { key: keyof Profile; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "city", label: "City" },
    { key: "description", label: "Description" },
    { key: "contact_email", label: "Contact Email" },
];

function getMissingFields(p: Profile): string[] {
    return REQUIRED_FIELDS
        .filter((f) => !p[f.key] || String(p[f.key]).trim() === "")
        .map((f) => f.label);
}

export default function InstitutionProfilePage() {
    const { fetchWithAuth } = useApi();
    const { setProfilePicture } = useAuthStore();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        const res = await fetchWithAuth("/institutions/profile");
        if (res.ok) {
            const data = await res.json();
            setProfile(data.profile);
        }
        setIsLoading(false);
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setIsSaving(true);

        const res = await fetchWithAuth("/institutions/profile", {
            method: "PUT",
            body: JSON.stringify({
                name: profile.name,
                category: profile.category,
                city: profile.city,
                description: profile.description,
                contact_email: profile.contact_email,
            }),
        });

        if (res.ok) {
            toast.success("Profile updated");
        } else {
            const data = await res.json();
            toast.error(data.error);
        }
        setIsSaving(false);
    };

    if (isLoading || !profile) {
        return (
            <DashboardLayout role="institution">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    const missingFields = getMissingFields(profile);
    const isComplete = missingFields.length === 0;

    return (
        <DashboardLayout role="institution">
            <h1 className="text-2xl font-bold mb-6">Institution Profile</h1>

            {/* Profile Completeness Banner */}
            {!isComplete && profile.status === "pending" && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <span className="text-xl mt-0.5">⚠️</span>
                    <div>
                        <p className="text-sm font-semibold text-amber-900">
                            Complete Your Profile to Get Approved
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                            Your institution cannot be approved until all profile fields are filled out.
                            Missing: <strong>{missingFields.join(", ")}</strong>
                        </p>
                    </div>
                </div>
            )}

            {!isComplete && profile.status !== "pending" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <span className="text-xl mt-0.5">❌</span>
                    <div>
                        <p className="text-sm font-semibold text-red-900">
                            Profile Incomplete
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                            Please fill in the following fields: <strong>{missingFields.join(", ")}</strong>
                        </p>
                    </div>
                </div>
            )}

            {isComplete && profile.status === "pending" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <span className="text-xl mt-0.5">⏳</span>
                    <div>
                        <p className="text-sm font-semibold text-blue-900">
                            Profile Complete — Awaiting Admin Approval
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            Your profile is complete. Our admin team will review and approve your institution shortly.
                        </p>
                    </div>
                </div>
            )}

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

                {/* Profile Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Institution Name <span className="text-red-500">*</span></Label>
                                <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Category <span className="text-red-500">*</span></Label>
                                <Input value={profile.category || ""} onChange={(e) => setProfile({ ...profile, category: e.target.value })} placeholder="e.g., University, College" />
                            </div>
                            <div className="space-y-2">
                                <Label>City <span className="text-red-500">*</span></Label>
                                <Input value={profile.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="e.g., Lahore" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Contact Email <span className="text-red-500">*</span></Label>
                                <Input type="email" value={profile.contact_email || ""} onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Description <span className="text-red-500">*</span></Label>
                                <Textarea value={profile.description || ""} onChange={(e) => setProfile({ ...profile, description: e.target.value })} rows={4} placeholder="Describe your institution..." />
                            </div>
                            <div className="md:col-span-2">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
