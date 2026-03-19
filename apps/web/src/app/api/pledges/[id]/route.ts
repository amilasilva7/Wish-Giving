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
  const { action } = body as { action: "accept" | "decline" | "mark_fulfilled" };

  if (action === "accept") {
    // Only wisher can accept
    if (pledge.wish.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.pledge.update({
      where: { id: pledge.id },
      data: { status: "accepted" }
    });
    await prisma.wish.update({
      where: { id: pledge.wishId },
      data: { status: "in_coordination" }
    });
  } else if (action === "decline") {
    if (pledge.wish.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.pledge.update({
      where: { id: pledge.id },
      data: { status: "declined" }
    });
    await prisma.wish.update({
      where: { id: pledge.wishId },
      data: { status: "open" }
    });
  } else if (action === "mark_fulfilled") {
    // Either wisher or giver can mark fulfilled in MVP
    if (pledge.wish.userId !== user.id && pledge.giverUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.pledge.update({
      where: { id: pledge.id },
      data: { status: "fulfilled" }
    });
    await prisma.wish.update({
      where: { id: pledge.wishId },
      data: { status: "fulfilled" }
    });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

