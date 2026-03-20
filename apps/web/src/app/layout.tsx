import React from "react";
import NavAuth from "./components/NavAuth";
import NavLink from "./components/NavLink";
import { ToastProvider } from "./components/Toast";
import { LoadingProvider } from "./components/LoadingProvider";
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
        <LoadingProvider>
        <ToastProvider>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <NavLink href="/" className="text-xl font-bold text-orange-500 hover:text-orange-600">
                🎁 Wish-Giving
              </NavLink>
              <nav className="flex items-center gap-5 text-sm font-medium">
                <NavLink href="/" className="text-gray-600 hover:text-orange-500 transition-colors">Home</NavLink>
                <NavLink href="/wishes" className="text-gray-600 hover:text-orange-500 transition-colors">My Wishes</NavLink>
                <NavLink href="/pledges" className="text-gray-600 hover:text-orange-500 transition-colors">My Pledges</NavLink>
                <NavLink href="/wishes/new" className="text-gray-600 hover:text-orange-500 transition-colors">Make a Wish</NavLink>
                <NavLink href="/profile" className="text-gray-600 hover:text-orange-500 transition-colors">Profile</NavLink>
                <NavAuth />
              </nav>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
        </ToastProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
