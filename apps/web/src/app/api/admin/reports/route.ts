import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { isSameOrigin } from "@/lib/sameOrigin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.error === "Unauthorized" ? 401 : 403 });
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      reporter: { select: { id: true, email: true, name: true } }
    }
  });

  return NextResponse.json({ reports });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.error === "Unauthorized" ? 401 : 403 });
  }

  const body = await request.json();
  const { reportId, status } = body as { reportId: string; status: "open" | "closed" };

  if (!reportId || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status }
  });

  return NextResponse.json({ ok: true });
}

