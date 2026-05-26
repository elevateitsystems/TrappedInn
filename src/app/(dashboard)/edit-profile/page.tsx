"use client";
import { useState, useEffect, useRef } from "react";
import { useGetMyProfile, useUpdateMyProfile, getGetMyProfileQueryKey } from "@/lib/api-client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Camera, Phone, Mail, Globe, MessageSquare, BadgeCheck, ExternalLink, ShieldCheck, MapPin } from "lucide-react";
import { motion } from "framer-motion";

import { ImageCropperModal } from "@/components/image-cropper-modal";

async function uploadAvatar(file: File | Blob): Promise<string> {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetch(`/api/upload/avatar`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.avatar_url as string;
}

async function uploadHeader(file: File | Blob): Promise<string> {
  const formData = new FormData();
  formData.append("header", file);
  const res = await fetch(`/api/upload/header`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.header_image_url as string;
}

export default function EditProfilePage() {
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const headerFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
    headerImageUrl: "",
    phone: "",
    email: "",
    website: "",
    smsNumber: "",
    location: "",
    leadCaptureEnabled: false,
    verified: false,
    contactSettings: { showPhone: true, showEmail: true, showWebsite: true, showSms: false, showLocation: true },
    themeSettings: {
      backgroundColor: "",
      textColor: "",
      buttonStyle: "rounded" as "rounded" | "square" | "outline",
      font: "sans-serif",
      layout: "classic" as "classic" | "hero",
    },
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [headerUploading, setHeaderUploading] = useState(false);
  const [headerPreview, setHeaderPreview] = useState<string>("");

  useEffect(() => {
    if (profile) {
      const ts = (profile as any).themeSettings ?? {};
      const cs = { showPhone: true, showEmail: true, showWebsite: true, showSms: false, showLocation: true, ...((profile as any).contactSettings ?? {}) };
      setForm({
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl ?? "",
        headerImageUrl: (profile as any).headerImageUrl ?? "",
        phone: (profile as any).phone ?? "",
        email: (profile as any).email ?? "",
        website: (profile as any).website ?? "",
        smsNumber: (profile as any).smsNumber ?? "",
        location: (profile as any).location ?? "",
        leadCaptureEnabled: !!(profile as any).leadCaptureEnabled,
        verified: !!(profile as any).verified,
        contactSettings: cs,
        themeSettings: {
          backgroundColor: ts.backgroundColor ?? "",
          textColor: ts.textColor ?? "",
          buttonStyle: ts.buttonStyle ?? "rounded",
          font: ts.font ?? "sans-serif",
          layout: ts.layout ?? "classic",
        },
      });
      setAvatarPreview(profile.avatarUrl ?? "");
      setHeaderPreview((profile as any).headerImageUrl ?? "");
    }
  }, [profile]);

  // Crop-before-upload state
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [headerCropSrc, setHeaderCropSrc] = useState<string | null>(null);

  const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB

  const validateImage = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, GIF, or WebP).");
      return false;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert("Image is too large. Please pick one under 15 MB.");
      return false;
    }
    return true;
  };

  // Revoke previous object URLs to avoid leaks
  const closeAvatarCrop = () => {
    setAvatarCropSrc((cur) => {
      if (cur) URL.revokeObjectURL(cur);
      return null;
    });
  };
  const closeHeaderCrop = () => {
    setHeaderCropSrc((cur) => {
      if (cur) URL.revokeObjectURL(cur);
      return null;
    });
  };

  // Cleanup any active object URLs on unmount
  useEffect(() => {
    return () => {
      if (avatarCropSrc) URL.revokeObjectURL(avatarCropSrc);
      if (headerCropSrc) URL.revokeObjectURL(headerCropSrc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!validateImage(file)) return;
    // Revoke any prior URL before opening a new one
    if (avatarCropSrc) URL.revokeObjectURL(avatarCropSrc);
    setAvatarCropSrc(URL.createObjectURL(file));
  };

  const handleAvatarCropSave = async (blob: Blob) => {
    setUploading(true);
    try {
      const url = await uploadAvatar(blob);
      setForm((f) => ({ ...f, avatarUrl: url }));
      setAvatarPreview(url);
      closeAvatarCrop();
    } catch {
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!validateImage(file)) return;
    if (headerCropSrc) URL.revokeObjectURL(headerCropSrc);
    setHeaderCropSrc(URL.createObjectURL(file));
  };

  const handleHeaderCropSave = async (blob: Blob) => {
    setHeaderUploading(true);
    try {
      const url = await uploadHeader(blob);
      setForm((f) => ({ ...f, headerImageUrl: url }));
      setHeaderPreview(url);
      closeHeaderCrop();
    } catch {
      alert("Failed to upload header image. Please try again.");
    } finally {
      setHeaderUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        username: form.username,
        displayName: form.displayName,
        bio: form.bio || null,
        avatarUrl: form.avatarUrl || null,
        headerImageUrl: form.headerImageUrl || null,
        themeSettings: form.themeSettings,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        smsNumber: form.smsNumber || null,
        location: form.location || null,
        leadCaptureEnabled: form.leadCaptureEnabled,
        verified: form.verified,
        contactSettings: form.contactSettings,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      }
    );
  };

  const fieldCls = "flex flex-col gap-1.5";
  const labelCls = "text-sm font-medium text-foreground";
  const inputCls = "px-4 py-2.5 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";
  const sectionCls = "pt-6 mt-6 border-t border-border";

  return (
    <>
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-semibold">Edit Profile</h1>
              <p className="text-muted-foreground mt-1 text-sm">Your public identity on Tapped Inn Network</p>
            </div>
            {profile && (
              <a
                href={`/p/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent hover:border-primary/30 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                View profile
              </a>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header image + avatar upload */}
            <div className="rounded-2xl overflow-hidden border border-border">
              {/* Header banner */}
              <div
                className="relative h-32 cursor-pointer group"
                style={{ background: "hsl(240 10% 8%)" }}
                onClick={() => headerFileRef.current?.click()}
              >
                {headerPreview ? (
                  <img src={headerPreview} alt="Header" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <Camera className="w-5 h-5" />
                    <span className="text-xs font-medium">Add header image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {headerUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                      <Camera className="w-4 h-4" /> Change header
                    </div>
                  )}
                </div>
                <input ref={headerFileRef} type="file" accept="image/*" className="hidden" onChange={handleHeaderFileChange} />
              </div>

              {/* Avatar overlapping header */}
              <div className="flex items-end gap-3 px-4 pb-4 -mt-8 relative">
                <div className="relative group shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-background" />
                  ) : (
                    <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-xl font-display font-semibold border-2 border-background">
                      {(form.displayName || "")[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
                  </button>
                </div>
                <div className="flex gap-2 mb-1">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs text-primary hover:underline font-medium">
                    {uploading ? "Uploading..." : "Change photo"}
                  </button>
                  {headerPreview && (
                    <button type="button" onClick={() => { setHeaderPreview(""); setForm((f) => ({ ...f, headerImageUrl: "" })); }} className="text-xs text-muted-foreground hover:text-destructive font-medium">
                      Remove header
                    </button>
                  )}
                </div>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {/* Basic info */}
            <div className={fieldCls}>
              <label className={labelCls}>Username</label>
              <div className="flex items-center rounded-xl border border-border bg-input overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                <span className="pl-4 text-muted-foreground text-sm">/p/</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
                  className="flex-1 py-2.5 pr-4 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground"
                  placeholder="yourname"
                  required
                />
              </div>
            </div>

            <div className={fieldCls}>
              <label className={labelCls}>Display name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className={inputCls}
                placeholder="Your Name"
                required
              />
            </div>

            <div className={fieldCls}>
              <label className={labelCls}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className={inputCls + " min-h-[90px] resize-none"}
                placeholder="A short description about yourself..."
                rows={3}
              />
            </div>

            {/* Contact info */}
            <div className={sectionCls}>
              <h2 className="text-base font-display font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Contact Info
              </h2>
              <div className="space-y-4">
                <div className={fieldCls}>
                  <div className="flex items-center justify-between">
                    <label className={labelCls + " flex items-center gap-1.5"}>
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Phone
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.contactSettings.showPhone}
                        onChange={(e) => setForm((f) => ({ ...f, contactSettings: { ...f.contactSettings, showPhone: e.target.checked } }))}
                        className="accent-primary"
                      />
                      Show on profile
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className={inputCls}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className={fieldCls}>
                  <div className="flex items-center justify-between">
                    <label className={labelCls + " flex items-center gap-1.5"}>
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.contactSettings.showEmail}
                        onChange={(e) => setForm((f) => ({ ...f, contactSettings: { ...f.contactSettings, showEmail: e.target.checked } }))}
                        className="accent-primary"
                      />
                      Show on profile
                    </label>
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className={inputCls}
                    placeholder="you@example.com"
                  />
                </div>

                <div className={fieldCls}>
                  <div className="flex items-center justify-between">
                    <label className={labelCls + " flex items-center gap-1.5"}>
                      <Globe className="w-3.5 h-3.5 text-muted-foreground" /> Website
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.contactSettings.showWebsite}
                        onChange={(e) => setForm((f) => ({ ...f, contactSettings: { ...f.contactSettings, showWebsite: e.target.checked } }))}
                        className="accent-primary"
                      />
                      Show on profile
                    </label>
                  </div>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    className={inputCls}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className={fieldCls}>
                  <div className="flex items-center justify-between">
                    <label className={labelCls + " flex items-center gap-1.5"}>
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Address / Location
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.contactSettings.showLocation !== false}
                        onChange={(e) => setForm((f) => ({ ...f, contactSettings: { ...f.contactSettings, showLocation: e.target.checked } }))}
                        className="accent-primary"
                      />
                      Show on profile
                    </label>
                  </div>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className={inputCls}
                    placeholder="123 Main St, City, State (for businesses with a physical location)"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5 ml-0.5">
                    Visitors will see a “Directions” button that opens this address in Google Maps.
                  </p>
                </div>

                <div className={fieldCls}>
                  <div className="flex items-center justify-between">
                    <label className={labelCls + " flex items-center gap-1.5"}>
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" /> SMS / Text
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.contactSettings.showSms}
                        onChange={(e) => setForm((f) => ({ ...f, contactSettings: { ...f.contactSettings, showSms: e.target.checked } }))}
                        className="accent-primary"
                      />
                      Show on profile
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={form.smsNumber}
                    onChange={(e) => setForm((f) => ({ ...f, smsNumber: e.target.value }))}
                    className={inputCls}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Lead capture */}
            <div className={sectionCls}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-display font-semibold flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    Lead Capture
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Show a "Stay in touch" form on your public profile</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, leadCaptureEnabled: !f.leadCaptureEnabled }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.leadCaptureEnabled ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.leadCaptureEnabled ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Verified badge */}
            <div className={sectionCls}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-display font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Verified Badge
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Show a{" "}
                    <BadgeCheck className="inline w-3.5 h-3.5 text-primary align-text-bottom" />{" "}
                    verified checkmark next to your name on your public profile
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, verified: !f.verified }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.verified ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.verified ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Theme settings */}
            <div className={sectionCls}>
              <h2 className="text-base font-display font-semibold mb-4">Profile Style</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={fieldCls}>
                    <label className={labelCls}>Background color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.themeSettings.backgroundColor || "#0a0a0f"}
                        onChange={(e) => setForm((f) => ({ ...f, themeSettings: { ...f.themeSettings, backgroundColor: e.target.value } }))}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent"
                      />
                      <input
                        type="text"
                        value={form.themeSettings.backgroundColor}
                        onChange={(e) => setForm((f) => ({ ...f, themeSettings: { ...f.themeSettings, backgroundColor: e.target.value } }))}
                        className={inputCls + " flex-1"}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className={fieldCls}>
                    <label className={labelCls}>Text color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.themeSettings.textColor || "#ffffff"}
                        onChange={(e) => setForm((f) => ({ ...f, themeSettings: { ...f.themeSettings, textColor: e.target.value } }))}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-border bg-transparent"
                      />
                      <input
                        type="text"
                        value={form.themeSettings.textColor}
                        onChange={(e) => setForm((f) => ({ ...f, themeSettings: { ...f.themeSettings, textColor: e.target.value } }))}
                        className={inputCls + " flex-1"}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>

                <div className={fieldCls}>
                  <label className={labelCls}>Button style</label>
                  <div className="flex gap-2">
                    {(["rounded", "square", "outline"] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, themeSettings: { ...f.themeSettings, buttonStyle: style } }))}
                        className={`flex-1 py-2 text-xs font-medium border transition-all ${
                          form.themeSettings.buttonStyle === style
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        } ${style === "rounded" ? "rounded-full" : style === "square" ? "rounded-none" : "rounded-lg"}`}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={fieldCls}>
                  <label className={labelCls}>Layout</label>
                  <div className="flex gap-2">
                    {(["classic", "hero"] as const).map((layout) => (
                      <button
                        key={layout}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, themeSettings: { ...f.themeSettings, layout } }))}
                        className={`flex-1 py-2.5 text-xs font-medium rounded-xl border transition-all ${
                          form.themeSettings.layout === layout
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {layout.charAt(0).toUpperCase() + layout.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateProfile.isPending || saved || uploading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-70"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : "Save changes"}
            </button>
          </form>
        )}
      </div>

      {avatarCropSrc && (
        <ImageCropperModal
          imageSrc={avatarCropSrc}
          aspect={1}
          shape="round"
          title="Crop profile picture"
          onCancel={closeAvatarCrop}
          onSave={handleAvatarCropSave}
        />
      )}

      {headerCropSrc && (
        <ImageCropperModal
          imageSrc={headerCropSrc}
          aspect={3 / 1}
          shape="rect"
          title="Crop header image"
          onCancel={closeHeaderCrop}
          onSave={handleHeaderCropSave}
        />
      )}
    </>
  );
}
