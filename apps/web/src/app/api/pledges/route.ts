import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/sameOrigin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pledges = await prisma.pledge.findMany({
    where: { giverUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      wish: {
        select: { title: true }
      }
    }
  });

  return NextResponse.json({ pledges });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { wishId, message } = body;

  if (!wishId) {
    return NextResponse.json({ error: "Missing wishId" }, { status: 400 });
  }

  const wish = await prisma.wish.findUnique({ where: { id: wishId } });
  if (!wish || wish.status !== "open") {
    return NextResponse.json({ error: "Wish not available" }, { status: 400 });
  }

  // Enforce single active pledge per wish (pending/accepted/in_coordination)
  const activePledge = await prisma.pledge.findFirst({
    where: {
      wishId,
      status: { in: ["pending", "accepted", "in_coordination"] }
    }
  });
  if (activePledge) {
    return NextResponse.json({ error: "Wish already has an active pledge" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  const pledge = await prisma.pledge.create({
    data: {
      wishId,
      giverUserId: user.id,
      message: message ?? null,
      status: "pending",
      expiresAt
    }
  });

  await prisma.wish.update({
    where: { id: wishId },
    data: { status: "pledged" }
  });

  return NextResponse.json({ pledge }, { status: 201 });
}

