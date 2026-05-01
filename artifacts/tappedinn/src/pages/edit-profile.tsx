import { useState, useEffect, useRef } from "react";
import { useGetMyProfile, useUpdateMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Camera, Phone, Mail, Globe, MessageSquare, BadgeCheck, ExternalLink, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetch(`${BASE_URL}/api/upload/avatar`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.avatar_url as string;
}

export default function EditProfilePage() {
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
    phone: "",
    email: "",
    website: "",
    smsNumber: "",
    leadCaptureEnabled: false,
    verified: false,
    contactSettings: { showPhone: true, showEmail: true, showWebsite: true, showSms: false },
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

  useEffect(() => {
    if (profile) {
      const ts = (profile as any).themeSettings ?? {};
      const cs = (profile as any).contactSettings ?? { showPhone: true, showEmail: true, showWebsite: true, showSms: false };
      setForm({
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl ?? "",
        phone: (profile as any).phone ?? "",
        email: (profile as any).email ?? "",
        website: (profile as any).website ?? "",
        smsNumber: (profile as any).smsNumber ?? "",
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
    }
  }, [profile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      setForm((f) => ({ ...f, avatarUrl: url }));
      setAvatarPreview(url);
    } catch {
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        data: {
          username: form.username,
          displayName: form.displayName,
          bio: form.bio || null,
          avatarUrl: form.avatarUrl || null,
          themeSettings: form.themeSettings,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          smsNumber: form.smsNumber || null,
          leadCaptureEnabled: form.leadCaptureEnabled,
          verified: form.verified,
          contactSettings: form.contactSettings,
        } as any,
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
    <AppLayout>
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
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-display font-semibold">
                    {form.displayName[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-xs text-primary hover:underline font-medium"
              >
                {uploading ? "Uploading..." : "Change photo"}
              </button>
            </div>

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
    </AppLayout>
  );
}
