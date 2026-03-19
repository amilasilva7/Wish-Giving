"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NavAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => setLoggedIn(!!data.user));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loggedIn === null) return null; // loading — render nothing to avoid flash

  if (loggedIn) {
    return (
      <button onClick={handleLogout} className="btn-primary text-sm px-3 py-1.5">
        Log out
      </button>
    );
  }

  return (
    <Link href="/auth/login" className="btn-primary text-sm px-3 py-1.5">
      Login
    </Link>
  );
}
