import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") || undefined;
  const occasionType = searchParams.get("occasionType") || undefined;
  const status = "open";

  const where: any = {
    status,
    visibility: "public"
  };

  if (category) where.category = category;
  if (occasionType) where.occasionType = occasionType;

  const wishes = await prisma.wish.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          name: true,
          locationCoarse: true
        }
      }
    }
  });

  return NextResponse.json({ wishes });
}

