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
    Select,
    Button as AntButton,
    Card as AntCard,
    Upload,
    message,
    Divider,
    Spin,
} from "antd";
import {
    UserOutlined,
    GlobalOutlined,
    EnvironmentOutlined,
    BookOutlined,
    TrophyOutlined,
    RocketOutlined,
    FileTextOutlined,
    SaveOutlined,
    UploadOutlined,
    EyeOutlined,
    CheckCircleFilled,
    IdcardOutlined,
    TeamOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

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

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const res = await fetchWithAuth("/students/profile", {
                method: "PUT",
                body: JSON.stringify(profile),
            });

            if (res.ok) {
                message.success("Profile updated successfully!");
            } else {
                const data = await res.json();
                message.error(data.error);
            }
        } catch {
            message.error("Failed to update profile");
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
                message.success("CV uploaded successfully!");
                setCvFile(null);
            } else {
                const data = await res.json();
                message.error(data.error);
            }
        } catch {
            message.error("Failed to upload CV");
        } finally {
            setIsUploadingCv(false);
        }
    };

    if (isLoading || !profile) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center h-64">
                    <Spin size="large" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">My Profile</h1>

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

                    {/* ── Personal Information Card ── */}
                    <AntCard
                        className="shadow-sm"
                        styles={{ header: { borderBottom: '1px solid var(--border)' } }}
                        title={
                            <div className="flex items-center gap-2">
                                <UserOutlined className="text-blue-500" />
                                <span className="font-semibold">Personal Information</span>
                            </div>
                        }
                    >
                        <Form
                            layout="vertical"
                            onFinish={handleSave}
                            requiredMark="optional"
                            disabled={isSaving}
                            fields={[
                                { name: "full_name", value: profile.full_name },
                                { name: "student_type", value: profile.student_type },
                                { name: "city", value: profile.city },
                                { name: "age_range", value: profile.age_range },
                                { name: "education_level", value: profile.education_level },
                                { name: "experience_level", value: profile.experience_level },
                                { name: "intended_field", value: profile.intended_field },
                                { name: "learning_goal", value: profile.learning_goal },
                                { name: "personal_statement", value: profile.personal_statement },
                            ]}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                <Form.Item
                                    name="full_name"
                                    label={<span className="font-medium">Full Name</span>}
                                >
                                    <Input
                                        prefix={<UserOutlined className="text-gray-400" />}
                                        placeholder="Your full name"
                                        size="large"
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="student_type"
                                    label={<span className="font-medium">Student Type</span>}
                                >
                                    <Select
                                        size="large"
                                        placeholder="Select type"
                                        onChange={(value) => setProfile({ ...profile, student_type: value })}
                                        getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                        options={[
                                            { value: "local", label: "Local" },
                                            { value: "international", label: "International" },
                                        ]}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="city"
                                    label={<span className="font-medium">City</span>}
                                >
                                    <Input
                                        prefix={<EnvironmentOutlined className="text-gray-400" />}
                                        placeholder="Your city"
                                        size="large"
                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="age_range"
                                    label={<span className="font-medium">Age Range</span>}
                                >
                                    <Select
                                        size="large"
                                        placeholder="Select range"
                                        onChange={(value) => setProfile({ ...profile, age_range: value })}
                                        getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                        options={[
                                            { value: "16-20", label: "16-20" },
                                            { value: "21-25", label: "21-25" },
                                            { value: "26-30", label: "26-30" },
                                            { value: "31+", label: "31+" },
                                        ]}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="education_level"
                                    label={<span className="font-medium">Education Level</span>}
                                >
                                    <Select
                                        size="large"
                                        placeholder="Select level"
                                        onChange={(value) => setProfile({ ...profile, education_level: value })}
                                        getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                        options={[
                                            { value: "matric", label: "Matric" },
                                            { value: "intermediate", label: "Intermediate" },
                                            { value: "bachelors", label: "Bachelors" },
                                            { value: "masters", label: "Masters" },
                                            { value: "phd", label: "PhD" },
                                        ]}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="experience_level"
                                    label={<span className="font-medium">Experience Level</span>}
                                >
                                    <Select
                                        size="large"
                                        placeholder="Select experience"
                                        onChange={(value) => setProfile({ ...profile, experience_level: value })}
                                        getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                        options={[
                                            { value: "none", label: "No Experience" },
                                            { value: "beginner", label: "Beginner" },
                                            { value: "intermediate", label: "Intermediate" },
                                            { value: "experienced", label: "Experienced" },
                                        ]}
                                    />
                                </Form.Item>
                            </div>

                            <Divider className="my-2" />

                            <Form.Item
                                name="intended_field"
                                label={<span className="font-medium">Intended Field of Study</span>}
                            >
                                <Input
                                    prefix={<BookOutlined className="text-gray-400" />}
                                    placeholder="e.g., Computer Science, Business..."
                                    size="large"
                                    onChange={(e) => setProfile({ ...profile, intended_field: e.target.value })}
                                />
                            </Form.Item>

                            <Form.Item
                                name="learning_goal"
                                label={<span className="font-medium">Learning Goal</span>}
                            >
                                <Input
                                    prefix={<RocketOutlined className="text-gray-400" />}
                                    placeholder="What do you want to achieve?"
                                    size="large"
                                    onChange={(e) => setProfile({ ...profile, learning_goal: e.target.value })}
                                />
                            </Form.Item>

                            <Form.Item
                                name="personal_statement"
                                label={<span className="font-medium">Personal Statement</span>}
                            >
                                <TextArea
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    size="large"
                                    onChange={(e) => setProfile({ ...profile, personal_statement: e.target.value })}
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

                    {/* ── CV / Resume Card ── */}
                    <AntCard
                        className="shadow-sm"
                        styles={{ header: { borderBottom: '1px solid var(--border)' } }}
                        title={
                            <div className="flex items-center gap-2">
                                <FileTextOutlined className="text-blue-500" />
                                <span className="font-semibold">CV / Resume</span>
                            </div>
                        }
                    >
                        {profile.cv_url && (
                            <div className="mb-5 p-3.5 rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20 flex items-center gap-3">
                                <CheckCircleFilled className="text-green-500 text-lg flex-shrink-0" />
                                <span className="text-sm text-green-700 dark:text-green-300 font-medium flex-1">
                                    CV uploaded successfully.
                                </span>
                                <AntButton
                                    type="link"
                                    icon={<EyeOutlined />}
                                    className="font-medium"
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
                                >
                                    View PDF
                                </AntButton>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                            <div className="flex-1 w-full">
                                <p className="text-sm font-medium text-foreground mb-2">Upload CV (PDF only, max 5MB)</p>
                                <Upload
                                    accept=".pdf"
                                    maxCount={1}
                                    beforeUpload={(file) => {
                                        setCvFile(file);
                                        return false; // prevent auto upload
                                    }}
                                    onRemove={() => setCvFile(null)}
                                    fileList={cvFile ? [{ uid: '-1', name: cvFile.name, status: 'done' }] : []}
                                >
                                    <AntButton icon={<UploadOutlined />} size="large">
                                        Select PDF File
                                    </AntButton>
                                </Upload>
                            </div>
                            <AntButton
                                type="primary"
                                onClick={handleCvUpload}
                                disabled={!cvFile}
                                loading={isUploadingCv}
                                icon={isUploadingCv ? undefined : <UploadOutlined />}
                                size="large"
                                className="font-semibold"
                                style={{ background: cvFile ? "linear-gradient(to right, #2563eb, #4f46e5)" : undefined, borderColor: "transparent" }}
                            >
                                {isUploadingCv ? "Uploading..." : "Upload CV"}
                            </AntButton>
                        </div>
                    </AntCard>

                </div>
            </div>
        </DashboardLayout>
    );
}
