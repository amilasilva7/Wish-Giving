"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SparkLoader from "@/app/components/SparkLoader";

type Props = {
  wishId: string;
  initialFavourited: boolean;
  initialCount?: number;
  size?: "sm" | "md";
  onToggle?: (isFavourited: boolean) => void;
};

export default function FavouriteButton({ wishId, initialFavourited, initialCount = 0, size = "md", onToggle }: Props) {
  const [favourited, setFavourited] = useState(initialFavourited);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setFavourited(initialFavourited);
  }, [initialFavourited]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const res = await fetch("/api/favourites", {
      method: favourited ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishId })
    });
    setLoading(false);
    if (res.status === 401) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (res.ok) {
      const newState = !favourited;
      setFavourited(newState);
      setCount(prev => newState ? prev + 1 : Math.max(0, prev - 1));
      onToggle?.(newState);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={favourited ? "Remove from favourites" : "Add to favourites"}
      aria-label={favourited ? "Remove from favourites" : "Add to favourites"}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all
        ${favourited
          ? "border-red-300 text-red-500 bg-red-50 hover:bg-red-100"
          : "border-gray-300 text-gray-500 bg-white hover:border-red-300 hover:text-red-400"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading
        ? <SparkLoader size="sm" />
        : <>
            <span>{favourited ? "❤" : "♡"}</span>
            {count > 0 && <span className="opacity-60">· {count}</span>}
          </>
      }
    </button>
  );
}
