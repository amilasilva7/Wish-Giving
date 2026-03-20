"use client";

import { useToast } from "./Toast";

interface ShareButtonProps {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const { showToast } = useToast();

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Wish-Giving",
          text: title,
          url
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard!", "success");
      } catch {
        showToast("Failed to copy link", "error");
      }
    }
  }

  return (
    <button onClick={handleShare} className="btn-secondary">
      Share wish
    </button>
  );
}
