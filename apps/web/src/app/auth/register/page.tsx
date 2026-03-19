"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }
    const loginUrl = redirect !== "/"
      ? `/auth/login?redirect=${encodeURIComponent(redirect)}`
      : "/auth/login";
    window.location.href = loginUrl;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-field">
            <label className="label">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              placeholder="Your full name"
              required
            />
          </div>
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
              placeholder="Min. 8 characters"
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-orange-500 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
