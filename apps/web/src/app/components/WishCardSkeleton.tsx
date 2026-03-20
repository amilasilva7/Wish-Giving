export function WishCardSkeleton() {
  return (
    <li className="card animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </li>
  );
}

export function WishCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-3">
      {[...Array(count)].map((_, i) => (
        <WishCardSkeleton key={i} />
      ))}
    </ul>
  );
}
