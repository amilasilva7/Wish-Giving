"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SparkLoader from "@/app/components/SparkLoader";

type Pledge = {
  id: string;
  status: string;
  message: string | null;
  expiresAt: string | null;
  wish: { id: string; title: string; userId: string };
};


const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  accepted: "bg-blue-50 text-blue-700",
  in_coordination: "bg-purple-50 text-purple-700",
  declined: "bg-gray-100 text-gray-500",
  fulfilled: "bg-green-50 text-green-700"
};

function MyPledgesPageInner() {
  const searchParams = useSearchParams();
  const flash = searchParams.get("flash");
  const [banner, setBanner] = useState<string | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [retracting, setRetracting] = useState<string | null>(null);
  const [confirmRetract, setConfirmRetract] = useState<string | null>(null);

  useEffect(() => {
    if (flash === "pledged") {
      setBanner("Your pledge has been sent! The wisher will see it when they check their pledges.");
      const t = setTimeout(() => setBanner(null), 4000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  async function retractPledge(pledgeId: string) {
    setRetracting(pledgeId);
    setConfirmRetract(null);
    try {
      await fetch(`/api/pledges/${pledgeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retract" })
      });
      const res = await fetch("/api/pledges");
      const data = await res.json();
      if (data) setPledges(data.pledges ?? []);
    } finally {
      setRetracting(null);
    }
  }

  useEffect(() => {
    fetch("/api/pledges")
      .then(r => {
        if (r.status === 401) { setAuthed(false); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (data) { setPledges(data.pledges ?? []); setLoading(false); }
      })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, []);

  if (!authed) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">You must be signed in to view your pledges.</p>
        <Link href="/auth/login?redirect=/pledges" className="btn-primary inline-block">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My pledges</h1>
      {banner && <p className="success-msg mb-4">{banner}</p>}
      {fetchError ? (
        <div className="card text-center py-12 text-red-500">Failed to load pledges. Please try again.</div>
      ) : loading ? (
        <div className="card text-center py-12 text-orange-400">
          <SparkLoader label="Loading your pledges…" />
        </div>
      ) : pledges.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          You haven't pledged to any wishes yet.{" "}
          <Link href="/" className="text-orange-500 hover:underline">Browse wishes</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {pledges.map(pledge => (
            <li key={pledge.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Link href={`/wish/${pledge.wish.id}`} className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">
                    {pledge.wish.title}
                  </Link>
                  {pledge.message && (
                    <p className="text-sm text-gray-500 mt-0.5 italic">"{pledge.message}"</p>
                  )}
                  {pledge.expiresAt && pledge.status === "pending" && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Expires: {new Date(pledge.expiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[pledge.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {pledge.status.replace("_", " ")}
                  </span>
                  {pledge.status === "pending" && (
                    confirmRetract === pledge.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600">Retract?</span>
                        <button
                          onClick={() => retractPledge(pledge.id)}
                          disabled={retracting === pledge.id}
                          className="btn-danger text-xs px-2 py-1"
                        >
                          {retracting === pledge.id ? <SparkLoader size="sm" /> : "Yes"}
                        </button>
                        <button onClick={() => setConfirmRetract(null)} className="btn-secondary text-xs px-2 py-1">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRetract(pledge.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Retract
                      </button>
                    )
                  )}
                  {(pledge.status === "accepted" || pledge.status === "in_coordination") && (
                    <Link href={`/chat/${pledge.wish.id}`} className="btn-primary text-xs px-3 py-1.5 inline-block">
                      Chat
                    </Link>
                  )}
                  {pledge.status === "fulfilled" && (
                    <span className="text-xs text-green-600 font-medium">✓ Fulfilled</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MyPledgesPage() {
  return <Suspense><MyPledgesPageInner /></Suspense>;
}
