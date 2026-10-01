import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminMe, useAdminLogout } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, testid: "overview" },
  { href: "/admin/posts", label: "Posts", icon: FileText, testid: "posts" },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox, testid: "submissions" },
] as const;

const SIDEBAR_KEY = "admin-sidebar-collapsed";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function isActive(path: string, href: string) {
  if (href === "/admin") return path === "/admin";
  return path === href || path.startsWith(`${href}/`);
}

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "true";
  } catch {
    return false;
  }
}

export function AdminLayout(props: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: authenticated, isLoading, isError, refetch } = useAdminMe();
  const logout = useAdminLogout();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    if (!isLoading && authenticated === false) {
      navigate("/admin/login", { replace: true });
    }
  }, [isLoading, authenticated, navigate]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next));
      } catch {
        // storage unavailable (private mode); the toggle still works for this visit
      }
      return next;
    });
  }

  function signOut() {
    logout.mutate(undefined, {
      onError: () =>
        toast({
          title: "Could not sign out",
          description: "Check your connection and try again.",
          variant: "destructive",
        }),
    });
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen grid place-items-center text-sm text-muted-foreground"
        role="status"
        data-testid="admin-loading"
      >
        Checking your session…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen grid place-items-center px-4" data-testid="admin-session-error">
        <div className="max-w-sm text-center" role="alert">
          <h1 className="font-sans text-lg font-semibold">Can't reach the server</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We couldn't confirm your session. Your work is safe; try again in a moment.
          </p>
          <Button className="mt-4" onClick={() => refetch()} data-testid="admin-session-retry">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background md:flex">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus:ring-2 focus:ring-ring"
        data-testid="admin-skip-link"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex md:shrink-0 md:flex-col md:overflow-hidden md:border-r md:border-border/70 md:bg-card md:transition-[width] md:duration-200 md:ease-out",
          collapsed ? "md:w-16" : "md:w-[248px]",
        )}
        data-testid="admin-sidebar"
      >
        <div
          className={cn(
            "flex items-center gap-2 py-6",
            collapsed ? "flex-col justify-center px-2" : "justify-between px-4",
          )}
        >
          {collapsed ? (
            <div
              className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary/10"
              data-testid="admin-brand-mark-collapsed"
            >
              <img
                src="/images/logo.png"
                alt="GAD Consult"
                className="h-8 w-8 object-cover object-left"
              />
            </div>
          ) : (
            <BrandMark className="w-fit dark:rounded-lg dark:bg-white dark:px-2 dark:py-1" />
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted/70 hover:text-foreground",
              focusRing,
              collapsed && "mt-2",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            data-testid="admin-sidebar-collapse-toggle"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav
          aria-label="Admin"
          className={cn("flex flex-1 flex-col gap-1", collapsed ? "px-2" : "px-3")}
          data-testid="admin-sidebar-nav"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(location, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200",
                  focusRing,
                  collapsed ? "justify-center px-0" : "px-3",
                  active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
                data-testid={`admin-nav-${item.testid}`}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active && "text-admin-accent")} aria-hidden="true" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
        <div
          className={cn(
            "flex items-center gap-2 border-t border-border/70 py-4",
            collapsed ? "flex-col px-2" : "justify-between px-3",
          )}
        >
          <button
            type="button"
            onClick={signOut}
            disabled={logout.isPending}
            title={collapsed ? "Log out" : undefined}
            aria-label={collapsed ? "Log out" : undefined}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-muted/70 hover:text-foreground disabled:opacity-60",
              focusRing,
              collapsed ? "justify-center px-0" : "flex-1 px-3",
            )}
            data-testid="admin-logout-button"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!collapsed && (logout.isPending ? "Logging out…" : "Log out")}
          </button>
          <ThemeToggle data-testid="admin-theme-toggle" />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Mobile top nav */}
        <header className="border-b border-border/70 bg-card md:hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="text-base font-semibold" data-testid="admin-header-title-mobile">
              GAD Admin
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle data-testid="admin-theme-toggle-mobile" />
              <button
                type="button"
                onClick={signOut}
                disabled={logout.isPending}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-muted/70 hover:text-foreground disabled:opacity-60",
                  focusRing,
                )}
                data-testid="admin-logout-button-mobile"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {logout.isPending ? "Logging out…" : "Log out"}
              </button>
            </div>
          </div>
          <nav aria-label="Admin" className="flex items-center gap-1 px-3 pb-3" data-testid="admin-mobile-nav">
            {NAV_ITEMS.map((item) => {
              const active = isActive(location, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-semibold transition-colors duration-200",
                    focusRing,
                    active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                  data-testid={`admin-nav-mobile-${item.testid}`}
                >
                  <Icon className={cn("h-4 w-4", active && "text-admin-accent")} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main
          id="admin-main"
          tabIndex={-1}
          className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 focus:outline-none sm:px-6 md:py-10 lg:px-8"
        >
          {props.children}
        </main>
      </div>
    </div>
  );
}
