import { useGetMyProfile, useGetProfileAnalytics, getGetProfileAnalyticsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout";
import { BarChart2, Eye, MousePointerClick, Wifi, TrendingUp, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CHART_STYLE = {
  background: "hsl(240 10% 7%)",
  border: "1px solid hsl(240 10% 14%)",
  borderRadius: "0.5rem",
  fontSize: 12,
  color: "hsl(0 0% 98%)",
};

function StatBadge({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div>
        <p className="text-lg font-display font-semibold">{typeof value === "number" ? value?.toLocaleString() : value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-primary">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: profile } = useGetMyProfile();
  const { data: analytics, isLoading } = useGetProfileAnalytics(
    profile?.id ?? "",
    { query: { enabled: !!profile?.id, queryKey: getGetProfileAnalyticsQueryKey(profile?.id ?? "") } }
  );

  const a = analytics as any;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-display font-semibold">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real data. Real insights.</p>
        </motion.div>

        {isLoading || !analytics ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />
              ))}
            </div>
            <div className="h-56 rounded-2xl bg-card border border-border animate-pulse" />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatBadge label="Total views" value={analytics.totalViews} icon={Eye} />
              <StatBadge label="Link clicks" value={analytics.totalClicks} icon={MousePointerClick} />
              <StatBadge label="NFC taps" value={analytics.totalTaps} icon={Wifi} />
              <StatBadge
                label="Tap → click rate"
                value={`${a.conversionRate ?? 0}%`}
                icon={TrendingUp}
                sub={a.conversionRate > 0 ? "of views clicked a link" : undefined}
              />
            </div>

            {/* Leads + Peak */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-display font-semibold">{a.totalLeads ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Leads captured</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-display font-semibold">
                    {a.peakHour ? a.peakHour.label : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Peak activity hour</p>
                </div>
              </div>
            </div>

            {/* Views over time */}
            <div className="p-5 rounded-2xl border border-border bg-card card-glow mb-6">
              <h2 className="font-display font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Profile views (last 30 days)
              </h2>
              {analytics.viewsByDay.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  <BarChart2 className="w-6 h-6 mr-2 opacity-50" />
                  No view data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={analytics.viewsByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 14%)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }}
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_STYLE} labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <Line type="monotone" dataKey="count" stroke="hsl(262 83% 68%)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "hsl(262 83% 68%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Peak hours chart */}
            <div className="p-5 rounded-2xl border border-border bg-card card-glow mb-6">
              <h2 className="font-display font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Activity by hour of day
              </h2>
              {!a.activityByHour || a.activityByHour.every((h: any) => h.count === 0) ? (
                <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                  <Clock className="w-6 h-6 mr-2 opacity-50" />
                  No activity data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={a.activityByHour.filter((_: any, i: number) => i % 2 === 0)} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 14%)" />
                    <XAxis dataKey="label" tick={{ fill: "hsl(240 5% 55%)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Bar dataKey="count" fill="hsl(262 83% 68%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top links */}
            <div className="p-5 rounded-2xl border border-border bg-card card-glow">
              <h2 className="font-display font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Most clicked links
              </h2>
              {analytics.topLinks.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No link clicks yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.topLinks.map((link, i) => (
                    <motion.div
                      key={link.linkId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs text-muted-foreground font-mono w-5 text-right shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">{link.title}</p>
                          <span className="text-sm text-primary font-semibold ml-3 shrink-0">{link.clicks}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(link.clicks / (analytics.topLinks[0]?.clicks ?? 1)) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="h-full rounded-full gradient-primary"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
