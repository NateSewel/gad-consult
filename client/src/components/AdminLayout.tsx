import { type ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminMe, useAdminLogout } from "@/hooks/use-admin";
import { LogOut } from "lucide-react";

export function AdminLayout(props: { children: ReactNode }) {
  const [, navigate] = useLocation();
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="font-display text-lg" data-testid="admin-header-title">
            GAD Admin
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/70 transition-all duration-200"
            data-testid="admin-logout-button"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">{props.children}</main>
    </div>
  );
}
