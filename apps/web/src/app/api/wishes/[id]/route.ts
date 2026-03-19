import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/sameOrigin";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wish = await prisma.wish.findFirst({
    where: { id: params.id, userId: user.id }
  });

  if (!wish) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ wish });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.wish.findFirst({
    where: { id: params.id, userId: user.id }
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();

  const wish = await prisma.wish.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      category: body.category ?? existing.category,
      budgetMin: body.budgetMin ?? existing.budgetMin,
      budgetMax: body.budgetMax ?? existing.budgetMax,
      budgetRangeId: body.budgetRangeId ?? existing.budgetRangeId,
      occasionType: body.occasionType ?? existing.occasionType,
      visibility: body.visibility ?? existing.visibility,
      locationCoarse: body.locationCoarse ?? existing.locationCoarse,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : existing.expiresAt
    }
  });

  return NextResponse.json({ wish });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.wish.findFirst({
    where: { id: params.id, userId: user.id }
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.wish.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}

