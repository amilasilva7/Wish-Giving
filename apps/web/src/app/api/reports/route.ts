import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/sameOrigin";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { targetType, targetId, reason } = body as {
    targetType: "user" | "wish" | "message";
    targetId: string;
    reason: string;
  };

  if (!targetType || !targetId || !reason) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.report.create({
    data: {
      reporterUserId: user.id,
      targetType,
      targetId,
      reason
    }
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

