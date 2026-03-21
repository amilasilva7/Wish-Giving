"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SparkLoader from "./SparkLoader";
import { useLoading } from "./LoadingProvider";

export default function NavAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        setLoggedIn(!!data.user);
        setIsAdmin(!!data.isAdmin);
      })
      .catch(() => setLoggedIn(false));
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);
    showLoading("Signing out…");
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setLogoutLoading(false);
      hideLoading();
    }
  }

  if (loggedIn === null) return null; // loading — render nothing to avoid flash

  if (loggedIn) {
    return (
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link href="/admin/users" className="text-xs text-gray-500 hover:text-orange-500">Admin</Link>
        )}
        <button onClick={handleLogout} disabled={logoutLoading} className="btn-primary text-sm px-3 py-1.5">
          {logoutLoading ? <SparkLoader label="Signing out…" size="sm" /> : "Log out"}
        </button>
      </div>
    );
  }

  return (
    <Link href="/auth/login" className="btn-primary text-sm px-3 py-1.5">
      Login
    </Link>
  );
}
