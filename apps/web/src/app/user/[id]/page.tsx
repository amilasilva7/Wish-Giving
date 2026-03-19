"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Wish = { id: string; title: string; category: string; status: string; createdAt: string };
type User = {
  id: string;
  name: string;
  avatarUrl: string | null;
  locationCoarse: string | null;
  createdAt: string;
  wishes: Wish[];
};

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setUser(data.user); setLoading(false); })
      .catch(() => { setError("User not found."); setLoading(false); });
  }, [id]);

  async function submitReport() {
    if (!reportReason.trim()) return;
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: "user", targetId: id, reason: reportReason })
    });
    setReporting(false);
    setReportDone(true);
  }

  if (loading) return <div className="card text-center py-12 text-gray-400">Loading…</div>;
  if (error || !user) return <div className="card text-center py-12 text-gray-500">{error ?? "User not found."}</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-4">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            {user.locationCoarse && <p className="text-sm text-gray-500">{user.locationCoarse}</p>}
            <p className="text-xs text-gray-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
          <button
            onClick={async () => {
              await fetch("/api/block", {
                method: blocked ? "DELETE" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blockedUserId: id })
              });
              setBlocked(!blocked);
            }}
            className={`text-xs mr-3 transition-colors ${blocked ? "text-gray-400 hover:text-gray-600" : "text-red-400 hover:text-red-600"}`}
          >
            {blocked ? "Unblock user" : "Block user"}
          </button>
          {reportDone ? (
            <span className="text-xs text-green-600">Report submitted. Thank you.</span>
          ) : reporting ? (
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                placeholder="Reason for report…"
                className="input text-sm flex-1"
              />
              <button onClick={submitReport} className="btn-danger text-sm px-3 py-1.5">Submit</button>
              <button onClick={() => setReporting(false)} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setReporting(true)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              Report user
            </button>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Open wishes ({user.wishes.length})</h2>
      {user.wishes.length === 0 ? (
        <div className="card text-center py-8 text-gray-400">No public wishes.</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {user.wishes.map(wish => (
            <li key={wish.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <Link href={`/wish/${wish.id}`} className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">
                  {wish.title}
                </Link>
                <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full whitespace-nowrap font-medium">
                  {wish.category}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
