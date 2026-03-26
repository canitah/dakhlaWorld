"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Input, Button, Card, message, Spin, InputNumber, Switch, DatePicker } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function EditProgramPage() {
    const params = useParams();
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                // params.id ko use kar ke data fetch karna
                const response = await fetch(`/api/programs/${params.id}`);
                const data = await response.json();
                
                // data.program check karna kyunke backend 'program' key mein bhej raha hai
                if (response.ok && data.program) {
                    const programData = {
                        ...data.program,
                        deadline: data.program.deadline ? dayjs(data.program.deadline) : null
                    };
                    form.setFieldsValue(programData);
                } else {
                    message.error("Program details not found");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                message.error("Error loading program");
            } finally {
                setLoading(false);
            }
        };
        fetchProgram();
    }, [params.id, form]);

    const onFinish = async (values: any) => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/programs/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                message.success("Program updated successfully!");
                setTimeout(() => router.back(), 1000);
            } else {
                message.error("Update failed");
            }
        } catch (error) {
            message.error("Something went wrong during update");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Spin size="large" tip="Loading Program Data..." /></div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => router.back()} 
                className="mb-4 shadow-sm"
            >
                Back
            </Button>
            
            <Card title={<span className="font-bold text-lg">Edit Program Details</span>} className="shadow-md rounded-xl">
                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
                    <Form.Item label="Program Title" name="title" rules={[{ required: true, message: 'Title is required' }]}>
                        <Input placeholder="e.g. BS Commerce" className="rounded-md" />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item label="Category" name="category"><Input className="rounded-md" /></Form.Item>
                        <Form.Item label="Duration" name="duration"><Input className="rounded-md" /></Form.Item>
                        <Form.Item label="Fee (PKR)" name="fee"><InputNumber className="w-full rounded-md" /></Form.Item>
                        <Form.Item label="Deadline" name="deadline"><DatePicker className="w-full rounded-md" /></Form.Item>
                    </div>

                    <Form.Item label="Study Field" name="study_field">
                        <Input className="rounded-md" />
                    </Form.Item>

                    <Form.Item label="Is Program Active?" name="is_active" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={5} className="rounded-md" />
                    </Form.Item>

                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        icon={<SaveOutlined />} 
                        loading={updating} 
                        block 
                        size="large"
                        className="h-12 bg-blue-600 font-bold rounded-lg"
                    >
                        Save Changes
                    </Button>
                </Form>
            </Card>
        </div>
    );
}