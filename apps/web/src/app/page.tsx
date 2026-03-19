"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { WISH_CATEGORIES, OCCASION_TYPES } from "@/domain/taxonomy";
import SparkLoader from "@/app/components/SparkLoader";
import FavouriteButton from "@/app/components/FavouriteButton";

type Wish = {
  id: string;
  userId: string;
  title: string;
  category: string;
  user: { name: string; locationCoarse: string | null };
};

export default function HomePage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [occasionType, setOccasionType] = useState("");
  const [q, setQ] = useState("");
  const [fetchError, setFetchError] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());

  async function fetchWishes(params: { category?: string; occasionType?: string; q?: string; cursor?: string }, append = false) {
    const url = new URL("/api/feed", window.location.origin);
    if (params.category) url.searchParams.set("category", params.category);
    if (params.occasionType) url.searchParams.set("occasionType", params.occasionType);
    if (params.q) url.searchParams.set("q", params.q);
    if (params.cursor) url.searchParams.set("cursor", params.cursor);

    const res = await fetch(url.toString());
    if (!res.ok) {
      setFetchError(true);
      return;
    }
    setFetchError(false);
    const data = await res.json();
    if (append) {
      setWishes(prev => [...prev, ...data.wishes]);
    } else {
      setWishes(data.wishes);
    }
    setNextCursor(data.nextCursor);
  }

  useEffect(() => {
    setLoading(true);
    fetchWishes({}).finally(() => setLoading(false));
    fetch("/api/favourites")
      .then(r => r.ok ? r.json() : { favourites: [] })
      .then(data => setFavouriteIds(new Set((data.favourites as { id: string }[]).map(w => w.id))))
      .catch(() => {});
  }, []);

  async function handleFilter(e: FormEvent) {
    e.preventDefault();
    setSearching(true);
    setHasFiltered(true);
    await fetchWishes({ category, occasionType, q });
    setSearching(false);
  }

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    await fetchWishes({ category, occasionType, q, cursor: nextCursor }, true);
    setLoadingMore(false);
  }

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Make a wish. Grant a wish.
        </h1>
        <p className="text-lg text-gray-500 mb-6">
          Browse real wishes and find opportunities to make someone's day.
        </p>
        <Link href="/wishes/new" className="btn-primary text-base px-6 py-3 inline-block">
          Create your own wish
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Search & filter</h2>
        <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
          <div className="form-field flex-1 min-w-48">
            <label className="label">Search</label>
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search wishes…"
              className="input"
            />
          </div>
          <div className="form-field flex-1 min-w-36">
            <label className="label">Category</label>
            <select name="category" value={category} onChange={e => setCategory(e.target.value)} className="input">
              <option value="">All categories</option>
              {WISH_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="form-field flex-1 min-w-36">
            <label className="label">Occasion</label>
            <select name="occasionType" value={occasionType} onChange={e => setOccasionType(e.target.value)} className="input">
              <option value="">All occasions</option>
              {OCCASION_TYPES.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={searching}>
            {searching ? <SparkLoader label="Searching…" size="sm" /> : "Search"}
          </button>
        </form>
      </div>

      {/* Wish list */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Open wishes
          <span className="ml-2 text-sm font-normal text-gray-400">({wishes.length}{nextCursor ? "+" : ""})</span>
        </h2>
        {loading ? (
          <div className="card text-center py-12 text-orange-400">
            <SparkLoader label="Loading wishes…" />
          </div>
        ) : fetchError ? (
          <div className="error-msg text-center py-12">
            Failed to load wishes. Please try refreshing the page.
          </div>
        ) : wishes.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            {hasFiltered ? (
              <>
                No wishes match your search. Try different filters or{" "}
                <button
                  className="text-orange-500 hover:underline"
                  onClick={() => { setCategory(""); setOccasionType(""); setQ(""); setHasFiltered(false); setLoading(true); fetchWishes({}).finally(() => setLoading(false)); }}
                >
                  browse all wishes
                </button>.
              </>
            ) : (
              <>No wishes found. <Link href="/wishes/new" className="text-orange-500 hover:underline">Be the first!</Link></>
            )}
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {wishes.map(wish => (
                <li key={wish.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/wish/${wish.id}`} className="text-lg font-semibold text-gray-900 hover:text-orange-500 transition-colors">
                        {wish.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        by <Link href={`/user/${wish.userId}`} className="font-medium text-gray-700 hover:text-orange-500">{wish.user.name}</Link>
                        {wish.user.locationCoarse && (
                          <span className="ml-1 text-gray-400">· {wish.user.locationCoarse}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full whitespace-nowrap font-medium">
                        {wish.category}
                      </span>
                      <FavouriteButton
                        wishId={wish.id}
                        initialFavourited={favouriteIds.has(wish.id)}
                        size="sm"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {nextCursor && (
              <div className="text-center mt-6">
                <button onClick={handleLoadMore} disabled={loadingMore} className="btn-secondary">
                  {loadingMore ? <SparkLoader label="Loading…" size="sm" /> : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
