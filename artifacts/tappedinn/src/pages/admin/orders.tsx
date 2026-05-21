import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi } from "@/lib/admin-api";
import { Plus, Loader2, ShoppingBag } from "lucide-react";

const STATUSES = ["pending", "approved", "rejected", "refunded"] as const;
const TIERS = ["blue", "gold", "elite_black"] as const;

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [newOrder, setNewOrder] = useState({
    username: "",
    email: "",
    tier: "gold",
    externalOrderId: "",
    amountCents: "",
    notes: "",
  });

  const list = useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: () => adminApi.orders(filter || undefined),
  });

  const createOrder = useMutation({
    mutationFn: () => adminApi.createOrder(newOrder as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      setCreating(false);
      setNewOrder({ username: "", email: "", tier: "gold", externalOrderId: "", amountCents: "", notes: "" });
    },
  });

  const updateOrder = useMutation({
    mutationFn: ({ orderId, status, applyVerification }: { orderId: string; status: string; applyVerification?: boolean }) =>
      adminApi.updateOrder(orderId, { status, applyVerification }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h1 className="text-2xl md:text-3xl font-display font-semibold">Orders</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Verification purchases. Approve to mark paid; approve + apply to grant the tier
              automatically. Shopify webhooks will write here once wired.
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setCreating((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> New order
            </button>
          </div>
        </header>

        {creating && (
          <div className="rounded-2xl border border-border bg-card p-4 mb-4">
            <h2 className="font-display font-semibold mb-3">Record a manual order</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <input
                placeholder="Username (preferred)"
                value={newOrder.username}
                onChange={(e) => setNewOrder({ ...newOrder, username: e.target.value })}
                className="bg-input border border-border rounded-lg px-3 py-2 text-sm"
              />
              <input
                placeholder="Email (fallback)"
                value={newOrder.email}
                onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
                className="bg-input border border-border rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={newOrder.tier}
                onChange={(e) => setNewOrder({ ...newOrder, tier: e.target.value })}
                className="bg-input border border-border rounded-lg px-3 py-2 text-sm"
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t === "elite_black" ? "elite black" : t}
                  </option>
                ))}
              </select>
              <input
                placeholder="External order # (Shopify, etc.)"
                value={newOrder.externalOrderId}
                onChange={(e) => setNewOrder({ ...newOrder, externalOrderId: e.target.value })}
                className="bg-input border border-border rounded-lg px-3 py-2 text-sm"
              />
              <input
                placeholder="Amount (cents)"
                value={newOrder.amountCents}
                onChange={(e) => setNewOrder({ ...newOrder, amountCents: e.target.value })}
                className="bg-input border border-border rounded-lg px-3 py-2 text-sm"
              />
              <input
                placeholder="Notes"
                value={newOrder.notes}
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                className="bg-input border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={createOrder.isPending}
                onClick={() => createOrder.mutate()}
                className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50"
              >
                {createOrder.isPending ? "Saving…" : "Create"}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Created</th>
                  <th className="text-left px-4 py-3 font-semibold">User</th>
                  <th className="text-left px-4 py-3 font-semibold">Tier</th>
                  <th className="text-left px-4 py-3 font-semibold">Source</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.isLoading && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
                )}
                {list.data?.orders.map((o) => (
                  <tr key={o.id} className="border-t border-border/60">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.username ? `@${o.username}` : (o.email ?? "—")}</p>
                      {o.userId ? (
                        <p className="text-xs text-green-400">linked</p>
                      ) : (
                        <p className="text-xs text-yellow-400">no match</p>
                      )}
                    </td>
                    <td className="px-4 py-3 uppercase text-xs">
                      {o.tier === "elite_black" ? "elite" : o.tier}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{o.source}</td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={
                          o.status === "approved"
                            ? "text-green-400"
                            : o.status === "pending"
                              ? "text-yellow-400"
                              : "text-red-400"
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {o.status === "pending" && (
                          <>
                            <button
                              type="button"
                              disabled={!o.userId || updateOrder.isPending}
                              onClick={() =>
                                updateOrder.mutate({
                                  orderId: o.id,
                                  status: "approved",
                                  applyVerification: true,
                                })
                              }
                              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                              title={!o.userId ? "No user linked" : "Approve and apply verification"}
                            >
                              Approve + Apply
                            </button>
                            <button
                              type="button"
                              disabled={updateOrder.isPending}
                              onClick={() =>
                                updateOrder.mutate({ orderId: o.id, status: "approved" })
                              }
                              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-border text-muted-foreground hover:bg-secondary"
                            >
                              Mark paid
                            </button>
                            <button
                              type="button"
                              disabled={updateOrder.isPending}
                              onClick={() =>
                                updateOrder.mutate({ orderId: o.id, status: "rejected" })
                              }
                              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {o.status !== "pending" && (
                          <button
                            type="button"
                            disabled={updateOrder.isPending}
                            onClick={() =>
                              updateOrder.mutate({ orderId: o.id, status: "pending" })
                            }
                            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md border border-border text-muted-foreground hover:bg-secondary"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {list.data && list.data.orders.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">No orders.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
