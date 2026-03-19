import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const AUTH_COOKIE = "wg_session";
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-me";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

type TokenPayload = {
  userId: string;
};

export async function createSession(userId: string) {
  const token = jwt.sign({ userId } as TokenPayload, AUTH_SECRET, {
    expiresIn: SESSION_TTL_SECONDS
  });

  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/"
  });
}

export function clearSession() {
  cookies().set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export async function getCurrentUser() {
  const cookie = cookies().get(AUTH_COOKIE);
  if (!cookie?.value) return null;

  try {
    const decoded = jwt.verify(cookie.value, AUTH_SECRET) as TokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        locationCoarse: true,
        status: true
      }
    });
    return user;
  } catch {
    return null;
  }
}

