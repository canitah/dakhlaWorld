"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { message } from "antd";

interface Category {
    id: number;
    name: string;
    _count: { programs: number };
}

export default function AdminCategoriesPage() {
    const { fetchWithAuth } = useApi();
    const [categories, setCategories] = useState<Category[]>([]);
    const [newName, setNewName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        const res = await fetchWithAuth("/admin/categories");
        if (res.ok) {
            const data = await res.json();
            setCategories(data.categories);
        }
        setIsLoading(false);
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const res = await fetchWithAuth("/admin/categories", {
            method: "POST",
            body: JSON.stringify({ name: newName.trim() }),
        });

        if (res.ok) {
            message.success("Category added");
            setNewName("");
            loadCategories();
        } else {
            const data = await res.json();
            message.error(data.error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this category?")) return;

        const res = await fetchWithAuth(`/admin/categories?id=${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            message.success("Category deleted");
            loadCategories();
        } else {
            const data = await res.json();
            message.error(data.error);
        }
    };

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold mb-6">Categories</h1>

            {/* Add Category */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Add New Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="flex gap-3">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Category name"
                            className="flex-1"
                        />
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Add Category
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Categories List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Categories ({categories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No categories yet</p>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                                    <div>
                                        <p className="text-sm font-medium">{cat.name}</p>
                                        <p className="text-xs text-muted-foreground">{cat._count.programs} programs</p>
                                    </div>
                                    <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleDelete(cat.id)}>
                                        Delete
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
