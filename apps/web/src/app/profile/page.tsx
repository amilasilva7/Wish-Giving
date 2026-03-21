"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import SparkLoader from "@/app/components/SparkLoader";
import { useLoading } from "@/app/components/LoadingProvider";
import FavouriteButton from "@/app/components/FavouriteButton";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  locationCoarse: string | null;
  status: string;
};

type FavWish = {
  id: string;
  title: string;
  category: string;
  userId: string;
  status: string;
  user: { name: string };
  _count: { favourites: number };
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", avatarUrl: "", locationCoarse: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const [favourites, setFavourites] = useState<FavWish[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(true);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Account deletion state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      setUser(data.user);
      if (data.user) {
        setForm({
          name: data.user.name ?? "",
          avatarUrl: data.user.avatarUrl ?? "",
          locationCoarse: data.user.locationCoarse ?? "",
          email: data.user.email ?? ""
        });
      }
      setLoading(false);
    });
    fetch("/api/favourites")
      .then(r => r.ok ? r.json() : { favourites: [] })
      .then(data => { setFavourites(data.favourites); setLoadingFavs(false); })
      .catch(() => setLoadingFavs(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    showLoading("Saving profile…");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } finally {
      setSaving(false);
      hideLoading();
    }
  }

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        setPwError(data.error ?? "Failed to change password");
        return;
      }
      setPwSuccess(true);
      setShowPasswordForm(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSuccess(false), 4000);
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await fetch("/api/users/me", { method: "DELETE" });
      window.location.href = "/";
    } finally {
      setDeleting(false);
    }
  }

  function handleEditClick() {
    setSuccess(false);
    setEditing(true);
  }

  if (loading) return <div className="card text-center py-12 text-orange-400"><SparkLoader label="Loading profile…" /></div>;

  if (!user) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">You must be signed in to view your profile.</p>
        <Link href="/auth/login?redirect=/profile" className="btn-primary inline-block">Login</Link>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your profile</h1>
      {success && <p className="success-msg mb-4">Profile updated successfully.</p>}
      {pwSuccess && <p className="success-msg mb-4">Password changed successfully.</p>}
      <div className="card mb-8">
        <div className="flex items-center gap-4 mb-6">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" width={64} height={64} className="rounded-full w-16 h-16 object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xl font-semibold text-gray-900">{user.name}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        {!editing ? (
          <>
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                  user.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>{user.status}</span>
              </div>
              {user.locationCoarse && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-700">{user.locationCoarse}</span>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
              <Link href="/wishes" className="btn-secondary inline-block">View my wishes</Link>
              <button onClick={handleEditClick} className="btn-primary">Edit profile</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4 border-t border-gray-100 pt-4">
            <div className="form-field">
              <label className="label">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="input" required />
            </div>
            <div className="form-field">
              <label className="label">Email</label>
              <input type="email" value={form.email ?? ""} onChange={e => setForm({ ...form, email: e.target.value })}
                className="input" placeholder="you@example.com" />
            </div>
            <div className="form-field">
              <label className="label">Avatar URL</label>
              <input type="url" value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })}
                className="input" placeholder="https://..." />
            </div>
            <div className="form-field">
              <label className="label">City / Area</label>
              <input type="text" value={form.locationCoarse} onChange={e => setForm({ ...form, locationCoarse: e.target.value })}
                className="input" placeholder="e.g. London, UK" />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? <SparkLoader label="Saving…" size="sm" /> : "Save"}</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Change password</h2>
          <button
            onClick={() => setShowPasswordForm(v => !v)}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            {showPasswordForm ? "Cancel" : "Change"}
          </button>
        </div>
        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div className="form-field">
              <label className="label">Current password</label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="input" required />
            </div>
            <div className="form-field">
              <label className="label">New password</label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="input" required />
            </div>
            <div className="form-field">
              <label className="label">Confirm new password</label>
              <input type="password" value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                className="input" required />
            </div>
            {pwError && <p className="error-msg">{pwError}</p>}
            <button type="submit" className="btn-primary" disabled={pwSaving}>
              {pwSaving ? <SparkLoader label="Saving…" size="sm" /> : "Update password"}
            </button>
          </form>
        )}
        {!showPasswordForm && (
          <p className="text-sm text-gray-400">Click "Change" to update your password.</p>
        )}
      </div>

      {/* Favourites */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">❤️ Saved wishes ({favourites.length})</h2>
        {loadingFavs ? (
          <div className="card text-center py-8 text-orange-400"><SparkLoader label="Loading favourites…" /></div>
        ) : favourites.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            No saved wishes yet. Hit ❤️ on any wish to save it here.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {favourites.map(wish => (
              <li key={wish.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/wish/${wish.id}`} className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">
                      {wish.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">by {wish.user.name}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                      {wish.category}
                    </span>
                    <FavouriteButton
                      wishId={wish.id}
                      initialFavourited={true}
                      initialCount={wish._count.favourites}
                      size="sm"
                      onToggle={(isFav) => {
                        if (!isFav) setFavourites(prev => prev.filter(w => w.id !== wish.id));
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Danger zone</h2>
        <div className="card border-red-200">
          <p className="text-sm text-gray-600 mb-4">Permanently delete your account and all your data. This cannot be undone.</p>
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Are you sure? This cannot be undone.</span>
              <button onClick={handleDeleteAccount} disabled={deleting} className="btn-danger text-sm px-3 py-1.5">
                {deleting ? <SparkLoader label="Deleting…" size="sm" /> : "Yes, delete my account"}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-secondary text-sm px-3 py-1.5">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="btn-danger text-sm">Delete account</button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
