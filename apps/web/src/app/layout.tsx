import React from "react";
import NavBar from "./components/NavBar";
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
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm relative">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="text-xl font-bold text-orange-500 hover:text-orange-600">
                🎁 Wish-Giving
              </a>
              <NavBar />
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
