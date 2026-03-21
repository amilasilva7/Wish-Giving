"use client";

import { useEffect, useState } from "react";
import NavLink from "./NavLink";
import NavAuth from "./NavAuth";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => setAuthed(!!data.user))
      .catch(() => setAuthed(false));
  }, []);

  function close() {
    setOpen(false);
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
        <NavLink href="/" className="text-gray-600 hover:text-orange-500 transition-colors">Home</NavLink>
        {authed === true && (
          <>
            <NavLink href="/wishes" className="text-gray-600 hover:text-orange-500 transition-colors">My Wishes</NavLink>
            <NavLink href="/pledges" className="text-gray-600 hover:text-orange-500 transition-colors">My Pledges</NavLink>
            <NavLink href="/wishes/new" className="text-gray-600 hover:text-orange-500 transition-colors">Make a Wish</NavLink>
            <NavLink href="/profile" className="text-gray-600 hover:text-orange-500 transition-colors">Profile</NavLink>
          </>
        )}
        <NavAuth />
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 text-gray-600 hover:text-orange-500 transition-colors text-xl leading-none"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-md z-20">
          <nav className="flex flex-col px-4 py-3 gap-1 text-sm font-medium">
            <NavLink href="/" onClick={close} className="text-gray-700 hover:text-orange-500 transition-colors py-2 border-b border-gray-50">Home</NavLink>
            {authed === true && (
              <>
                <NavLink href="/wishes" onClick={close} className="text-gray-700 hover:text-orange-500 transition-colors py-2 border-b border-gray-50">My Wishes</NavLink>
                <NavLink href="/pledges" onClick={close} className="text-gray-700 hover:text-orange-500 transition-colors py-2 border-b border-gray-50">My Pledges</NavLink>
                <NavLink href="/wishes/new" onClick={close} className="text-gray-700 hover:text-orange-500 transition-colors py-2 border-b border-gray-50">Make a Wish</NavLink>
                <NavLink href="/profile" onClick={close} className="text-gray-700 hover:text-orange-500 transition-colors py-2 border-b border-gray-50">Profile</NavLink>
              </>
            )}
            <div className="py-2" onClick={close}>
              <NavAuth />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
