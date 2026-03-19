import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSameOrigin } from "@/lib/sameOrigin";

type Params = {
  params: {
    conversationId: string;
  };
};

const MESSAGE_RATE_LIMIT_SECONDS = 5;

export async function POST(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.conversationId },
    include: {
      wish: true,
      pledge: true
    }
  });

  if (!conversation || !conversation.pledge) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { wish, pledge } = conversation;
  if (wish.userId !== user.id && pledge.giverUserId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bodyJson = await request.json();
  const { body } = bodyJson as { body: string };

  if (!body || body.length > 2000) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  // Simple rate limiting: last message within X seconds
  const lastMessage = await prisma.message.findFirst({
    where: {
      conversationId: conversation.id,
      senderUserId: user.id
    },
    orderBy: { createdAt: "desc" }
  });

  if (lastMessage) {
    const diffSeconds =
      (Date.now() - new Date(lastMessage.createdAt).getTime()) / 1000;
    if (diffSeconds < MESSAGE_RATE_LIMIT_SECONDS) {
      return NextResponse.json({ error: "Too many messages" }, { status: 429 });
    }
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderUserId: user.id,
      body
    }
  });

  return NextResponse.json({ message }, { status: 201 });
}

