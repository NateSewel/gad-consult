import { type FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@/hooks/use-admin";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useAdminLogin();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login.mutateAsync({ email, password });
      navigate("/admin");
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-lg shadow-black/5"
        data-testid="admin-login-form"
      >
        <h1 className="text-2xl font-semibold" data-testid="admin-login-title">
          Admin login
        </h1>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-1.5">
            <div className="text-sm font-semibold text-foreground/90">Email</div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
              data-testid="admin-login-email"
            />
          </label>
          <label className="grid gap-1.5">
            <div className="text-sm font-semibold text-foreground/90">Password</div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
              data-testid="admin-login-password"
            />
          </label>
          {error ? (
            <div className="text-sm font-semibold text-destructive" data-testid="admin-login-error">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={login.isPending}
            className="mt-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
            data-testid="admin-login-submit"
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
