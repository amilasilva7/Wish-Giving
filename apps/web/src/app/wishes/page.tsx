import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function WishesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">You must be signed in to manage wishes.</p>
        <Link href="/auth/login" className="btn-primary inline-block">Login</Link>
      </div>
    );
  }

  const wishes = await prisma.wish.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your wishes</h1>
        <Link href="/wishes/new" className="btn-primary">+ New wish</Link>
      </div>
      {wishes.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          You haven't made any wishes yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {wishes.map(wish => (
            <li key={wish.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <Link href={`/wishes/${wish.id}`} className="font-semibold text-gray-900 hover:text-orange-500 transition-colors">
                  {wish.title}
                </Link>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    wish.status === "open" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {wish.status}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {wish.visibility}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
