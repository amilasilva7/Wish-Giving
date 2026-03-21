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
  const { name, avatarUrl, locationCoarse, currentPassword, newPassword, email } = body;

  // Handle password change
  if (currentPassword && newPassword) {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true }
    });
    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(currentPassword, fullUser?.passwordHash ?? "");
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
    return NextResponse.json({ ok: true });
  }

  const updateData: Record<string, unknown> = {};

  if (name !== undefined) updateData.name = String(name).trim();
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;
  if (locationCoarse !== undefined) updateData.locationCoarse = locationCoarse || null;

  // Handle email change
  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    updateData.email = email.toLowerCase().trim();
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: { id: true, name: true, email: true, avatarUrl: true, locationCoarse: true, status: true }
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.user.delete({ where: { id: user.id } });
  const { clearSession } = await import("@/lib/auth");
  clearSession();
  return NextResponse.json({ ok: true });
}
