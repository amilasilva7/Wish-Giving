"use client";

import { useEffect, useState } from "react";
import SparkLoader from "@/app/components/SparkLoader";
import { useLoading } from "@/app/components/LoadingProvider";

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { id: string; email: string; name: string };
};

export default function AdminReportsPage() {
  const { showLoading, hideLoading } = useLoading();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch("/api/admin/reports");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load reports");
      setLoading(false);
      return;
    }
    setReports(data.reports);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setReportStatus(reportId: string, status: "open" | "closed") {
    setActionLoading(true);
    showLoading("Updating report…");
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update report");
        return;
      }
      await load();
    } finally {
      setActionLoading(false);
      hideLoading();
    }
  }

  async function disableUser(userId: string) {
    setActionLoading(true);
    showLoading("Disabling user…");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "disabled" })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to disable user");
        return;
      }
      await load();
    } finally {
      setActionLoading(false);
      hideLoading();
    }
  }

  async function disableWish(wishId: string) {
    setActionLoading(true);
    showLoading("Disabling wish…");
    try {
      const res = await fetch(`/api/admin/wishes/${wishId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "disabled" })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to disable wish");
        return;
      }
      await load();
    } finally {
      setActionLoading(false);
      hideLoading();
    }
  }

  async function enableWish(wishId: string) {
    setActionLoading(true);
    showLoading("Re-enabling wish…");
    try {
      const res = await fetch(`/api/admin/wishes/${wishId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "open" })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to re-enable wish");
        return;
      }
      await load();
    } finally {
      setActionLoading(false);
      hideLoading();
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin: Reports</h1>
          <a href="/admin/users" className="btn-secondary text-sm">Manage users</a>
        </div>
        <button onClick={load} className="btn-secondary text-sm">Refresh</button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Access requires email listed in <code className="bg-gray-100 px-1 rounded">ADMIN_EMAILS</code>.</p>
      {error && <p className="error-msg mb-4">{error}</p>}
      {loading ? (
        <div className="card text-center py-12 text-orange-400"><SparkLoader label="Loading reports…" /></div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No reports found.</div>
      ) : (
        <ul className="flex flex-col gap-4">
          {reports.map(r => (
            <li key={r.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono mr-2">{r.targetType}</span>
                  {r.targetType === "wish" ? (
                    <a href={`/wish/${r.targetId}`} target="_blank" rel="noopener" className="text-xs text-orange-500 hover:underline font-mono">{r.targetId}</a>
                  ) : r.targetType === "user" ? (
                    <a href={`/user/${r.targetId}`} target="_blank" rel="noopener" className="text-xs text-orange-500 hover:underline font-mono">{r.targetId}</a>
                  ) : (
                    <span className="text-xs text-gray-400 font-mono">{r.targetId}</span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  r.status === "open" ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Reason:</span> {r.reason}</p>
              <p className="text-sm text-gray-500 mb-4">Reporter: {r.reporter.name} ({r.reporter.email})</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setReportStatus(r.id, "closed")} disabled={actionLoading} className="btn-secondary text-sm px-3 py-1.5">
                  Close report
                </button>
                <button onClick={() => setReportStatus(r.id, "open")} disabled={actionLoading} className="btn-secondary text-sm px-3 py-1.5">
                  Re-open
                </button>
                {r.targetType === "user" && (
                  <button onClick={() => disableUser(r.targetId)} disabled={actionLoading} className="btn-danger text-sm px-3 py-1.5">
                    Disable user
                  </button>
                )}
                {r.targetType === "wish" && (
                  <>
                    <button onClick={() => disableWish(r.targetId)} disabled={actionLoading} className="btn-danger text-sm px-3 py-1.5">
                      Disable wish
                    </button>
                    <button onClick={() => enableWish(r.targetId)} disabled={actionLoading} className="btn-secondary text-sm px-3 py-1.5">
                      Re-enable wish
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
