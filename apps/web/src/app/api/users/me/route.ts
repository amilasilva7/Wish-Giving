import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/sameOrigin";

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, avatarUrl, locationCoarse } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
      ...(locationCoarse !== undefined && { locationCoarse: locationCoarse || null })
    },
    select: { id: true, name: true, email: true, avatarUrl: true, locationCoarse: true, status: true }
  });

  return NextResponse.json({ user: updated });
}
