"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { WISH_CATEGORIES, OCCASION_TYPES } from "@/domain/taxonomy";
import SparkLoader from "@/app/components/SparkLoader";
import FavouriteButton from "@/app/components/FavouriteButton";
import { WishCardSkeletonList } from "@/app/components/WishCardSkeleton";

type Wish = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  user: { name: string; locationCoarse: string | null; avatarUrl: string | null };
  _count: { favourites: number };
};

export default function HomePage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [occasionType, setOccasionType] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [fetchError, setFetchError] = useState(false);
  const [searching, setSearching] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());

  async function fetchWishes(params: { category?: string; occasionType?: string; q?: string; cursor?: string; sort?: string }, append = false) {
    const url = new URL("/api/feed", window.location.origin);
    if (params.category) url.searchParams.set("category", params.category);
    if (params.occasionType) url.searchParams.set("occasionType", params.occasionType);
    if (params.q) url.searchParams.set("q", params.q);
    if (params.cursor) url.searchParams.set("cursor", params.cursor);
    if (params.sort) url.searchParams.set("sort", params.sort);

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

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearching(true);
      fetchWishes({ category, occasionType, q, sort }).finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [q, category, occasionType, sort]);

  async function handleLoadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    await fetchWishes({ category, occasionType, q, sort, cursor: nextCursor }, true);
    setLoadingMore(false);
  }

  return (
    <div>
      {/* Hero */}
      <div className="py-8 mb-4 flex flex-col md:flex-row items-center gap-10">

        {/* Left — copy */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Make a wish. Grant a wish.
          </h1>
          <p className="text-lg text-gray-500 mb-6">
            Browse real wishes and find opportunities to make someone's day.
          </p>
          <Link href="/wishes/new" className="btn-primary text-base px-6 py-3 inline-block">
            Create your own wish
          </Link>
        </div>

        {/* Right — illustration */}
        <div className="flex-shrink-0 w-full max-w-xs mx-auto md:max-w-none md:w-80">
          <svg viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full">
            {/* Background glow */}
            <circle cx="150" cy="120" r="112" fill="#fff7ed"/>
            <circle cx="150" cy="120" r="82" fill="#ffedd5" opacity="0.4"/>

            {/* LEFT FIGURE (giver) */}
            <ellipse cx="75" cy="158" rx="30" ry="48" fill="#f97316"/>
            <circle cx="75" cy="82" r="26" fill="#f97316"/>
            {/* Eyes */}
            <circle cx="67" cy="78" r="3.5" fill="white"/>
            <circle cx="83" cy="78" r="3.5" fill="white"/>
            <circle cx="68" cy="79" r="2" fill="#431407"/>
            <circle cx="84" cy="79" r="2" fill="#431407"/>
            {/* Smile */}
            <path d="M 68,90 Q 75,97 82,90" stroke="#431407" strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* Arm reaching toward heart */}
            <path d="M 103,144 Q 122,128 138,118" stroke="#f97316" strokeWidth="14" strokeLinecap="round" fill="none"/>

            {/* RIGHT FIGURE (receiver) */}
            <ellipse cx="225" cy="158" rx="30" ry="48" fill="#fb923c"/>
            <circle cx="225" cy="82" r="26" fill="#fb923c"/>
            {/* Eyes */}
            <circle cx="217" cy="78" r="3.5" fill="white"/>
            <circle cx="233" cy="78" r="3.5" fill="white"/>
            <circle cx="218" cy="79" r="2" fill="#431407"/>
            <circle cx="234" cy="79" r="2" fill="#431407"/>
            {/* Smile */}
            <path d="M 218,90 Q 225,97 232,90" stroke="#431407" strokeWidth="2" strokeLinecap="round" fill="none"/>
            {/* Arm reaching toward heart */}
            <path d="M 197,144 Q 178,128 162,118" stroke="#fb923c" strokeWidth="14" strokeLinecap="round" fill="none"/>

            {/* HEART — center */}
            {/* Soft glow */}
            <circle cx="150" cy="126" r="32" fill="#fde68a" opacity="0.45"/>
            {/* Heart shape */}
            <path d="M 150,112 C 150,112 136,99 121,104 C 106,109 106,128 150,152 C 194,128 194,109 179,104 C 164,99 150,112 150,112 Z" fill="#dc2626"/>
            {/* Highlight */}
            <path d="M 128,109 Q 122,118 124,129" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.4"/>

            {/* Sparkles between the heads */}
            <circle cx="150" cy="66" r="4.5" fill="#fbbf24"/>
            <path d="M 150,60 L 150,53" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 139,64 L 134,58" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
            <path d="M 161,63 L 166,57" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="133" cy="74" r="2" fill="#fb923c" opacity="0.7"/>
            <circle cx="167" cy="73" r="2" fill="#fb923c" opacity="0.7"/>
          </svg>
        </div>

      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search wishes…"
              className="input pr-10 w-full"
            />
            {searching ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </div>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                </svg>
              </div>
            )}
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input w-full sm:w-auto">
            <option value="">All categories</option>
            {WISH_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <select value={occasionType} onChange={e => setOccasionType(e.target.value)} className="input w-full sm:w-auto">
            <option value="">All occasions</option>
            {OCCASION_TYPES.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input w-full sm:w-auto">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most_saved">Most saved</option>
          </select>
        </div>

        {/* Filter pills */}
        {(q || category || occasionType) && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {q && (
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <span>🔍 {q}</span>
                <button onClick={() => setQ("")} className="hover:opacity-70">✕</button>
              </div>
            )}
            {category && (
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <span>🏷 {WISH_CATEGORIES.find(c => c.id === category)?.label}</span>
                <button onClick={() => setCategory("")} className="hover:opacity-70">✕</button>
              </div>
            )}
            {occasionType && (
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <span>🎂 {OCCASION_TYPES.find(o => o.id === occasionType)?.label}</span>
                <button onClick={() => setOccasionType("")} className="hover:opacity-70">✕</button>
              </div>
            )}
            <button
              onClick={() => { setQ(""); setCategory(""); setOccasionType(""); }}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Wish list */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Open wishes
          <span className="ml-2 text-sm font-normal text-gray-400">({wishes.length}{nextCursor ? "+" : ""})</span>
        </h2>
        {loading ? (
          <WishCardSkeletonList count={6} />
        ) : fetchError ? (
          <div className="error-msg text-center py-12">
            Failed to load wishes. Please try refreshing the page.
          </div>
        ) : wishes.length === 0 ? (
          <div className="card text-center py-16">
            {q || category || occasionType ? (
              <>
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No wishes match your filters</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <button
                  className="btn-primary inline-block"
                  onClick={() => { setCategory(""); setOccasionType(""); setQ(""); }}
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No wishes yet</h3>
                <p className="text-gray-500 mb-6">Be the first to make a wish and inspire others to help!</p>
                <Link href="/wishes/new" className="btn-primary inline-block">Create your wish</Link>
              </>
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
                      {wish.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {wish.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {wish.user.avatarUrl ? (
                          <img
                            src={wish.user.avatarUrl}
                            alt={wish.user.name}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-500 flex-shrink-0">
                            {wish.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="text-sm text-gray-500">
                          by <Link href={`/user/${wish.userId}`} className="font-medium text-gray-700 hover:text-orange-500">{wish.user.name}</Link>
                          {wish.user.locationCoarse && (
                            <span className="ml-1 text-gray-400">· {wish.user.locationCoarse}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full whitespace-nowrap font-medium">
                        {wish.category}
                      </span>
                      <FavouriteButton
                        wishId={wish.id}
                        initialFavourited={favouriteIds.has(wish.id)}
                        initialCount={wish._count.favourites}
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
