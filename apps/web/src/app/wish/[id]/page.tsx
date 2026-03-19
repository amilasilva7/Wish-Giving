import { prisma } from "@/lib/prisma";
import Link from "next/link";

type Params = {
  params: {
    id: string;
  };
};

export default async function WishDetailPage({ params }: Params) {
  const wish = await prisma.wish.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          name: true,
          locationCoarse: true
        }
      }
    }
  });

  if (!wish || wish.visibility === "private_link") {
    return (
      <div className="card text-center py-12 text-gray-500">
        Wish not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{wish.title}</h1>
          <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium whitespace-nowrap">
            {wish.category}
          </span>
        </div>
        <p className="text-gray-600 leading-relaxed mb-6">{wish.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4 mb-6">
          <span>By <span className="font-medium text-gray-700">{wish.user.name}</span></span>
          {wish.user.locationCoarse && <span>· {wish.user.locationCoarse}</span>}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
            wish.status === "open" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {wish.status}
          </span>
        </div>
        {wish.status === "open" && (
          <Link href={`/pledge/${wish.id}`} className="btn-primary inline-block">
            Pledge to fulfill this wish
          </Link>
        )}
      </div>
    </div>
  );
}
