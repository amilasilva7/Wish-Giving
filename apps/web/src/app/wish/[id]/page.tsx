import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import FavouriteButton from "@/app/components/FavouriteButton";
import ShareButton from "@/app/components/ShareButton";

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

  // Determine the current status step
  const statusSteps = ["open", "pledged", "in_coordination", "fulfilled"];
  const currentStepIndex = statusSteps.indexOf(wish.status);

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

        {/* Status Timeline */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            {statusSteps.map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                {/* Dot */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white ${
                  idx === currentStepIndex ? "bg-orange-500" :
                  idx < currentStepIndex ? "bg-gray-400" :
                  "bg-gray-200"
                }`}>
                  {idx < currentStepIndex ? "✓" : (idx + 1)}
                </div>
                {/* Line */}
                {idx < statusSteps.length - 1 && (
                  <div className={`h-1 flex-1 mx-1 ${
                    idx < currentStepIndex ? "bg-gray-400" : "bg-gray-200"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex text-xs text-gray-500">
            {statusSteps.map((step, idx) => (
              <div key={step} className={`flex-1 text-center ${
                idx === currentStepIndex ? "font-bold text-orange-600" :
                idx < currentStepIndex ? "text-gray-600" :
                "text-gray-400"
              }`}>
                {step.replace("_", " ")}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
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

        <div className="flex gap-3">
          {wish.status === "open" && !isExpired && (
            <Link href={`/pledge/${wish.id}`} className="btn-primary inline-block">
              Pledge to fulfill this wish
            </Link>
          )}
          <ShareButton
            url={typeof window !== "undefined" ? window.location.href : `${process.env.NEXT_PUBLIC_BASE_URL || ""}/wish/${wish.id}`}
            title={wish.title}
          />
        </div>
        {isExpired && (
          <p className="text-sm text-gray-400 italic">This wish has expired and is no longer accepting pledges.</p>
        )}
      </div>
    </div>
  );
}
