import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi } from "@/lib/admin-api";
import { ShieldCheck, Search, Loader2 } from "lucide-react";

const LEVELS = ["none", "blue", "gold", "elite_black"] as const;

export default function AdminVerificationsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [activeQ, setActiveQ] = useState("");
  const [filter, setFilter] = useState<string>("");

  const list = useQuery({
    queryKey: ["admin", "users", "verify", activeQ, filter],
    queryFn: () =>
      adminApi.users({
        q: activeQ,
        limit: 200,
        verification: filter || undefined,
      }),
  });

  const setVerification = useMutation({
    mutationFn: ({ userId, level }: { userId: string; level: string }) =>
      adminApi.setVerification(userId, level),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-semibold">Verifications</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Approve, upgrade, downgrade or remove a user's verification tier. Changes apply
            immediately on their public profile.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {(["blue", "gold", "elite_black"] as const).map((tier) => (
            <div key={tier} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {tier === "elite_black" ? "Elite Black" : tier}
              </p>
              <p className="text-2xl font-display font-semibold mt-1">
                {list.data?.users.filter((u) => u.verificationLevel === tier).length ?? "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveQ(q.trim());
            }}
            className="relative flex-1"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find a user…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-input border border-border text-sm focus:border-primary focus:outline-none"
            />
          </form>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All tiers</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l === "elite_black" ? "Elite Black" : l}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border/60">
          {list.isLoading && (
            <div className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></div>
          )}
          {list.data?.users.map((u) => (
            <div key={u.userId} className="flex flex-col md:flex-row md:items-center gap-3 p-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold shrink-0">
                    {(u.displayName ?? u.email)[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.displayName ?? "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.username ? `@${u.username}` : u.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    disabled={!u.profileId || setVerification.isPending || u.verificationLevel === l}
                    onClick={() => setVerification.mutate({ userId: u.userId, level: l })}
                    className={`text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-md border transition-colors disabled:opacity-100 ${
                      u.verificationLevel === l
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-secondary disabled:opacity-50"
                    }`}
                  >
                    {l === "elite_black" ? "elite" : l}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {list.data && list.data.users.length === 0 && (
            <div className="p-10 text-center text-muted-foreground text-sm">No users found.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
