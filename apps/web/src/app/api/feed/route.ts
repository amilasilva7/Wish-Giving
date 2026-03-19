import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") || undefined;
  const occasionType = searchParams.get("occasionType") || undefined;
  const q = searchParams.get("q") || undefined;
  const cursor = searchParams.get("cursor") || undefined;

  const where: any = {
    status: "open",
    visibility: "public",
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
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

  const wishes = await prisma.wish.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: {
        select: { name: true, locationCoarse: true }
      }
    }
  });

  const hasMore = wishes.length > PAGE_SIZE;
  const items = hasMore ? wishes.slice(0, PAGE_SIZE) : wishes;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ wishes: items, nextCursor });
}
