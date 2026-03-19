import { getCurrentUser } from "@/lib/auth";

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, error: "Unauthorized" as const };
  const admins = parseAdminEmails();
  if (!admins.includes(user.email.toLowerCase())) {
    return { ok: false as const, error: "Forbidden" as const };
  }
  return { ok: true as const, user };
}

