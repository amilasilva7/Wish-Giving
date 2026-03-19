"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WISH_CATEGORIES, OCCASION_TYPES } from "@/domain/taxonomy";

type Wish = {
  id: string;
  title: string;
  description: string;
  category: string;
  occasionType: string;
  visibility: string;
  locationCoarse: string | null;
};

export default function EditWishPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wish, setWish] = useState<Wish | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWish() {
      const res = await fetch(`/api/wishes/${params.id}`);
      if (!res.ok) {
        setError("Failed to load wish");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setWish(data.wish);
      setLoading(false);
    }
    fetchWish();
  }, [params.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!wish) return;
    setError(null);
    const res = await fetch(`/api/wishes/${wish.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(wish)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to update wish");
      return;
    }
    router.push("/wishes");
  }

  async function handleDelete() {
    if (!wish) return;
    const res = await fetch(`/api/wishes/${wish.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete wish");
      return;
    }
    router.push("/wishes");
  }

  if (loading) {
    return <div className="card text-center py-12 text-gray-400">Loading...</div>;
  }

  if (!wish) {
    return <div className="card text-center py-12 text-gray-500">Wish not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit wish</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-field">
            <label className="label">Title</label>
            <input type="text" value={wish.title}
              onChange={e => setWish({ ...wish, title: e.target.value })}
              className="input" required />
          </div>
          <div className="form-field">
            <label className="label">Description</label>
            <textarea value={wish.description}
              onChange={e => setWish({ ...wish, description: e.target.value })}
              className="input min-h-24 resize-y" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label className="label">Category</label>
              <select value={wish.category} onChange={e => setWish({ ...wish, category: e.target.value })} className="input">
                {WISH_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="label">Occasion</label>
              <select value={wish.occasionType} onChange={e => setWish({ ...wish, occasionType: e.target.value })} className="input">
                {OCCASION_TYPES.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label className="label">Visibility</label>
              <select value={wish.visibility} onChange={e => setWish({ ...wish, visibility: e.target.value })} className="input">
                <option value="public">Public</option>
                <option value="limited">Limited</option>
                <option value="private_link">Private link</option>
              </select>
            </div>
            <div className="form-field">
              <label className="label">City / Area</label>
              <input type="text" value={wish.locationCoarse ?? ""}
                onChange={e => setWish({ ...wish, locationCoarse: e.target.value })}
                className="input" />
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Save changes</button>
              <button type="button" onClick={() => router.push("/wishes")} className="btn-secondary">Cancel</button>
            </div>
            <button type="button" onClick={handleDelete} className="btn-danger">Delete wish</button>
          </div>
        </form>
      </div>
    </div>
  );
}
