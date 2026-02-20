"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { DashboardLayout } from "@/components/dashboard-layout";
import { toast } from "sonner";
import { ProfilePictureCropper } from "@/components/profile-picture-cropper";
import {
    Form,
    Input,
    Button as AntButton,
    Card as AntCard,
    Alert,
    Divider,
    Spin,
    message,
} from "antd";
import {
    BankOutlined,
    TagOutlined,
    EnvironmentOutlined,
    MailOutlined,
    FileTextOutlined,
    SaveOutlined,
    IdcardOutlined,
    WarningOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

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

    const handleSave = async () => {
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
            message.success("Profile updated successfully!");
        } else {
            const data = await res.json();
            message.error(data.error);
        }
        setIsSaving(false);
    };

    if (isLoading || !profile) {
        return (
            <DashboardLayout role="institution">
                <div className="flex items-center justify-center h-64">
                    <Spin size="large" />
                </div>
            </DashboardLayout>
        );
    }

    const missingFields = getMissingFields(profile);
    const isComplete = missingFields.length === 0;

    return (
        <DashboardLayout role="institution">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Institution Profile</h1>

                {/* ── Status Banners ── */}
                {!isComplete && profile.status === "pending" && (
                    <Alert
                        type="warning"
                        showIcon
                        icon={<WarningOutlined />}
                        className="mb-6"
                        message="Complete Your Profile to Get Approved"
                        description={
                            <span>
                                Your institution cannot be approved until all profile fields are filled out.
                                Missing: <strong>{missingFields.join(", ")}</strong>
                            </span>
                        }
                    />
                )}

                {!isComplete && profile.status !== "pending" && (
                    <Alert
                        type="error"
                        showIcon
                        icon={<CloseCircleOutlined />}
                        className="mb-6"
                        message="Profile Incomplete"
                        description={
                            <span>
                                Please fill in the following fields: <strong>{missingFields.join(", ")}</strong>
                            </span>
                        }
                    />
                )}

                {isComplete && profile.status === "pending" && (
                    <Alert
                        type="info"
                        showIcon
                        icon={<ClockCircleOutlined />}
                        className="mb-6"
                        message="Profile Complete — Awaiting Admin Approval"
                        description="Your profile is complete. Our admin team will review and approve your institution shortly."
                    />
                )}

                <div className="grid gap-6">

                    {/* ── Profile Picture Card ── */}
                    <AntCard
                        className="shadow-sm"
                        styles={{ header: { borderBottom: '1px solid var(--border)' } }}
                        title={
                            <div className="flex items-center gap-2">
                                <IdcardOutlined className="text-blue-500" />
                                <span className="font-semibold">Profile Picture</span>
                            </div>
                        }
                    >
                        <div className="flex justify-center py-4">
                            <ProfilePictureCropper
                                currentImageUrl={profile.profile_picture_url}
                                onUploadSuccess={(url) => {
                                    setProfile((prev) => prev ? { ...prev, profile_picture_url: url } : prev);
                                    setProfilePicture(url);
                                }}
                            />
                        </div>
                    </AntCard>

                    {/* ── Profile Details Card ── */}
                    <AntCard
                        className="shadow-sm"
                        styles={{ header: { borderBottom: '1px solid var(--border)' } }}
                        title={
                            <div className="flex items-center gap-2">
                                <BankOutlined className="text-blue-500" />
                                <span className="font-semibold">Profile Details</span>
                            </div>
                        }
                    >
                        <Form
                            layout="vertical"
                            onFinish={handleSave}
                            requiredMark="optional"
                            disabled={isSaving}
                            fields={[
                                { name: "name", value: profile.name },
                                { name: "category", value: profile.category },
                                { name: "city", value: profile.city },
                                { name: "contact_email", value: profile.contact_email },
                                { name: "description", value: profile.description },
                            ]}
                        >
                            <Form.Item
                                name="name"
                                label={<span className="font-medium">Institution Name</span>}
                                rules={[{ required: true, message: "Please enter institution name" }]}
                            >
                                <Input
                                    prefix={<BankOutlined className="text-gray-400" />}
                                    placeholder="e.g., Al Barakah University"
                                    size="large"
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </Form.Item>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <Form.Item
                                    name="category"
                                    label={<span className="font-medium">Category</span>}
                                    rules={[{ required: true, message: "Please enter category" }]}
                                >
                                    <Input
                                        prefix={<TagOutlined className="text-gray-400" />}
                                        placeholder="e.g., University, College"
                                        size="large"
                                        onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="city"
                                    label={<span className="font-medium">City</span>}
                                    rules={[{ required: true, message: "Please enter city" }]}
                                >
                                    <Input
                                        prefix={<EnvironmentOutlined className="text-gray-400" />}
                                        placeholder="e.g., Lahore"
                                        size="large"
                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                    />
                                </Form.Item>
                            </div>

                            <Form.Item
                                name="contact_email"
                                label={<span className="font-medium">Contact Email</span>}
                                rules={[
                                    { required: true, message: "Please enter contact email" },
                                    { type: "email", message: "Please enter a valid email" },
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined className="text-gray-400" />}
                                    placeholder="contact@institution.edu"
                                    size="large"
                                    onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                                />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label={<span className="font-medium">Description</span>}
                                rules={[{ required: true, message: "Please enter a description" }]}
                            >
                                <TextArea
                                    placeholder="Describe your institution..."
                                    rows={4}
                                    size="large"
                                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                />
                            </Form.Item>

                            <Form.Item className="mb-0 pt-2">
                                <AntButton
                                    type="primary"
                                    htmlType="submit"
                                    loading={isSaving}
                                    icon={isSaving ? undefined : <SaveOutlined />}
                                    size="large"
                                    className="h-11 font-semibold text-[15px]"
                                    style={{ background: "linear-gradient(to right, #2563eb, #4f46e5)", borderColor: "transparent" }}
                                >
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </AntButton>
                            </Form.Item>
                        </Form>
                    </AntCard>

                </div>
            </div>
        </DashboardLayout>
    );
}
