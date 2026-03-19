import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Params = {
  params: {
    wishId: string;
  };
};

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversation = await prisma.conversation.findFirst({
    where: { wishId: params.wishId },
    include: {
      pledge: { select: { giverUserId: true } },
      wish: { select: { userId: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true } }
        }
      }
    }
  });

  if (!conversation) {
    return NextResponse.json({ conversation: null });
  }

  // C4: only the wisher or the accepted giver may read messages
  if (conversation.wish.userId !== user.id && conversation.pledge?.giverUserId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ conversation });
}

export async function POST(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only wisher and accepted giver can have a conversation
  const pledge = await prisma.pledge.findFirst({
    where: {
      wishId: params.wishId,
      status: { in: ["accepted", "in_coordination"] }
    },
    include: { wish: true }
  });

  if (!pledge) {
    return NextResponse.json({ error: "No active pledge to chat about" }, { status: 400 });
  }

  if (pledge.wish.userId !== user.id && pledge.giverUserId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.conversation.findFirst({
    where: { wishId: params.wishId, pledgeId: pledge.id }
  });

  if (existing) {
    return NextResponse.json({ conversation: existing });
  }

  const conversation = await prisma.conversation.create({
    data: {
      wishId: params.wishId,
      pledgeId: pledge.id
    }
  });

  return NextResponse.json({ conversation }, { status: 201 });
}

