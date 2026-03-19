export type WishCategory =
  | "education"
  | "health"
  | "basic_needs"
  | "celebration"
  | "experiences"
  | "spiritual"
  | "other";

export const WISH_CATEGORIES: { id: WishCategory; label: string }[] = [
  { id: "education", label: "Education" },
  { id: "health", label: "Health & Wellbeing" },
  { id: "basic_needs", label: "Basic Needs" },
  { id: "celebration", label: "Gifts & Celebrations" },
  { id: "experiences", label: "Experiences" },
  { id: "spiritual", label: "Almsgiving & Spiritual" },
  { id: "other", label: "Other" }
];

export type BudgetRangeId = "under_10" | "10_25" | "25_50" | "50_100" | "over_100";

export const BUDGET_RANGES: {
  id: BudgetRangeId;
  label: string;
  min: number | null;
  max: number | null;
}[] = [
  { id: "under_10", label: "Under $10", min: null, max: 10 },
  { id: "10_25", label: "$10 - $25", min: 10, max: 25 },
  { id: "25_50", label: "$25 - $50", min: 25, max: 50 },
  { id: "50_100", label: "$50 - $100", min: 50, max: 100 },
  { id: "over_100", label: "Over $100", min: 100, max: null }
];

export type OccasionType =
  | "anytime_alms"
  | "birthday"
  | "wedding"
  | "graduation"
  | "religious"
  | "holiday"
  | "other";

export const OCCASION_TYPES: { id: OccasionType; label: string }[] = [
  { id: "anytime_alms", label: "Anytime (Almsgiving)" },
  { id: "birthday", label: "Birthday" },
  { id: "wedding", label: "Wedding" },
  { id: "graduation", label: "Graduation" },
  { id: "religious", label: "Religious / Spiritual Day" },
  { id: "holiday", label: "Holiday / Festival" },
  { id: "other", label: "Other" }
];

export type WishVisibility = "public" | "limited" | "private_link";

export const DEFAULT_VISIBILITY: WishVisibility = "public";

