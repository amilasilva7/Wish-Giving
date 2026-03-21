import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/sameOrigin";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pledge = await prisma.pledge.findUnique({
    where: { id: params.id },
    include: { wish: true }
  });

  if (!pledge) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { action } = body as { action: "accept" | "decline" | "mark_fulfilled" | "retract" };

  if (action === "accept") {
    // Only wisher can accept
    if (pledge.wish.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // C3: only accept a pending pledge
    if (pledge.status !== "pending") {
      return NextResponse.json({ error: "Invalid action for current pledge status" }, { status: 400 });
    }
    // C7: atomic update
    await prisma.$transaction([
      prisma.pledge.update({ where: { id: pledge.id }, data: { status: "accepted" } }),
      prisma.wish.update({ where: { id: pledge.wishId }, data: { status: "in_coordination" } })
    ]);
  } else if (action === "decline") {
    if (pledge.wish.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // C3: only decline a pending pledge
    if (pledge.status !== "pending") {
      return NextResponse.json({ error: "Invalid action for current pledge status" }, { status: 400 });
    }
    // C7: atomic update - check if other pending pledges remain before resetting wish status
    await prisma.$transaction(async (tx) => {
      await tx.pledge.update({ where: { id: pledge.id }, data: { status: "declined" } });
      const otherPending = await tx.pledge.findFirst({
        where: { wishId: pledge.wishId, status: "pending", id: { not: pledge.id } }
      });
      if (!otherPending) {
        await tx.wish.update({ where: { id: pledge.wishId }, data: { status: "open" } });
      }
    });
  } else if (action === "mark_fulfilled") {
    // Either wisher or giver can mark fulfilled in MVP
    if (pledge.wish.userId !== user.id && pledge.giverUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // C3: only fulfill an accepted or in_coordination pledge
    if (pledge.status !== "accepted" && pledge.status !== "in_coordination") {
      return NextResponse.json({ error: "Invalid action for current pledge status" }, { status: 400 });
    }
    // C7: atomic update
    await prisma.$transaction([
      prisma.pledge.update({ where: { id: pledge.id }, data: { status: "fulfilled" } }),
      prisma.wish.update({ where: { id: pledge.wishId }, data: { status: "fulfilled" } })
    ]);
  } else if (action === "retract") {
    // Only giver can retract
    if (pledge.giverUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Can only retract a pending pledge
    if (pledge.status !== "pending") {
      return NextResponse.json({ error: "Can only retract a pending pledge" }, { status: 400 });
    }
    await prisma.$transaction(async (tx) => {
      await tx.pledge.update({ where: { id: pledge.id }, data: { status: "retracted" } });
      // Check if other pending pledges remain
      const otherPending = await tx.pledge.findFirst({
        where: { wishId: pledge.wishId, status: "pending", id: { not: pledge.id } }
      });
      if (!otherPending) {
        await tx.wish.update({ where: { id: pledge.wishId }, data: { status: "open" } });
      }
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
