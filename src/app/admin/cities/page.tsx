"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface City {
    id: number;
    name: string;
    _count: { institutions: number };
}

export default function AdminCitiesPage() {
    const { fetchWithAuth } = useApi();
    const [cities, setCities] = useState<City[]>([]);
    const [newName, setNewName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCities();
    }, []);

    async function loadCities() {
        const res = await fetchWithAuth("/admin/cities");
        if (res.ok) {
            const data = await res.json();
            setCities(data.cities);
        }
        setIsLoading(false);
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const res = await fetchWithAuth("/admin/cities", {
            method: "POST",
            body: JSON.stringify({ name: newName.trim() }),
        });

        if (res.ok) {
            toast.success("City added");
            setNewName("");
            loadCities();
        } else {
            const data = await res.json();
            toast.error(data.error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this city?")) return;

        const res = await fetchWithAuth(`/admin/cities?id=${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            toast.success("City deleted");
            loadCities();
        } else {
            const data = await res.json();
            toast.error(data.error);
        }
    };

    return (
        <DashboardLayout role="admin">
            <h1 className="text-2xl font-bold mb-6">Cities</h1>

            {/* Add City */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Add New City</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="flex gap-3">
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="City name"
                            className="flex-1"
                        />
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Add City
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Cities List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Cities ({cities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : cities.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No cities yet</p>
                    ) : (
                        <div className="space-y-2">
                            {cities.map((city) => (
                                <div key={city.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                    <div>
                                        <p className="text-sm font-medium">{city.name}</p>
                                        <p className="text-xs text-muted-foreground">{city._count.institutions} institutions</p>
                                    </div>
                                    <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleDelete(city.id)}>
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
