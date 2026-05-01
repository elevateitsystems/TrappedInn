import { useState, useEffect } from "react";
import { useGetDashboardSummary, useGetRecentActivity, useGetMyProfile } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { Eye, Link2, Users, Wifi, MousePointerClick, Clock, User, Layers, Zap } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
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
      <p className="text-2xl font-display font-semibold">{value.toLocaleString()}</p>
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
          <p className="text-muted-foreground mt-1">
            {profile ? (
              <>Your profile is live at{" "}
                <Link href={`/p/${profile.username}`} className="text-primary hover:underline">
                  /p/{profile.username}
                </Link>
              </>
            ) : "Loading your profile..."}
          </p>
        </motion.div>

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
            ) : !activity || activity.length === 0 ? (
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
