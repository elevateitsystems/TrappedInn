import { useState, useEffect } from "react";
import { useGetDashboardSummary, useGetRecentActivity, useGetMyProfile } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { Eye, Link2, Users, Wifi, MousePointerClick, Clock, User, Layers, Share2, Copy, Check, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import { VerifiedBadge, type VerificationLevel } from "@/components/verified-badge";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

function useActiveMode(profileId: string | undefined) {
  const [activeMode, setActiveMode] = useState<{ label: string; emoji: string } | null>(null);

  useEffect(() => {
    if (!profileId) return;
    fetch(`${BASE_URL}/api/modes`, { credentials: "include" })
      .then((r) => r.json())
      .then((modes: any[]) => {
        const active = modes.find((m) => m.isActive);
        setActiveMode(active ?? null);
      })
      .catch(() => {});
  }, [profileId]);

  return activeMode;
}

function ShareCard({ username }: { username: string }) {
  const profileUrl = `${window.location.origin}/p/${username}`;
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: "My Tapped Inn profile",
          text: "Check out my digital profile",
          url: profileUrl,
        });
        return;
      } catch {
        // User cancelled or error — fall through to copy
      }
    }
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="mb-6 p-4 rounded-2xl border border-border bg-card"
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Your profile link</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-input border border-border min-w-0">
          <span className="text-sm text-muted-foreground truncate flex-1 font-mono select-all">{profileUrl}</span>
        </div>
        <button
          onClick={handleCopy}
          title="Copy link"
          className="shrink-0 p-2.5 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span key="check" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
                <Check className="w-4 h-4 text-green-400" />
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
                <Copy className="w-4 h-4 text-muted-foreground" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <a
          href={`/p/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Open profile"
          className="shrink-0 p-2.5 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
        <button
          onClick={handleShare}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = "primary",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card card-glow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center",
          color === "primary" ? "bg-primary/15" : "bg-accent"
        )}>
          <Icon className={cn("w-4.5 h-4.5", color === "primary" ? "text-primary" : "text-accent-foreground")} />
        </div>
      </div>
      <p className="text-2xl font-display font-semibold">{value?.toLocaleString()||"--"}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

const eventTypeLabel: Record<string, string> = {
  view: "Profile view",
  click: "Link click",
  tap: "NFC tap",
};

const eventTypeIcon: Record<string, React.ElementType> = {
  view: Eye,
  click: MousePointerClick,
  tap: Wifi,
};

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();
  const { data: profile } = useGetMyProfile();
  const activeMode = useActiveMode(profile?.id);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-display font-semibold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your profile overview and quick actions</p>
        </motion.div>

        {/* Share card */}
        {profile && <ShareCard username={profile.username} />}

        {/* Get Verified CTA */}
        {profile && (() => {
          const level = (profile.verificationLevel ?? "none") as VerificationLevel;
          const isVerified = level !== "none";
          return (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Link
                href="/verification"
                className="flex items-center gap-4 px-4 py-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent hover:border-primary/60 transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  {isVerified ? (
                    <VerifiedBadge level={level} size="md" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-semibold flex items-center gap-1.5">
                    {isVerified
                      ? `You're ${level === "blue" ? "Blue" : level === "gold" ? "Gold" : "Elite Black"} Verified`
                      : "Get Tapped Inn Verified"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isVerified
                      ? "Manage your verification or upgrade your rank"
                      : "Lifetime badge from $25. Boost trust, unlock premium perks."}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </motion.div>
          );
        })()}

        {/* Active mode banner */}
        {activeMode && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl border border-primary/30 bg-primary/8"
          >
            <span className="text-xl">{activeMode.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary font-medium">Active mode</p>
              <p className="text-sm font-display font-semibold">{activeMode.label}</p>
            </div>
            <Link href="/modes" className="text-xs text-primary hover:underline font-medium shrink-0">
              Switch
            </Link>
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { href: "/edit-profile", label: "Edit profile", icon: User },
            { href: "/edit-links", label: "Manage links", icon: Link2 },
            { href: "/modes", label: "Switch mode", icon: Layers },
            { href: "/connections", label: "Connections", icon: Users },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent hover:border-primary/30 transition-all"
            >
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </Link>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {summaryLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-card border border-border animate-pulse" />
            ))
          ) : summary ? (
            <>
              <StatCard label="Profile views" value={summary.profileViews} icon={Eye} />
              <StatCard label="Link clicks" value={summary.linkClicks} icon={MousePointerClick} />
              <StatCard label="NFC taps" value={summary.nfcTaps} icon={Wifi} color="accent" />
              <StatCard label="Links" value={summary.totalLinks} icon={Link2} color="accent" />
              <StatCard label="Connections" value={summary.totalConnections} icon={Users} color="accent" />
            </>
          ) : null}
        </div>

        {/* Recent activity */}
        <div>
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent activity
          </h2>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {activityLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
            ) : !Array.isArray(activity) || activity.length === 0 ? (
              <div className="p-12 text-center">
                <Eye className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No activity yet.</p>
                <p className="text-muted-foreground/70 text-xs mt-1">Share your profile link to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activity.map((event, i) => {
                  const Icon = eventTypeIcon[event.eventType] ?? Eye;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-5 py-3.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{eventTypeLabel[event.eventType] ?? event.eventType}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
