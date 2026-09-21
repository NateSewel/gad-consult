import { type ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAdminMe, useAdminLogout } from "@/hooks/use-admin";
import { LayoutDashboard, FileText, Inbox, LogOut } from "lucide-react";

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

  useEffect(() => {
    if (!isLoading && authenticated === false) {
      navigate("/admin/login");
    }
  }, [isLoading, authenticated, navigate]);

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
      <aside className="hidden md:flex md:w-[248px] md:shrink-0 md:flex-col md:border-r md:border-border/70 md:bg-card">
        <div className="px-6 py-6">
          <div className="font-display text-lg" data-testid="admin-header-title">
            GAD Admin
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-3" data-testid="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = isActive(location, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70"
                }`}
                data-testid={`admin-nav-${item.testid}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-border/70">
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="inline-flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted/70 transition-all duration-200"
            data-testid="admin-logout-button"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Mobile top nav */}
        <header className="md:hidden border-b border-border/70 bg-card">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="font-display text-lg" data-testid="admin-header-title-mobile">
              GAD Admin
            </div>
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
