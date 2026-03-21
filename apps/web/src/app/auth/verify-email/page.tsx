"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    }).then(async res => {
      if (res.ok) {
        setStatus("success");
        setMessage("Your email has been verified! You can now log in.");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error ?? "Verification failed. The link may have expired.");
      }
    }).catch(() => {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    });
  }, [token]);

  async function handleResend(e: FormEvent) {
    e.preventDefault();
    setResendLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail })
      });
      setResendDone(true);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="card text-center py-10">
        {status === "loading" && (
          <p className="text-gray-500">Verifying your email…</p>
        )}
        {status === "success" && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Email verified!</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link href="/auth/login" className="btn-primary inline-block">Log in</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link href="/auth/login" className="btn-secondary inline-block">Back to login</Link>
            <div className="mt-6 border-t border-gray-100 pt-6 text-left">
              <p className="text-sm text-gray-500 mb-3">Need a new verification link?</p>
              {resendDone ? (
                <p className="text-sm text-green-600">If your email exists and is unverified, a new link has been sent.</p>
              ) : (
                <form onSubmit={handleResend} className="flex gap-2">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={e => setResendEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input flex-1 text-sm"
                    required
                  />
                  <button type="submit" disabled={resendLoading} className="btn-primary text-sm px-3">
                    {resendLoading ? "Sending…" : "Resend"}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailPageInner /></Suspense>;
}
