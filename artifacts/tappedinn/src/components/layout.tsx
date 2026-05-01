import { useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  User,
  Link2,
  Users,
  BarChart2,
  LogOut,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";
import logoImg from "/tappedinn-logo.png";

const APP_NAME = "Tapped Inn Network";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/edit-profile", label: "Profile", icon: User },
  { href: "/edit-links", label: "Links", icon: Link2 },
  { href: "/modes", label: "Modes", icon: Layers },
  { href: "/connections", label: "Connections", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
          <img src={logoImg} alt="Tapped Inn" className="w-9 h-9 object-contain shrink-0" style={{ filter: "invert(1)" }} />
          <span className="font-display font-semibold text-sidebar-foreground text-sm leading-tight">{APP_NAME}</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border space-y-1">
          {/* Order Your Tapped Inn Card link */}
          <a
            href="https://tappedinn.net/products/digital-business-card?variant=48403047088378"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            Order Your Tapped Inn Card
          </a>

          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mt-1">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                {(user.firstName?.[0] ?? user.emailAddresses?.[0]?.emailAddress?.[0] ?? "U").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.firstName ?? "User"}
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

      {/* Mobile header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Tapped Inn" className="w-7 h-7 object-contain" style={{ filter: "invert(1)" }} />
            <span className="font-display font-semibold text-sm">{APP_NAME}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = location === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
