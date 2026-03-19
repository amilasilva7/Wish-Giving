import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  accepted: "bg-blue-50 text-blue-700",
  in_coordination: "bg-purple-50 text-purple-700",
  declined: "bg-gray-100 text-gray-500",
  fulfilled: "bg-green-50 text-green-700"
};

export default async function MyPledgesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">You must be signed in to view your pledges.</p>
        <Link href="/auth/login" className="btn-primary inline-block">Login</Link>
      </div>
    );
  }

  const pledges = await prisma.pledge.findMany({
    where: { giverUserId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      wish: { select: { id: true, title: true, userId: true } }
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My pledges</h1>
      {pledges.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          You haven't pledged to any wishes yet.{" "}
          <Link href="/" className="text-orange-500 hover:underline">Browse wishes</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {pledges.map(pledge => (
            <li key={pledge.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Link href={`/wish/${pledge.wish.id}`} className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">
                    {pledge.wish.title}
                  </Link>
                  {pledge.message && (
                    <p className="text-sm text-gray-500 mt-0.5 italic">"{pledge.message}"</p>
                  )}
                  {pledge.expiresAt && pledge.status === "pending" && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Expires: {new Date(pledge.expiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[pledge.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {pledge.status.replace("_", " ")}
                  </span>
                  {(pledge.status === "accepted" || pledge.status === "in_coordination") && (
                    <Link href={`/chat/${pledge.wish.id}`} className="btn-primary text-xs px-3 py-1.5 inline-block">
                      Chat
                    </Link>
                  )}
                  {pledge.status === "fulfilled" && (
                    <span className="text-xs text-green-600 font-medium">✓ Fulfilled</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
