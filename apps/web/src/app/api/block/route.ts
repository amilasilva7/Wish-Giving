import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/sameOrigin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ blockedIds: [] });
  }
  const blocks = await prisma.block.findMany({
    where: { blockerId: user.id },
    select: { blockedId: true }
  });
  return NextResponse.json({ blockedIds: blocks.map(b => b.blockedId) });
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
  const { blockedUserId } = body;

  if (!blockedUserId) {
    return NextResponse.json({ error: "Missing blockedUserId" }, { status: 400 });
  }

  if (blockedUserId === user.id) {
    return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
  }

  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId: blockedUserId } },
    create: { blockerId: user.id, blockedId: blockedUserId },
    update: {}
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { blockedUserId } = body;

  if (!blockedUserId) {
    return NextResponse.json({ error: "Missing blockedUserId" }, { status: 400 });
  }

  await prisma.block.deleteMany({
    where: { blockerId: user.id, blockedId: blockedUserId }
  });

  return NextResponse.json({ ok: true });
}
