"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import SparkLoader from "@/app/components/SparkLoader";
import { WishCardSkeletonList } from "@/app/components/WishCardSkeleton";

type Wish = {
  id: string;
  title: string;
  status: string;
  visibility: string;
};

function WishesPageInner() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch("/api/wishes")
      .then(r => {
        if (r.status === 401) { setAuthed(false); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (data) { setWishes(data.wishes ?? []); setLoading(false); }
      })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, []);

  if (!authed) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">You must be signed in to manage wishes.</p>
        <Link href="/auth/login" className="btn-primary inline-block">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your wishes</h1>
        <Link href="/wishes/new" className="btn-primary">+ New wish</Link>
      </div>
      {fetchError ? (
        <div className="card text-center py-12 text-red-500">Failed to load wishes. Please try again.</div>
      ) : loading ? (
        <WishCardSkeletonList count={3} />
      ) : wishes.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🌟</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">You haven't made a wish yet</h3>
          <p className="text-gray-500 mb-6">Create your first wish and let generous people help make it happen.</p>
          <Link href="/wishes/new" className="btn-primary inline-block">Make a wish</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {wishes.map(wish => (
            <li key={wish.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Link href={`/wishes/${wish.id}`} className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">
                    {wish.title}
                  </Link>
                  {(wish.status === "pledged" || wish.status === "in_coordination") && (
                    <Link href={`/wishes/${wish.id}/pledges`} className="ml-3 text-xs text-orange-500 hover:underline font-medium">
                      View pledges →
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    wish.status === "open" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {wish.status.replace("_", " ")}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {wish.visibility}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function WishesPage() {
  return <Suspense><WishesPageInner /></Suspense>;
}
