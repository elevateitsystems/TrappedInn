import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi } from "@/lib/admin-api";
import { Users, ShieldCheck, ShoppingBag, TrendingUp, Activity, UserPlus } from "lucide-react";
import { Link } from "wouter";

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="text-3xl font-display font-semibold">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: adminApi.stats });
  const signups = useQuery({ queryKey: ["admin", "signups"], queryFn: adminApi.signups });
  const activity = useQuery({ queryKey: ["admin", "activity"], queryFn: adminApi.activity });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform overview, recent signups and activity.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <Stat label="Total Users" value={stats.data?.totalUsers ?? "—"} icon={Users} />
          <Stat label="Profiles" value={stats.data?.totalProfiles ?? "—"} icon={UserPlus} />
          <Stat label="Verified" value={stats.data?.verifiedUsers ?? "—"} icon={ShieldCheck} />
          <Stat label="Pending Orders" value={stats.data?.pendingOrders ?? "—"} icon={ShoppingBag} />
          <Stat label="Signups (7d)" value={stats.data?.newSignups7d ?? "—"} icon={TrendingUp} />
          <Stat label="Taps (7d)" value={stats.data?.taps7d ?? "—"} icon={Activity} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold">New signups</h2>
              <Link href="/admin/users" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {signups.data?.signups.length ? (
                signups.data.signups.map((s) => (
                  <div key={s.userId} className="flex items-center justify-between text-sm py-2 border-b border-border/60 last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {s.displayName ?? s.username ?? s.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.username ? `@${s.username}` : s.email}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-3">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No signups yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold mb-3">Recent admin activity</h2>
            <div className="space-y-2">
              {activity.data?.activity.length ? (
                activity.data.activity.slice(0, 10).map((a) => (
                  <div key={a.id} className="text-sm py-2 border-b border-border/60 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-primary">{a.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {a.metadata && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {JSON.stringify(a.metadata)}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
