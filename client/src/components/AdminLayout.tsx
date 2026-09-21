import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminMe, useAdminLogout } from "@/hooks/use-admin";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";
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

function isActive(path: string, href: string) {
  if (href === "/admin") return path === "/admin";
  return path === href || path.startsWith(`${href}/`);
}

export function AdminLayout(props: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: authenticated, isLoading } = useAdminMe();
  const logout = useAdminLogout();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("admin-sidebar-collapsed") === "true",
  );

  useEffect(() => {
    if (!isLoading && authenticated === false) {
      navigate("/admin/login");
    }
  }, [isLoading, authenticated, navigate]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground" data-testid="admin-loading">
        Loading…
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background md:flex">
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
              aria-label="GAD Legal Consult brand mark"
              data-testid="admin-brand-mark-collapsed"
            >
              <img
                src="/images/logo.png"
                alt="GAD Legal Consult"
                className="h-8 w-8 object-cover object-left"
              />
            </div>
          ) : (
            <BrandMark />
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className={`inline-flex shrink-0 items-center justify-center rounded-xl p-2 text-muted-foreground transition-all duration-200 hover:bg-muted/70 hover:text-foreground ${
              collapsed ? "mt-2" : ""
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-testid="admin-sidebar-collapse-toggle"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav
          className={`flex-1 flex flex-col gap-1 ${collapsed ? "px-2" : "px-3"}`}
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
                className={cn(
                  "inline-flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200",
                  collapsed ? "justify-center px-0" : "px-3",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70",
                )}
                data-testid={`admin-nav-${item.testid}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
        <div
          className={`flex items-center gap-2 border-t border-border/70 py-4 ${
            collapsed ? "flex-col px-2" : "justify-between px-3"
          }`}
        >
          <button
            type="button"
            onClick={() => logout.mutate()}
            title={collapsed ? "Log out" : undefined}
            className={cn(
              "inline-flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted/70",
              collapsed ? "justify-center px-0" : "flex-1 px-3",
            )}
            data-testid="admin-logout-button"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Log out"}
          </button>
          <ThemeToggle data-testid="admin-theme-toggle" />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Mobile top nav */}
        <header className="md:hidden border-b border-border/70 bg-card">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="font-display text-lg" data-testid="admin-header-title-mobile">
              GAD Admin
            </div>
            <ThemeToggle data-testid="admin-theme-toggle-mobile" />
          </div>
          <nav
            className="flex items-center gap-1 overflow-x-auto px-4 pb-3"
            data-testid="admin-mobile-nav"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(location, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70"
                  }`}
                  data-testid={`admin-nav-mobile-${item.testid}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/70 transition-all duration-200"
              data-testid="admin-logout-button-mobile"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 lg:px-8 py-10">{props.children}</main>
      </div>
    </div>
  );
}
