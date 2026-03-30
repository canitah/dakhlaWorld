"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProfilePictureCropper } from "@/components/profile-picture-cropper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Spin, message } from "antd";

const { TextArea } = Input;

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

export default function InstitutionProfilePage() {
  const { fetchWithAuth } = useApi();
  const { setProfilePicture } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editData, setEditData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setIsLoading(true);
    const res = await fetchWithAuth("/institutions/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile);
      setEditData(data.profile); // Form initialize karne ke liye
    } else {
      message.error("Failed to load profile");
    }
    setIsLoading(false);
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetchWithAuth("/institutions/profile", {
        method: "PUT", // Apne API route ke mutabiq check karlein (PUT ya PATCH)
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setProfile(editData);
        setIsEditing(false);
        message.success("Profile updated successfully!");
      } else {
        message.error("Failed to update profile");
      }
    } catch (error) {
      message.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="institution">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile || !editData) return null;

  return (
    <DashboardLayout role="institution">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Institution Profile</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setIsEditing(false); setEditData(profile); }}>
                Cancel
              </Button>
              <Button 
  onClick={handleSave} 
  disabled={isSaving} // 'loading' ki jagah 'disabled' use karein
  className="bg-green-600 hover:bg-green-700 text-white"
>
  {isSaving ? "Saving..." : "Save Changes"} 
</Button>
            </div>
          )}
        </div>

        {/* Profile Picture Section */}
        <div className="mb-6 p-6 rounded-2xl border bg-card">
          <ProfilePictureCropper
            currentImageUrl={profile.profile_picture_url}
            onUploadSuccess={(url) => {
              setProfile((prev) => prev ? { ...prev, profile_picture_url: url } : prev);
              setProfilePicture(url);
            }}
          />
        </div>

        {/* Profile Info Card */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-bold text-sm">Institution Name</label>
                {isEditing ? (
                  <Input 
                    value={editData.name} 
                    onChange={(e) => setEditData({...editData, name: e.target.value})} 
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm">City</label>
                {isEditing ? (
                  <Input 
                    value={editData.city || ""} 
                    onChange={(e) => setEditData({...editData, city: e.target.value})} 
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.city || "Not set"}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm">Contact Email</label>
                {isEditing ? (
                  <Input 
                    value={editData.contact_email || ""} 
                    onChange={(e) => setEditData({...editData, contact_email: e.target.value})} 
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.contact_email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm">Category</label>
                {isEditing ? (
                  <Input 
                    value={editData.category || ""} 
                    onChange={(e) => setEditData({...editData, category: e.target.value})} 
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.category || "Not set"}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm">About / Description</label>
              {isEditing ? (
                <TextArea 
                  rows={4}
                  value={editData.description || ""} 
                  onChange={(e) => setEditData({...editData, description: e.target.value})} 
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded whitespace-pre-wrap">{profile.description || "No description provided."}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Links (Added because they were in the Type but missing in UI) */}
        {isEditing && (
          <Card className="mt-6">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold border-b pb-2">Social Media Links</h3>
              <Input placeholder="LinkedIn URL" value={editData.linkedin_url || ""} onChange={(e) => setEditData({...editData, linkedin_url: e.target.value})} />
              <Input placeholder="Facebook URL" value={editData.facebook_url || ""} onChange={(e) => setEditData({...editData, facebook_url: e.target.value})} />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}