"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PledgeButton({ wishId, isAuthed }: { wishId: string; isAuthed: boolean }) {
  const router = useRouter();

  if (isAuthed) {
    return (
      <Link href={`/pledge/${wishId}`} className="btn-primary inline-block">
        Pledge to fulfill this wish
      </Link>
    );
  }

  return (
    <button
      className="btn-primary"
      onClick={() => router.push("/auth/login?redirect=" + encodeURIComponent("/pledge/" + wishId))}
    >
      Pledge to fulfill this wish
    </button>
  );
}
