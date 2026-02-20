"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StatusBadge } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Modal,
    Avatar,
    Descriptions,
    Tag,
    Button as AntButton,
    Divider,
    message,
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    BookOutlined,
    TrophyOutlined,
    RocketOutlined,
    AimOutlined,
    CalendarOutlined,
    FileTextOutlined,
    FilePdfOutlined,
} from "@ant-design/icons";

interface Application {
    id: number;
    status: string;
    created_at: string;
    student: {
        id: number;
        full_name: string | null;
        city: string | null;
        education_level: string | null;
        user: { email: string | null; phone: string | null };
    };
    program: { id: number; title: string; category: string | null };
}

interface StudentDetail {
    user_id: number;
    full_name: string | null;
    student_type: string | null;
    city: string | null;
    age_range: string | null;
    intended_field: string | null;
    personal_statement: string | null;
    education_level: string | null;
    experience_level: string | null;
    learning_goal: string | null;
    cv_url: string | null;
    profile_picture_url: string | null;
    user: { email: string | null; phone: string | null };
}

export default function InstitutionApplicationsPage() {
    const { fetchWithAuth } = useApi();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        loadApplications();
    }, []);

    async function loadApplications() {
        const res = await fetchWithAuth("/institutions/applications");
        if (res.ok) {
            const data = await res.json();
            setApplications(data.applications);
        }
        setIsLoading(false);
    }

    const handleStatusUpdate = async (appId: number, status: string) => {
        const res = await fetchWithAuth(`/institutions/applications/${appId}`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            message.success(`Application ${status}`);
            loadApplications();
        }
    };

    const viewStudentProfile = async (studentId: number) => {
        const res = await fetchWithAuth(`/institutions/applicant/${studentId}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedStudent(data.student);
            setIsPreviewOpen(true);
        } else {
            message.error("Could not load student profile");
        }
    };

    if (isLoading) {
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
            <h1 className="text-2xl font-bold mb-6">Applications ({applications.length})</h1>

            <Card>
                <CardContent className="pt-6">
                    {applications.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No applications received yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Applicant</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Program</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Date</th>
                                        <th className="pb-3 text-sm font-semibold text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id} className="border-b last:border-0 hover:bg-accent/50">
                                            <td className="py-3">
                                                <div>
                                                    <p className="text-sm font-medium">{app.student.full_name || "—"}</p>
                                                    <p className="text-xs text-muted-foreground">{app.student.user.email}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 text-sm">{app.program.title}</td>
                                            <td className="py-3"><StatusBadge status={app.status} /></td>
                                            <td className="py-3 text-sm text-muted-foreground">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => viewStudentProfile(app.student.id)}>
                                                        Profile
                                                    </Button>
                                                    {app.status === "submitted" && (
                                                        <Button size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusUpdate(app.id, "viewed")}>
                                                            Mark Viewed
                                                        </Button>
                                                    )}
                                                    {app.status !== "accepted" && (
                                                        <Button size="sm" className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusUpdate(app.id, "accepted")}>
                                                            Accept
                                                        </Button>
                                                    )}
                                                    {app.status !== "rejected" && (
                                                        <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleStatusUpdate(app.id, "rejected")}>
                                                            Reject
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Student Profile Preview Modal */}
            <Modal
                open={isPreviewOpen}
                onCancel={() => setIsPreviewOpen(false)}
                footer={null}
                width={600}
                centered
                destroyOnClose
                title={null}
                styles={{
                    body: { padding: 0, overflow: 'hidden' },
                }}
            >
                {selectedStudent && (
                    <div>
                        {/* Header */}
                        <div className="px-6 pt-6 pb-5 border-b border-border">
                            <div className="flex items-center gap-4">
                                <Avatar
                                    size={72}
                                    src={selectedStudent.profile_picture_url || undefined}
                                    icon={!selectedStudent.profile_picture_url ? <UserOutlined /> : undefined}
                                    style={{
                                        backgroundColor: selectedStudent.profile_picture_url ? undefined : '#2563eb',
                                        border: '3px solid var(--border)',
                                        flexShrink: 0,
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-foreground truncate">
                                        {selectedStudent.full_name || "Unnamed Student"}
                                    </h2>
                                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
                                        <MailOutlined />
                                        <span className="truncate">{selectedStudent.user.email || "—"}</span>
                                    </div>
                                    {selectedStudent.city && (
                                        <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground text-sm">
                                            <EnvironmentOutlined />
                                            <span>{selectedStudent.city}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Tags row */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedStudent.student_type && (
                                    <Tag color="blue" className="m-0 capitalize font-medium">
                                        <TeamOutlined className="mr-1" />{selectedStudent.student_type}
                                    </Tag>
                                )}
                                {selectedStudent.education_level && (
                                    <Tag color="cyan" className="m-0 capitalize font-medium">
                                        <BookOutlined className="mr-1" />{selectedStudent.education_level}
                                    </Tag>
                                )}
                                {selectedStudent.experience_level && (
                                    <Tag color="purple" className="m-0 capitalize font-medium">
                                        <TrophyOutlined className="mr-1" />{selectedStudent.experience_level}
                                    </Tag>
                                )}
                                {selectedStudent.age_range && (
                                    <Tag color="geekblue" className="m-0 font-medium">
                                        <CalendarOutlined className="mr-1" />{selectedStudent.age_range}
                                    </Tag>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-5 space-y-5">
                            <Descriptions
                                column={{ xs: 1, sm: 2 }}
                                layout="vertical"
                                colon={false}
                                size="small"
                            >
                                {selectedStudent.intended_field && (
                                    <Descriptions.Item
                                        label={<span className="text-muted-foreground flex items-center gap-1"><AimOutlined /> Intended Field</span>}
                                    >
                                        <span className="font-medium">{selectedStudent.intended_field}</span>
                                    </Descriptions.Item>
                                )}
                                {selectedStudent.learning_goal && (
                                    <Descriptions.Item
                                        label={<span className="text-muted-foreground flex items-center gap-1"><RocketOutlined /> Learning Goal</span>}
                                    >
                                        <span className="font-medium">{selectedStudent.learning_goal}</span>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {selectedStudent.personal_statement && (
                                <div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1.5">
                                        <FileTextOutlined /> Personal Statement
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm leading-relaxed">
                                        {selectedStudent.personal_statement}
                                    </div>
                                </div>
                            )}

                            {selectedStudent.cv_url && (
                                <>
                                    <Divider className="my-0" />
                                    <AntButton
                                        type="primary"
                                        icon={<FilePdfOutlined />}
                                        size="large"
                                        block
                                        className="h-11 font-semibold text-[15px]"
                                        style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', borderColor: 'transparent' }}
                                        onClick={async () => {
                                            try {
                                                const res = await fetchWithAuth(`/students/profile/cv?userId=${selectedStudent.user_id}`);
                                                if (!res.ok) throw new Error();
                                                const data = await res.json();
                                                window.open(data.url, "_blank");
                                            } catch {
                                                message.error("Failed to load CV");
                                            }
                                        }}
                                    >
                                        View CV / Resume
                                    </AntButton>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
