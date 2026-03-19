import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      locationCoarse: true,
      createdAt: true,
      wishes: {
        where: { visibility: "public", status: "open" },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, category: true, status: true, createdAt: true }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
