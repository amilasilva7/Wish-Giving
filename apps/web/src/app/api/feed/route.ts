import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") || undefined;
  const occasionType = searchParams.get("occasionType") || undefined;
  const q = searchParams.get("q") || undefined;
  const cursor = searchParams.get("cursor") || undefined;
  const sort = searchParams.get("sort") || "newest";

  const where: any = {
    status: "open",
    visibility: "public",
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    // M5: only show wishes from active users
    user: { status: "active" }
  };

  if (category) where.category = category;
  if (occasionType) where.occasionType = occasionType;
  if (q) {
    where.AND = [
      {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } }
        ]
      }
    ];
  }

  // C8/M5: hide wishes from blocked users (works for logged-in users only)
  try {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const blocks = await prisma.block.findMany({
        where: {
          OR: [
            { blockerId: currentUser.id },
            { blockedId: currentUser.id }
          ]
        },
        select: { blockerId: true, blockedId: true }
      });
      if (blocks.length > 0) {
        const blockedIds = blocks.map((b: { blockerId: string; blockedId: string }) =>
          b.blockerId === currentUser.id ? b.blockedId : b.blockerId
        );
        where.userId = { notIn: blockedIds };
      }
    }
  } catch {
    // non-fatal: if auth check fails, just show unfiltered feed
  }

  const orderBy: any = sort === "oldest" ? { createdAt: "asc" }
    : sort === "most_saved" ? { favourites: { _count: "desc" } }
    : { createdAt: "desc" }; // newest (default)

  const wishes = await prisma.wish.findMany({
    where,
    orderBy,
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: {
        select: { name: true, locationCoarse: true, avatarUrl: true }
      },
      _count: { select: { favourites: true } }
    }
  });

  const hasMore = wishes.length > PAGE_SIZE;
  const items = hasMore ? wishes.slice(0, PAGE_SIZE) : wishes;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ wishes: items, nextCursor });
}
