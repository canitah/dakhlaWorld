"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Profile {
    name: string;
    category: string | null;
    city: string | null;
    description: string | null;
    contact_email: string | null;
    status: string;
}

export default function InstitutionProfilePage() {
    const { fetchWithAuth } = useApi();
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

    return (
        <DashboardLayout role="institution">
            <h1 className="text-2xl font-bold mb-6">Institution Profile</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Institution Name *</Label>
                            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input value={profile.category || ""} onChange={(e) => setProfile({ ...profile, category: e.target.value })} placeholder="e.g., University, College" />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input value={profile.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="e.g., Lahore" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Contact Email</Label>
                            <Input type="email" value={profile.contact_email || ""} onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
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
        </DashboardLayout>
    );
}
