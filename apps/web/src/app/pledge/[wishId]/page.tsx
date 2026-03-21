import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PledgeForm from "./PledgeForm";

export const dynamic = "force-dynamic";

type Params = { params: { wishId: string } };

export default async function PledgePage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?redirect=" + encodeURIComponent("/pledge/" + params.wishId));
  }

  const wish = await prisma.wish.findUnique({
    where: { id: params.wishId },
    include: { user: { select: { name: true, locationCoarse: true } } }
  });

  if (!wish || wish.status !== "open") {
    redirect("/wishes");
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pledge to fulfill this wish</h1>

      <div className="card mb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="font-semibold text-gray-900">{wish.title}</h2>
          <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0">
            {wish.category}
          </span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">{wish.description}</p>
        <p className="text-xs text-gray-400">
          By <span className="font-medium text-gray-600">{wish.user.name}</span>
          {wish.user.locationCoarse && ` · ${wish.user.locationCoarse}`}
        </p>
      </div>

      <PledgeForm wishId={params.wishId} />
    </div>
  );
}
