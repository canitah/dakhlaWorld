"use client";

import { useRef, useState, useCallback } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface ProfilePictureCropperProps {
    currentImageUrl?: string | null;
    onUploadSuccess: (url: string) => void;
}

export function ProfilePictureCropper({
    currentImageUrl,
    onUploadSuccess,
}: ProfilePictureCropperProps) {
    const cropperRef = useRef<ReactCropperElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { fetchWithAuth } = useApi();

    const [isOpen, setIsOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [zoom, setZoom] = useState(0);
    const [rotation, setRotation] = useState(0);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                toast.error("Please select a JPEG, PNG, or WebP image");
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image is too large. Please select an image under 10MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setIsOpen(true);
                setZoom(0);
                setRotation(0);
            };
            reader.readAsDataURL(file);
        },
        []
    );

    const handleRotate = (degrees: number) => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            const newRotation = rotation + degrees;
            setRotation(newRotation);
            cropper.rotateTo(newRotation);
        }
    };

    const handleZoomChange = (value: number) => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            setZoom(value);
            // Zoom relative to the center
            const containerData = cropper.getContainerData();
            cropper.zoomTo(1 + value / 50, {
                x: containerData.width / 2,
                y: containerData.height / 2,
            });
        }
    };

    const handleUpload = async () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        setIsUploading(true);

        try {
            const canvas = cropper.getCroppedCanvas({
                width: 400,
                height: 400,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: "high",
            });

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b: Blob | null) => {
                        if (b) resolve(b);
                        else reject(new Error("Failed to create image blob"));
                    },
                    "image/jpeg",
                    0.9
                );
            });

            const formData = new FormData();
            formData.append("image", blob, "profile-picture.jpg");

            const res = await fetchWithAuth("/profile-picture", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                onUploadSuccess(data.url);
                toast.success("Profile picture updated!");
                handleClose();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to upload");
            }
        } catch {
            toast.error("Failed to upload profile picture");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setImageSrc(null);
        setZoom(0);
        setRotation(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Current Photo Preview */}
            <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-border shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    {currentImageUrl ? (
                        <img
                            src={currentImageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-white/80"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors border-2 border-background"
                    title="Change photo"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {currentImageUrl ? (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                        Change Photo
                    </button>
                    <span className="text-muted-foreground text-xs">·</span>
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetchWithAuth("/profile-picture/remove", {
                                    method: "DELETE",
                                });
                                if (res.ok) {
                                    onUploadSuccess("");
                                    toast.success("Profile picture removed");
                                } else {
                                    toast.error("Failed to remove picture");
                                }
                            } catch {
                                toast.error("Failed to remove picture");
                            }
                        }}
                        className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline transition-colors"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">Click the camera icon to upload your photo</p>
            )}

            {/* Cropper Modal */}
            {isOpen && imageSrc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-foreground">
                                Crop Your Photo
                            </h3>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Cropper Area */}
                        <div className="p-4 bg-muted/30">
                            <div className="rounded-xl overflow-hidden border border-border">
                                <Cropper
                                    ref={cropperRef}
                                    src={imageSrc}
                                    style={{ height: 350, width: "100%" }}
                                    aspectRatio={1}
                                    viewMode={1}
                                    minCropBoxHeight={80}
                                    minCropBoxWidth={80}
                                    background={false}
                                    responsive={true}
                                    autoCropArea={0.85}
                                    checkOrientation={false}
                                    guides={true}
                                />
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="px-5 py-4 space-y-4 border-t border-border">
                            {/* Zoom */}
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={zoom}
                                    onChange={(e) => handleZoomChange(Number(e.target.value))}
                                    className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                    {Math.round(100 + zoom * 2)}%
                                </span>
                            </div>

                            {/* Rotate */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground mr-1">Rotate:</span>
                                <button
                                    onClick={() => handleRotate(-90)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-accent text-foreground transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    -90°
                                </button>
                                <button
                                    onClick={() => handleRotate(-45)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-accent text-foreground transition-colors"
                                >
                                    -45°
                                </button>
                                <button
                                    onClick={() => handleRotate(45)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-accent text-foreground transition-colors"
                                >
                                    +45°
                                </button>
                                <button
                                    onClick={() => handleRotate(90)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-accent text-foreground transition-colors"
                                >
                                    +90°
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/30">
                            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                            >
                                {isUploading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </div>
                                ) : (
                                    "Upload Photo"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
