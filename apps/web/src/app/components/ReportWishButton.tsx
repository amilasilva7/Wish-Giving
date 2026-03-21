"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SparkLoader from "./SparkLoader";

export default function ReportWishButton({ wishId }: { wishId: string }) {
  const router = useRouter();
  const [reporting, setReporting] = useState(false);
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  async function submit() {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "wish", targetId: wishId, reason })
      });
      setDone(true);
      setReporting(false);
    } finally {
      setLoading(false);
    }
  }

  if (done) return <span className="text-xs text-green-600">Report submitted.</span>;

  if (reporting) {
    return (
      <div className="flex gap-2 flex-wrap items-center mt-3">
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason for report…"
          className="input text-sm flex-1"
        />
        <button onClick={submit} disabled={loading} className="btn-danger text-sm px-3 py-1.5">
          {loading ? <SparkLoader size="sm" /> : "Submit"}
        </button>
        <button onClick={() => setReporting(false)} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
      </div>
    );
  }

  async function handleReportClick() {
    setCheckingAuth(true);
    try {
      const r = await fetch("/api/auth/me");
      const data = await r.json();
      if (!data.user) {
        router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
        return;
      }
      setReporting(true);
    } catch {
      router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
    } finally {
      setCheckingAuth(false);
    }
  }

  return (
    <button onClick={handleReportClick} disabled={checkingAuth} className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-3 block">
      {checkingAuth ? <SparkLoader size="sm" /> : "Report this wish"}
    </button>
  );
}
