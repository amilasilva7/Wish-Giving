import React from "react";
import Link from "next/link";
import NavAuth from "./components/NavAuth";
import "./globals.css";

export const metadata = {
  title: "Wish-Giving",
  description: "Match real wishes with real givers"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-orange-500 hover:text-orange-600">
              🎁 Wish-Giving
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium">
              <Link href="/" className="text-gray-600 hover:text-orange-500 transition-colors">Home</Link>
              <Link href="/wishes" className="text-gray-600 hover:text-orange-500 transition-colors">My Wishes</Link>
              <Link href="/pledges" className="text-gray-600 hover:text-orange-500 transition-colors">My Pledges</Link>
              <Link href="/wishes/new" className="text-gray-600 hover:text-orange-500 transition-colors">Make a Wish</Link>
              <Link href="/profile" className="text-gray-600 hover:text-orange-500 transition-colors">Profile</Link>
              <NavAuth />
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
