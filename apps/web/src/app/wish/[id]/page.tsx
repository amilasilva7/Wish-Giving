import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import FavouriteButton from "@/app/components/FavouriteButton";

export const dynamic = "force-dynamic";

type Params = {
  params: {
    id: string;
  };
};

export default async function WishDetailPage({ params }: Params) {
  const [wish, user] = await Promise.all([
    prisma.wish.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            locationCoarse: true
          }
        },
        _count: { select: { favourites: true } }
      }
    }),
    getCurrentUser()
  ]);

  if (!wish) {
    return (
      <div className="card text-center py-12 text-gray-500">
        Wish not found.
      </div>
    );
  }

  let isFavourited = false;
  if (user) {
    const fav = await prisma.favourite.findUnique({
      where: { userId_wishId: { userId: user.id, wishId: wish.id } }
    });
    isFavourited = !!fav;
  }

  const isExpired = wish.expiresAt && wish.expiresAt < new Date();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{wish.title}</h1>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium whitespace-nowrap">
              {wish.category}
            </span>
            <FavouriteButton wishId={wish.id} initialFavourited={isFavourited} initialCount={wish._count.favourites} />
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed mb-6">{wish.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4 mb-6">
          <span>By <Link href={`/user/${wish.userId}`} className="font-medium text-gray-700 hover:text-orange-500">{wish.user.name}</Link></span>
          {wish.user.locationCoarse && <span>· {wish.user.locationCoarse}</span>}
          {wish.expiresAt && (
            <span className="text-xs text-gray-400">
              {isExpired ? "Expired" : `Expires ${new Date(wish.expiresAt).toLocaleDateString()}`}
            </span>
          )}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
            wish.status === "open" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {wish.status.replace("_", " ")}
          </span>
        </div>
        {wish.status === "open" && !isExpired && (
          <Link href={`/pledge/${wish.id}`} className="btn-primary inline-block">
            Pledge to fulfill this wish
          </Link>
        )}
        {isExpired && (
          <p className="text-sm text-gray-400 italic">This wish has expired and is no longer accepting pledges.</p>
        )}
      </div>
    </div>
  );
}
