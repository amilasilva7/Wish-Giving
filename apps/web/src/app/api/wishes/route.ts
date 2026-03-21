import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/sameOrigin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wishes = await prisma.wish.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { pledges: true, favourites: true } }
    }
  });

  return NextResponse.json({ wishes });
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
  const {
    title,
    description,
    category,
    budgetMin,
    budgetMax,
    budgetRangeId,
    occasionType,
    visibility,
    locationCoarse,
    expiresAt
  } = body;

  if (!title || !description || !category || !occasionType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const wish = await prisma.wish.create({
    data: {
      userId: user.id,
      title,
      description,
      category,
      budgetMin: budgetMin ?? null,
      budgetMax: budgetMax ?? null,
      budgetRangeId: budgetRangeId ?? null,
      occasionType,
      visibility: visibility ?? "public",
      locationCoarse: locationCoarse ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    }
  });

  return NextResponse.json({ wish }, { status: 201 });
}

