import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// For MVP, blocking is handled client-side (e.g. hiding messages from a user)
// This endpoint is a placeholder to evolve into a persisted block list.

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

