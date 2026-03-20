"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SparkLoader from "@/app/components/SparkLoader";
import PageLoader from "@/app/components/PageLoader";
import { useToast } from "@/app/components/Toast";

type Giver = { id: string; name: string; avatarUrl: string | null; locationCoarse: string | null };
type Pledge = {
  id: string;
  status: string;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
  giver: Giver;
};
type Wish = { id: string; title: string; status: string };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  accepted: "bg-blue-50 text-blue-700",
  in_coordination: "bg-purple-50 text-purple-700",
  declined: "bg-gray-100 text-gray-500",
  fulfilled: "bg-green-50 text-green-700"
};

export default function WishPledgesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [wish, setWish] = useState<Wish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [confirmDecline, setConfirmDecline] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/wishes/${id}/pledges`);
    if (!res.ok) {
      setError("Could not load pledges.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPledges(data.pledges);
    setWish(data.wish);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function doAction(pledgeId: string, action: "accept" | "decline" | "mark_fulfilled") {
    setActionError(null);
    setActionLoading(prev => ({ ...prev, [pledgeId]: true }));
    const res = await fetch(`/api/pledges/${pledgeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    setActionLoading(prev => ({ ...prev, [pledgeId]: false }));
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? "Action failed");
      return;
    }
    const successMsg = action === "accept" ? "Pledge accepted." : action === "decline" ? "Pledge declined." : "Marked as fulfilled.";
    showToast(successMsg, "success");
    await load();
  }

  if (loading) return <div className="card text-center py-12 text-orange-400"><SparkLoader label="Loading pledges…" /></div>;
  if (error) return <div className="card text-center py-12 text-red-500">{error}</div>;

  const anyActionLoading = Object.values(actionLoading).some(Boolean);

  return (
    <>
    {anyActionLoading && <PageLoader label="Processing…" />}
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/wishes")} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">
          Pledges for: <span className="text-orange-500">{wish?.title}</span>
        </h1>
      </div>

      {actionError && <p className="error-msg mb-4">{actionError}</p>}

      {pledges.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🤲</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pledges yet</h3>
          <p className="text-gray-500 mb-6">Share your wish to attract givers who want to help make it happen.</p>
          <div className="text-sm text-gray-500">
            Share this wish link: <span className="font-mono bg-gray-100 px-2 py-1 rounded inline-block mt-2 text-xs break-all">
              {typeof window !== "undefined" ? `${window.location.origin}/wish/${id}` : `/wish/${id}`}
            </span>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {pledges.map(pledge => (
            <li key={pledge.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-500 text-lg flex-shrink-0">
                    {pledge.giver.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Link href={`/user/${pledge.giver.id}`} className="font-semibold text-gray-900 hover:text-orange-500">
                      {pledge.giver.name}
                    </Link>
                    {pledge.giver.locationCoarse && (
                      <p className="text-xs text-gray-400">{pledge.giver.locationCoarse}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[pledge.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {pledge.status.replace("_", " ")}
                </span>
              </div>

              {pledge.message && (
                <p className="text-sm text-gray-600 italic border-l-2 border-orange-200 pl-3 mb-3">
                  "{pledge.message}"
                </p>
              )}

              {pledge.expiresAt && pledge.status === "pending" && (
                <p className="text-xs text-gray-400 mb-3">
                  Expires: {new Date(pledge.expiresAt).toLocaleString()}
                </p>
              )}

              {pledge.status === "pending" && (
                <div className="pt-2 border-t border-gray-100">
                  {confirmDecline === pledge.id ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Really decline this pledge?</span>
                      <button
                        onClick={() => { setConfirmDecline(null); doAction(pledge.id, "decline"); }}
                        className="btn-danger text-sm px-3 py-1.5"
                        disabled={actionLoading[pledge.id]}
                      >
                        Yes
                      </button>
                      <button onClick={() => setConfirmDecline(null)} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => doAction(pledge.id, "accept")}
                        className="btn-primary text-sm px-3 py-1.5"
                        disabled={actionLoading[pledge.id]}
                      >
                        {actionLoading[pledge.id] ? <SparkLoader label="Accepting…" size="sm" /> : "Accept"}
                      </button>
                      <button
                        onClick={() => setConfirmDecline(pledge.id)}
                        className="btn-secondary text-sm px-3 py-1.5"
                        disabled={actionLoading[pledge.id]}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(pledge.status === "accepted" || pledge.status === "in_coordination") && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Link href={`/chat/${wish?.id}`} className="btn-primary text-sm px-3 py-1.5 inline-block">
                    Open chat
                  </Link>
                  <button
                    onClick={() => doAction(pledge.id, "mark_fulfilled")}
                    className="btn-secondary text-sm px-3 py-1.5"
                    disabled={actionLoading[pledge.id]}
                  >
                    {actionLoading[pledge.id] ? <SparkLoader label="Marking…" size="sm" /> : "Mark fulfilled"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  );
}
