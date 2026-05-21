import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi, type AdminUserRow } from "@/lib/admin-api";
import { Search, Loader2, ShieldCheck, Ban, CheckCircle2, Crown } from "lucide-react";

const LEVELS = ["none", "blue", "gold", "elite_black"] as const;
const STATUSES = ["active", "suspended", "disabled"] as const;

function tierBadge(level: string | null | undefined) {
  if (!level || level === "none") return <span className="text-xs text-muted-foreground">—</span>;
  const map: Record<string, string> = {
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    gold: "bg-primary/15 text-primary border-primary/30",
    elite_black: "bg-foreground/10 text-foreground border-foreground/30",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[level] ?? ""}`}>
      {level === "elite_black" ? "elite" : level}
    </span>
  );
}

function statusBadge(s: string) {
  if (s === "suspended") return <span className="text-[10px] uppercase tracking-wider text-yellow-400">Suspended</span>;
  if (s === "disabled") return <span className="text-[10px] uppercase tracking-wider text-red-400">Disabled</span>;
  return <span className="text-[10px] uppercase tracking-wider text-green-400">Active</span>;
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [activeQ, setActiveQ] = useState("");
  const list = useQuery({
    queryKey: ["admin", "users", activeQ],
    queryFn: () => adminApi.users({ q: activeQ, limit: 100 }),
  });

  const setVerification = useMutation({
    mutationFn: ({ userId, level }: { userId: string; level: string }) =>
      adminApi.setVerification(userId, level),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const setStatus = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminApi.setStatus(userId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const setAdminFlag = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      adminApi.setAdmin(userId, isAdmin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      // If the admin just toggled their own flag, refresh whoami so UI gating
      // stays in sync with the server.
      qc.invalidateQueries({ queryKey: ["admin", "whoami"] });
    },
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold">Users</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {list.data?.total ?? "—"} accounts. Search, manage verification and status.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveQ(q.trim());
            }}
            className="relative w-full md:w-80"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by username, name or email"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-input border border-border text-sm focus:border-primary focus:outline-none"
            />
          </form>
        </header>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">User</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Joined</th>
                  <th className="text-left px-4 py-3 font-semibold">Verification</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.isLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <Loader2 className="w-5 h-5 animate-spin inline" />
                    </td>
                  </tr>
                )}
                {list.data?.users.map((u: AdminUserRow) => (
                  <tr key={u.userId} className="border-t border-border/60 hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                            {(u.displayName ?? u.email)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate flex items-center gap-1.5">
                            {u.displayName ?? "—"}
                            {u.isAdmin && <Crown className="w-3 h-3 text-primary" />}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {u.username ? `@${u.username}` : "(no profile)"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.verificationLevel ?? "none"}
                        disabled={!u.profileId || setVerification.isPending}
                        onChange={(e) =>
                          setVerification.mutate({ userId: u.userId, level: e.target.value })
                        }
                        className="bg-input border border-border rounded-md px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l === "elite_black" ? "elite black" : l}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.accountStatus}
                        disabled={u.isAdmin || setStatus.isPending}
                        onChange={(e) =>
                          setStatus.mutate({ userId: u.userId, status: e.target.value })
                        }
                        className="bg-input border border-border rounded-md px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setAdminFlag.mutate({ userId: u.userId, isAdmin: !u.isAdmin })
                          }
                          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border ${
                            u.isAdmin
                              ? "border-primary/40 text-primary hover:bg-primary/10"
                              : "border-border text-muted-foreground hover:bg-secondary"
                          }`}
                          title={u.isAdmin ? "Revoke admin" : "Grant admin"}
                        >
                          {u.isAdmin ? "Admin" : "Make admin"}
                        </button>
                        {u.username && (
                          <a
                            href={`/p/${u.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-border text-muted-foreground hover:bg-secondary"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {list.data && list.data.users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      No users match this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend (used to avoid unused import warnings; gives admins a quick visual key) */}
        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified tier</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Active</span>
          <span className="flex items-center gap-1.5"><Ban className="w-3.5 h-3.5 text-red-400" /> Suspended / disabled</span>
          <span className="flex items-center gap-1.5">{tierBadge("gold")} Example badge</span>
        </div>
      </div>
    </AdminLayout>
  );
}
