import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wish = await prisma.wish.findUnique({ where: { id: params.id } });
  if (!wish || wish.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pledges = await prisma.pledge.findMany({
    where: { wishId: params.id },
    orderBy: { createdAt: "desc" },
    include: {
      giver: { select: { id: true, name: true, avatarUrl: true, locationCoarse: true } }
    }
  });

  return NextResponse.json({ pledges, wish });
}
