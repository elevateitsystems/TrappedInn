import { Link, useLocation, Redirect } from "wouter";
import {
  LayoutDashboard,
  Users as UsersIcon,
  ShieldCheck,
  ShoppingBag,
  BarChart2,
  Settings,
  LogOut,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import { cn } from "@/lib/utils";
import logoImg from "/tappedinn-logo.png";
import { useIsAdmin } from "@/hooks/use-is-admin";

const APP_NAME = "Tapped Inn Network";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isLoaded, isAdmin } = useIsAdmin();

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }
  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-5 py-4 border-b border-border hover:bg-sidebar-accent/40 transition-colors"
          title="Back to your dashboard"
        >
          <img
            src={logoImg}
            alt="Tapped Inn"
            className="w-9 h-9 object-contain shrink-0"
            style={{ filter: "invert(1)" }}
          />
          <div className="min-w-0">
            <p className="font-display font-semibold text-sidebar-foreground text-sm leading-tight truncate">
              {APP_NAME}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">
              Admin Console
            </p>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? location === href
              : location === href || location.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Back to app
          </Link>
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mt-1">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                {(user.firstName?.[0] ?? user.emailAddresses?.[0]?.emailAddress?.[0] ?? "A").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.firstName ?? "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <Link href="/dashboard" className="flex items-center gap-2" title="Back to your dashboard">
            <img src={logoImg} alt="Tapped Inn" className="w-7 h-7 object-contain" style={{ filter: "invert(1)" }} />
            <span className="font-display font-semibold text-sm">Admin</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-muted-foreground">
            Exit
          </Link>
        </header>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 5).map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? location === href : location.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
