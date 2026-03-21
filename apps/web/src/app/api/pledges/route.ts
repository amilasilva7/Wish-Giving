import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
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
        select: { id: true, title: true }  // C1: include id so pledge/chat links work
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

  // C2: Prevent self-pledging
  if (wish.userId === user.id) {
    return NextResponse.json({ error: "You cannot pledge on your own wish" }, { status: 400 });
  }

  // Prevent the same giver from pledging twice on the same wish
  const existingPledge = await prisma.pledge.findFirst({
    where: { wishId, giverUserId: user.id, status: { in: ["pending", "accepted", "in_coordination"] } }
  });
  if (existingPledge) {
    return NextResponse.json({ error: "You already have an active pledge on this wish" }, { status: 400 });
  }

  // C8: Enforce blocks in both directions
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: user.id, blockedId: wish.userId },
        { blockerId: wish.userId, blockedId: user.id }
      ]
    }
  });
  if (block) {
    return NextResponse.json({ error: "Cannot pledge on this wish" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  // C6: Move activePledge check inside transaction to prevent TOCTOU race
  try {
    const pledge = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const activePledge = await tx.pledge.findFirst({
        where: {
          wishId,
          status: { in: ["accepted", "in_coordination"] }
        }
      });
      if (activePledge) {
        throw new Error("ACTIVE_PLEDGE");
      }

      const newPledge = await tx.pledge.create({
        data: {
          wishId,
          giverUserId: user.id,
          message: message ?? null,
          status: "pending",
          expiresAt
        }
      });

      await tx.wish.update({
        where: { id: wishId },
        data: { status: "pledged" }
      });

      return newPledge;
    });

    return NextResponse.json({ pledge }, { status: 201 });
  } catch (err: any) {
    if (err.message === "ACTIVE_PLEDGE") {
      return NextResponse.json({ error: "Wish already has an active pledge" }, { status: 400 });
    }
    throw err;
  }
}

