import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, isAdmin: false }, { status: 200 });
  }
  return NextResponse.json({ user, isAdmin: isAdminEmail(user.email) });
}
