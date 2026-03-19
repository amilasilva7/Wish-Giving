import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WISH_CATEGORIES, OCCASION_TYPES } from "@/domain/taxonomy";

type SearchParams = {
  category?: string;
  occasionType?: string;
};

export default async function HomePage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const where: any = {
    status: "open",
    visibility: "public"
  };
  if (searchParams.category) where.category = searchParams.category;
  if (searchParams.occasionType) where.occasionType = searchParams.occasionType;

  const wishes = await prisma.wish.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          name: true,
          locationCoarse: true
        }
      }
    }
  });

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Make a wish. Grant a wish.
        </h1>
        <p className="text-lg text-gray-500 mb-6">
          Browse real wishes and find opportunities to make someone's day.
        </p>
        <Link href="/wishes/new" className="btn-primary text-base px-6 py-3 inline-block">
          Create your own wish
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Filter wishes</h2>
        <form className="flex flex-wrap gap-4 items-end">
          <div className="form-field flex-1 min-w-40">
            <label className="label">Category</label>
            <select name="category" defaultValue={searchParams.category ?? ""} className="input">
              <option value="">All categories</option>
              {WISH_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="form-field flex-1 min-w-40">
            <label className="label">Occasion</label>
            <select name="occasionType" defaultValue={searchParams.occasionType ?? ""} className="input">
              <option value="">All occasions</option>
              {OCCASION_TYPES.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">Apply</button>
        </form>
      </div>

      {/* Wish list */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Open wishes
          <span className="ml-2 text-sm font-normal text-gray-400">({wishes.length})</span>
        </h2>
        {wishes.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            No wishes found. <Link href="/wishes/new" className="text-orange-500 hover:underline">Be the first!</Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {wishes.map(wish => (
              <li key={wish.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/wish/${wish.id}`} className="text-lg font-semibold text-gray-900 hover:text-orange-500 transition-colors">
                      {wish.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      by <span className="font-medium text-gray-700">{wish.user.name}</span>
                      {wish.user.locationCoarse && (
                        <span className="ml-1 text-gray-400">· {wish.user.locationCoarse}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full whitespace-nowrap font-medium">
                    {wish.category}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
