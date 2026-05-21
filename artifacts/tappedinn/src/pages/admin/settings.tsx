import { AdminLayout } from "@/components/admin-layout";
import { Settings as SettingsIcon } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-semibold">Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Platform configuration. More controls land here as features ship.
          </p>
        </header>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold mb-1">Admin access</h2>
            <p className="text-sm text-muted-foreground">
              Grant or revoke admin from the <strong>Users</strong> page. A safeguard prevents
              removing the last admin.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold mb-1">Shopify webhook (coming)</h2>
            <p className="text-sm text-muted-foreground">
              Verification orders are recorded in the orders table. Wiring a Shopify webhook to{" "}
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">/api/admin/orders</code>{" "}
              is the next step — admin still approves before the tier applies, or you can auto-apply
              by matching the customer email/username.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display font-semibold mb-1">Verification tiers</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong className="text-blue-400">Blue</strong> — verified badge, premium themes, search priority</li>
              <li><strong className="text-primary">Gold</strong> — all Blue perks + animations, higher search priority</li>
              <li><strong>Elite Black</strong> — all Gold perks + elite themes + homepage spotlight</li>
            </ul>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
