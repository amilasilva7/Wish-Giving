import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { isSameOrigin } from "@/lib/sameOrigin";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.error === "Unauthorized" ? 401 : 403 }
    );
  }

  const body = await request.json();
  const { status } = body as { status: "active" | "disabled" };

  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { status }
  });

  return NextResponse.json({ ok: true });
}

