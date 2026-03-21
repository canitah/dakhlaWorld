"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProfilePictureCropper } from "@/components/profile-picture-cropper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spin, message } from "antd";

/* ─── CONFIG ─── */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

/* ─── Profile Type ─── */
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

  // ✅ CV FIELD
  cv?: {
    url: string;
  } | null;
}

export default function InstitutionProfilePage() {
  const router = useRouter();
  const { fetchWithAuth } = useApi();
  const { setProfilePicture } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const res = await fetchWithAuth("/institutions/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data.profile);
    } else {
      message.error("Failed to load profile");
    }
    setIsLoading(false);
  }

  // ✅ Convert Cloudinary URL to raw PDF
  const getRawCloudinaryURL = (url: string) => {
    if (!url) return "";
    return url.replace("/image/upload/", "/raw/upload/").split("?")[0];
  };

  // ✅ Extract filename from URL
  const getFileNameFromURL = (url: string) => {
    if (!url) return "CV.pdf";
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.endsWith(".pdf") ? lastPart : `${lastPart}.pdf`;
  };

  // ✅ Direct CV download (no new tab)
  const handleDownloadCV = async () => {
    if (!profile?.cv?.url) {
      message.error("CV not available");
      return;
    }

    const rawUrl = getRawCloudinaryURL(profile.cv.url);
    const fileName = getFileNameFromURL(rawUrl);

    try {
      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error("Failed to fetch CV");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName; // ✅ original filename
      a.style.display = "none"; // Ensure no browser open
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
      message.success(`CV downloaded as ${fileName}`);
    } catch (err) {
      console.error(err);
      message.error("Failed to download CV. Please try again.");
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

  if (!profile) return null;

  return (
    <DashboardLayout role="institution">
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Institution Profile</h1>
        </div>

        {/* Profile Picture */}
        <div className="mb-6 p-6 rounded-2xl border bg-card">
          <ProfilePictureCropper
            currentImageUrl={profile.profile_picture_url}
            onUploadSuccess={(url) => {
              setProfile((prev) =>
                prev ? { ...prev, profile_picture_url: url } : prev
              );
              setProfilePicture(url);
            }}
          />
        </div>

        {/* Profile Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <p>
              <b>Name:</b> {profile.name}
            </p>
            <p>
              <b>Category:</b> {profile.category}
            </p>
            <p>
              <b>City:</b> {profile.city}
            </p>
            <p>
              <b>Email:</b> {profile.contact_email}
            </p>
            <p>
              <b>Description:</b> {profile.description}
            </p>
          </CardContent>
        </Card>

        {/* ✅ Direct Download Button */}
        <div className="mt-6">
          <Button
            onClick={handleDownloadCV}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
          >
            Download CV / Resume
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}