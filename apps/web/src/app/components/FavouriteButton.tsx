"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  wishId: string;
  initialFavourited: boolean;
  size?: "sm" | "md";
  onToggle?: (isFavourited: boolean) => void;
};

export default function FavouriteButton({ wishId, initialFavourited, size = "md", onToggle }: Props) {
  const [favourited, setFavourited] = useState(initialFavourited);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      onToggle?.(newState);
    }
  }

  const textSize = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={favourited ? "Remove from favourites" : "Save to favourites"}
      aria-label={favourited ? "Remove from favourites" : "Save to favourites"}
      className={`${textSize} leading-none transition-transform hover:scale-110 active:scale-125 disabled:opacity-50 disabled:cursor-not-allowed select-none`}
    >
      {loading ? "⏳" : favourited ? "❤️" : "🤍"}
    </button>
  );
}
