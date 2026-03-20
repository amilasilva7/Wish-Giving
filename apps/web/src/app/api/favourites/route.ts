import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favourites = await prisma.favourite.findMany({
    where: { userId: user.id },
    include: {
      wish: {
        select: {
          id: true,
          title: true,
          category: true,
          userId: true,
          status: true,
          user: { select: { name: true } },
          _count: { select: { favourites: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ favourites: favourites.map(f => f.wish) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { wishId } = await req.json();
  if (!wishId) return NextResponse.json({ error: "wishId required" }, { status: 400 });

  const wish = await prisma.wish.findUnique({ where: { id: wishId }, select: { id: true } });
  if (!wish) return NextResponse.json({ error: "Wish not found" }, { status: 404 });

  await prisma.favourite.upsert({
    where: { userId_wishId: { userId: user.id, wishId } },
    create: { userId: user.id, wishId },
    update: {}
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { wishId } = await req.json();
  if (!wishId) return NextResponse.json({ error: "wishId required" }, { status: 400 });

  await prisma.favourite.deleteMany({ where: { userId: user.id, wishId } });

  return NextResponse.json({ ok: true });
}
