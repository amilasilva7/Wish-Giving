"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

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
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailPageInner /></Suspense>;
}
