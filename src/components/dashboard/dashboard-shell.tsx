"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Layers,
  LayoutDashboard,
  Link2,
  LogOut,
  Shield,
  ShieldCheck,
  ShoppingBag,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const APP_NAME = "Tapped Inn Network";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/edit-profile", label: "Profile", icon: User },
  { href: "/edit-links", label: "Links", icon: Link2 },
  { href: "/modes", label: "Modes", icon: Layers },
  { href: "/connections", label: "Connections", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/verification", label: "Get Verified", icon: ShieldCheck },
];

function BrandLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 border-border transition-colors hover:bg-sidebar-accent/40"
      title="Back to your dashboard"
    >
      <Image
        src="/logo.jpg"
        alt="Tapped Inn"
        width={compact ? 28 : 36}
        height={compact ? 28 : 36}
        className={cn("object-contain shrink-0", compact ? "h-7 w-7" : "h-9 w-9")}
        style={{ filter: "invert(1)" }}
      />
      <span
        className={cn(
          "font-display font-semibold leading-tight",
          compact ? "text-sm" : "text-sidebar-foreground text-sm"
        )}
      >
        {APP_NAME}
      </span>
    </Link>
  );
}

function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = mobile ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

        if (mobile) {
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg p-2 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

function SidebarFooter() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const isAdmin = false;

  return (
    <div className="border-t border-border px-3 py-4 space-y-1">
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Shield className="h-4 w-4 shrink-0" />
          Admin Console
        </Link>
      )}
      <a
        href="https://www.TappedInn.net"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <ShoppingBag className="h-4 w-4 shrink-0" />
        Order Your Tapped Inn Card
      </a>

      {user && (
        <div className="mt-1 flex items-center gap-3 px-3 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {(user.firstName?.[0] ?? user.emailAddresses?.[0]?.emailAddress?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user.firstName ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => signOut({ redirectUrl: "/" })}
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}

function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="border-b border-border px-5 py-4">
        <BrandLink />
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <DashboardNav />
      </nav>
      <SidebarFooter />
    </aside>
  );
}

function MobileChrome() {
  const { signOut } = useClerk();

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <BrandLink compact />
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="flex items-center justify-around">
          <DashboardNav mobile />
        </div>
      </div>
    </>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <DesktopSidebar />
      <div className="flex min-h-dvh flex-col md:pl-60">
        <MobileChrome />
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
