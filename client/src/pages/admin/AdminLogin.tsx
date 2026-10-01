import { type FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@/hooks/use-admin";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFieldClass } from "@/components/AdminStates";

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
    } catch (err) {
      // Only a 401 means the credentials were wrong; anything else is a
      // connection or server problem and shouldn't send people re-typing.
      const message = err instanceof Error ? err.message : "";
      const serverResponded = /^\d{3}:/.test(message);
      setError(
        message.startsWith("401:")
          ? "Invalid email or password."
          : serverResponded
            ? "Sign-in isn't working right now. Try again in a moment."
            : "Couldn't reach the server. Check your connection and try again.",
      );
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-6 shadow-lg shadow-black/5 sm:p-8"
        data-testid="admin-login-form"
      >
        <BrandMark className="w-fit dark:rounded-lg dark:bg-white dark:px-2 dark:py-1" />
        <h1 className="mt-6 text-2xl font-semibold" data-testid="admin-login-title">
          Admin login
        </h1>
        <div className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="admin-login-email" className="text-sm font-semibold">
              Email
            </Label>
            <Input
              id="admin-login-email"
              type="email"
              name="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "admin-login-error" : undefined}
              className={adminFieldClass}
              data-testid="admin-login-email"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="admin-login-password" className="text-sm font-semibold">
              Password
            </Label>
            <Input
              id="admin-login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "admin-login-error" : undefined}
              className={adminFieldClass}
              data-testid="admin-login-password"
            />
          </div>
          {error ? (
            <div
              id="admin-login-error"
              role="alert"
              className="text-sm font-semibold text-admin-danger"
              data-testid="admin-login-error"
            >
              {error}
            </div>
          ) : null}
          <Button
            type="submit"
            disabled={login.isPending}
            className="mt-2 min-h-11 rounded-xl"
            data-testid="admin-login-submit"
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>
    </main>
  );
}
