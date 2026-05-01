import { useState, useEffect } from "react";
import { useGetMyProfile, useUpdateMyProfile, getGetMyProfileQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EditProfilePage() {
  const { data: profile, isLoading } = useGetMyProfile();
  const updateProfile = useUpdateMyProfile();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl ?? "",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        data: {
          username: form.username,
          displayName: form.displayName,
          bio: form.bio || null,
          avatarUrl: form.avatarUrl || null,
        },
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

  const field = "flex flex-col gap-1.5";
  const label = "text-sm font-medium text-foreground";
  const input = "px-4 py-2.5 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-display font-semibold">Edit Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your public identity on TappedInn</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className={field}>
              <label className={label}>Username</label>
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

            <div className={field}>
              <label className={label}>Display name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className={input}
                placeholder="Your Name"
                required
              />
            </div>

            <div className={field}>
              <label className={label}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className={input + " min-h-[90px] resize-none"}
                placeholder="A short description about yourself..."
                rows={3}
              />
            </div>

            <div className={field}>
              <label className={label}>Avatar URL</label>
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                className={input}
                placeholder="https://..."
              />
              {form.avatarUrl && (
                <img
                  src={form.avatarUrl}
                  alt="Avatar preview"
                  className="w-14 h-14 rounded-full object-cover mt-1 border border-border"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={updateProfile.isPending || saved}
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
