import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/sameOrigin";
import crypto from "crypto";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const body = await request.json();
  const { email } = body;
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  // Always return success to prevent email enumeration
  if (!user || user.emailVerifiedAt) {
    return NextResponse.json({ ok: true });
  }

  // Generate new token
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken: token
    }
  });

  // In a real app, send email here. For now, log the token.
  console.log(`[RESEND VERIFICATION] token for ${email}: ${token}`);

  return NextResponse.json({ ok: true });
}
