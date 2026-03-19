"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SparkLoader from "@/app/components/SparkLoader";
import PageLoader from "@/app/components/PageLoader";

function LoginPageInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const fromWish = redirect === "/wishes/new";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }
    // M3: prevent open redirect — only allow same-origin paths
    const safeRedirect = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
    window.location.href = safeRedirect;
  }

  return (
    <>
    {loading && <PageLoader label="Signing in…" />}
    <div className="max-w-md mx-auto mt-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign in</h1>
        {fromWish && (
          <p className="success-msg mb-4 text-center">
            Your wish is saved — sign in and we'll bring it right back.
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-field">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-field">
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? <SparkLoader label="Signing in…" size="sm" /> : "Sign in"}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          No account?{" "}
          <Link
            href={`/auth/register${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-orange-500 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
        <p className="text-sm text-gray-400 mt-2 text-center">
          <Link href="/auth/forgot-password" className="hover:underline">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}

export default function LoginPage() {
  return <Suspense><LoginPageInner /></Suspense>;
}
