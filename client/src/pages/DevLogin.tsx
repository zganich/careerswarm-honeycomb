/**
 * Sign in — email-only auth. No third-party OAuth required.
 * Uses native form POST so the browser follows the server 302 and sends the
 * session cookie on the redirect, avoiding sign-in loops.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DevLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnTo =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("returnTo") ||
        "/dashboard"
      : "/dashboard";

  const handleSubmit = () => {
    setError(null);
    setLoading(true);
    // Form submits natively; server 302 + Set-Cookie, browser follows with cookie.
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email to sign in. We’ll create your account if it’s your
          first time.
        </p>
        <form
          method="POST"
          action="/api/auth/test-login"
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <input type="hidden" name="returnTo" value={returnTo} />
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
