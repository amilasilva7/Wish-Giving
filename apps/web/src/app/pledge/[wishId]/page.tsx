"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SparkLoader from "@/app/components/SparkLoader";
import PageLoader from "@/app/components/PageLoader";

export default function PledgePage() {
  const params = useParams<{ wishId: string }>();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/pledges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishId: params.wishId, message })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create pledge");
      setLoading(false);
      return;
    }
    router.push("/pledges?flash=pledged");
  }

  return (
    <>
    {loading && <PageLoader label="Sending pledge…" />}
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pledge to fulfill this wish</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-field">
            <label className="label">Message to wisher <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="input min-h-28 resize-y"
              placeholder="Introduce yourself and explain how you'd like to help..."
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <SparkLoader label="Sending pledge…" size="sm" /> : "Send pledge"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
