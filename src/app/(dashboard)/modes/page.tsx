"use client";
import { useState } from "react";

import { useGetMyProfile } from "@/lib/api-client";
import { Layers, Plus, Pencil, Trash2, Check, X, Loader2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const PRESET_MODES = [
  { label: "Business", emoji: "💼", description: "Professional links, contact info front and center" },
  { label: "Creative", emoji: "🎨", description: "Portfolio, artwork, creative projects" },
  { label: "Event", emoji: "⚡", description: "Tailored for a specific event or conference" },
  { label: "Personal", emoji: "🌟", description: "Personal social, casual bio" },
];

async function readJsonResponse(res: Response) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

interface Mode {
  id: string;
  label: string;
  emoji: string;
  displayName: string;
  bio: string | null;
  themeSettings: Record<string, unknown>;
  isActive: boolean;
  position: number;
}

function useModes(profileId: string | undefined) {
  const [modes, setModes] = useState<Mode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchModes = async () => {
    if (!profileId || fetched) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/modes`, { credentials: "include" });
      const data = await readJsonResponse(res);
      setModes(Array.isArray(data) ? data : []);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  return { modes, loading, fetchModes, setModes };
}

function ModeCard({
  mode,
  onActivate,
  onDeactivate,
  onEdit,
  onDelete,
  activating,
}: {
  mode: Mode;
  onActivate: () => void;
  onDeactivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  activating: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 rounded-2xl border transition-all ${
        mode.isActive
          ? "border-primary/50 bg-primary/5 shadow-[0_0_0_1px_hsl(262_83%_68%/0.2)]"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none mt-0.5 shrink-0">{mode.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-semibold text-sm">{mode.label}</span>
            {mode.isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-medium">
                <Zap className="w-2.5 h-2.5" />
                Active
              </span>
            )}
          </div>
          <p className="text-sm font-medium mt-0.5">{mode.displayName}</p>
          {mode.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mode.bio}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {mode.isActive ? (
          <button
            onClick={onDeactivate}
            disabled={activating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            {activating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            Use default profile
          </button>
        ) : (
          <button
            onClick={onActivate}
            disabled={activating}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {activating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Activate this mode
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface ModeForm {
  label: string;
  emoji: string;
  displayName: string;
  bio: string;
}

function ModeFormPanel({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: ModeForm;
  onSave: (data: ModeForm) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ModeForm>(initial);
  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
        <div className="flex gap-2">
          <div className="flex flex-col gap-1.5 w-20">
            <label className="text-xs font-medium text-foreground">Emoji</label>
            <input
              type="text"
              value={form.emoji}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
              maxLength={2}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-foreground">Mode name</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className={inputCls}
              placeholder="Business, Creative, Event..."
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Display name (shown on profile)</label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            className={inputCls}
            placeholder="Your Name — Title"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Bio for this mode</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className={inputCls + " min-h-[72px] resize-none"}
            placeholder="What do you want to say in this context?"
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={saving || !form.label || !form.displayName}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save mode
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ModesPage() {
  const { data: profile } = useGetMyProfile();
  const { modes, loading, fetchModes, setModes } = useModes(profile?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  if (profile && !loading && modes === null) {
    fetchModes();
  }

  const handleCreate = async (form: ModeForm) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/modes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const mode = await readJsonResponse(res);
      setModes((prev) => [...(prev ?? []), mode]);
      setShowCreate(false);
      toast({ title: "Mode created" });
    } catch (error) {
      toast({
        title: "Create failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, form: ModeForm) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/modes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const updated = await readJsonResponse(res);
      setModes((prev) => prev?.map((m) => (m.id === id ? updated : m)) ?? null);
      setEditingId(null);
      toast({ title: "Mode updated" });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/modes/${id}`, { method: "DELETE", credentials: "include" });
      await readJsonResponse(res);
      setModes((prev) => prev?.filter((m) => m.id !== id) ?? null);
      toast({ title: "Mode deleted" });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleActivate = async (id: string) => {
    setActivatingId(id);
    try {
      const res = await fetch(`/api/modes/${id}/activate`, {
        method: "POST",
        credentials: "include",
      });
      const updated = await readJsonResponse(res);
      setModes((prev) => prev?.map((m) => ({ ...m, isActive: m.id === id ? updated.isActive : false })) ?? null);
    } catch (error) {
      toast({
        title: "Activation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActivatingId(null);
    }
  };

  const handleDeactivate = async () => {
    setActivatingId("deactivate");
    try {
      const res = await fetch(`/api/modes/deactivate`, { method: "POST", credentials: "include" });
      await readJsonResponse(res);
      setModes((prev) => prev?.map((m) => ({ ...m, isActive: false })) ?? null);
    } catch (error) {
      toast({
        title: "Deactivate failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActivatingId(null);
    }
  };

  const activeMode = modes?.find((m) => m.isActive);

  return (
    
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-display font-semibold">Profile Modes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Switch context in seconds. Same account, different identity for every situation.
          </p>
        </motion.div>

        {/* Active mode banner */}
        <AnimatePresence>
          {activeMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-2xl border border-primary/40 bg-primary/8 flex items-center gap-3"
            >
              <span className="text-2xl">{activeMode.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary font-medium uppercase tracking-wide">Currently active</p>
                <p className="font-display font-semibold text-sm">{activeMode.label} Mode</p>
                <p className="text-xs text-muted-foreground truncate">{activeMode.displayName}</p>
              </div>
              <Zap className="w-4 h-4 text-primary shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Presets — only show if no modes yet */}
        {modes !== null && modes.length === 0 && !showCreate && (
          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Quick start</p>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_MODES.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setShowCreate(true);
                  }}
                  className="p-3 rounded-xl border border-border bg-card text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div className="text-xl mb-1">{preset.emoji}</div>
                  <p className="text-sm font-semibold">{preset.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create new mode */}
        <AnimatePresence>
          {showCreate && (
            <div className="mb-4">
              <ModeFormPanel
                initial={{ label: "", emoji: "✨", displayName: profile?.displayName ?? "", bio: "" }}
                onSave={handleCreate}
                onCancel={() => setShowCreate(false)}
                saving={saving}
              />
            </div>
          )}
        </AnimatePresence>

        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all mb-4"
          >
            <Plus className="w-4 h-4" />
            New mode
          </button>
        )}

        {/* Mode list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : modes && modes.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {modes.map((mode) =>
                editingId === mode.id ? (
                  <motion.div
                    key={mode.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ModeFormPanel
                      initial={{ label: mode.label, emoji: mode.emoji, displayName: mode.displayName, bio: mode.bio ?? "" }}
                      onSave={(form) => handleUpdate(mode.id, form)}
                      onCancel={() => setEditingId(null)}
                      saving={saving}
                    />
                  </motion.div>
                ) : (
                  <ModeCard
                    key={mode.id}
                    mode={mode}
                    onActivate={() => handleActivate(mode.id)}
                    onDeactivate={handleDeactivate}
                    onEdit={() => setEditingId(mode.id)}
                    onDelete={() => handleDelete(mode.id)}
                    activating={activatingId === mode.id || activatingId === "deactivate"}
                  />
                )
              )}
            </AnimatePresence>
          </div>
        ) : null}

        {/* How it works */}
        <div className="mt-8 p-5 rounded-2xl border border-border bg-card/50">
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            How modes work
          </h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>Each mode overrides your name and bio on your public profile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>Your links stay the same — update them in the Links tab</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>Visitors see "Business Mode" or "Creative Mode" on your profile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">→</span>
              <span>Tap the NFC card — the active mode is always what people see</span>
            </li>
          </ul>
        </div>
      </div>
    
  );
}
