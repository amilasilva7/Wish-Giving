import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 mb-4">You must be signed in to view your profile.</p>
        <Link href="/auth/login" className="btn-primary inline-block">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your profile</h1>
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" width={64} height={64} className="rounded-full w-16 h-16 object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xl font-semibold text-gray-900">{user.name}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
              user.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>{user.status}</span>
          </div>
          {user.locationCoarse && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Location</span>
              <span className="font-medium text-gray-700">{user.locationCoarse}</span>
            </div>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link href="/wishes" className="btn-secondary inline-block">View my wishes</Link>
        </div>
      </div>
    </div>
  );
}
