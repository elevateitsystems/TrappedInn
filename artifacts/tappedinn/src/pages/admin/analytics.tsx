import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi } from "@/lib/admin-api";
import { BarChart2 } from "lucide-react";

export default function AdminAnalyticsPage() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: adminApi.stats });
  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-semibold">Platform Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            High-level platform metrics. Per-profile analytics live on each user's analytics page.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Users</p>
            <p className="text-3xl font-display font-semibold mt-1">{stats.data?.totalUsers ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Profiles created</p>
            <p className="text-3xl font-display font-semibold mt-1">{stats.data?.totalProfiles ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Verified users</p>
            <p className="text-3xl font-display font-semibold mt-1">{stats.data?.verifiedUsers ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">New signups (7d)</p>
            <p className="text-3xl font-display font-semibold mt-1">{stats.data?.newSignups7d ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">NFC taps (7d)</p>
            <p className="text-3xl font-display font-semibold mt-1">{stats.data?.taps7d ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending orders</p>
            <p className="text-3xl font-display font-semibold mt-1">{stats.data?.pendingOrders ?? "—"}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          More charts (time series, cohort retention, tier funnel) are wired up next.
        </p>
      </div>
    </AdminLayout>
  );
}
