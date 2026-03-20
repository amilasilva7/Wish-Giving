"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SparkLoader from "@/app/components/SparkLoader";
import { useLoading } from "@/app/components/LoadingProvider";

type User = {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
  emailVerifiedAt: string | null;
  _count: { wishes: number; pledgesGiven: number };
};

export default function AdminUsersPage() {
  const { showLoading, hideLoading } = useLoading();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) {
      setError(res.status === 403 ? "Access denied." : "Failed to load users.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setUsers(data.users);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleStatus(userId: string, currentStatus: string) {
    setActionError(null);
    setActionLoading(true);
    showLoading("Updating user status…");
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        setActionError("Failed to update user status.");
        return;
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } finally {
      setActionLoading(false);
      hideLoading();
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="card text-center py-12 text-orange-400"><SparkLoader label="Loading users…" /></div>;
  if (error) return <div className="card text-center py-12 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin · Users</h1>
        <Link href="/admin/reports" className="btn-secondary text-sm">View reports</Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="input max-w-sm"
        />
      </div>

      {actionError && <p className="error-msg mb-4">{actionError}</p>}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">User</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Wishes</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Pledges</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Verified</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-center px-4 py-3 text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/user/${user.id}`} className="font-medium text-gray-900 hover:text-orange-500">
                    {user.name}
                  </Link>
                  <p className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-center text-gray-600">{user._count.wishes}</td>
                <td className="px-4 py-3 text-center text-gray-600">{user._count.pledgesGiven}</td>
                <td className="px-4 py-3 text-center">
                  {user.emailVerifiedAt
                    ? <span className="text-green-600 text-xs">✓</span>
                    : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleStatus(user.id, user.status)}
                    disabled={actionLoading}
                    className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                      user.status === "active"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {user.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400">No users found.</div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">{filtered.length} of {users.length} users</p>
    </div>
  );
}
