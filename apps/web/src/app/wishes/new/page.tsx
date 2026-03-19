"use client";

import { FormEvent, useState } from "react";
import { WISH_CATEGORIES, OCCASION_TYPES } from "@/domain/taxonomy";

export default function NewWishPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(WISH_CATEGORIES[0]?.id ?? "");
  const [occasionType, setOccasionType] = useState(OCCASION_TYPES[0]?.id ?? "");
  const [visibility, setVisibility] = useState<"public" | "limited" | "private_link">("public");
  const [locationCoarse, setLocationCoarse] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, occasionType, visibility, locationCoarse })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create wish");
      return;
    }
    window.location.href = "/wishes";
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a wish</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-field">
            <label className="label">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="input" placeholder="e.g. Birthday gift for my daughter" required />
          </div>
          <div className="form-field">
            <label className="label">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="input min-h-24 resize-y" placeholder="Describe your wish in detail..." required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label className="label">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                {WISH_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="label">Occasion</label>
              <select value={occasionType} onChange={e => setOccasionType(e.target.value)} className="input">
                {OCCASION_TYPES.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-field">
              <label className="label">Visibility</label>
              <select value={visibility} onChange={e => setVisibility(e.target.value as any)} className="input">
                <option value="public">Public</option>
                <option value="limited">Limited (coarse info only)</option>
                <option value="private_link">Private link</option>
              </select>
            </div>
            <div className="form-field">
              <label className="label">City / Area (optional)</label>
              <input type="text" value={locationCoarse} onChange={e => setLocationCoarse(e.target.value)}
                className="input" placeholder="e.g. Mumbai" />
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">Save wish</button>
            <a href="/wishes" className="btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
}
