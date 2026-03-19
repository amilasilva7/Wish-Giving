"use client";

type Props = {
  label?: string;
};

/**
 * Full-page blocking overlay shown during async actions.
 * Render it conditionally next to the page content:
 *
 *   {saving && <PageLoader label="Saving wish…" />}
 */
export default function PageLoader({ label = "Please wait…" }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
      <span
        className="loader-ring w-10 h-10 text-orange-500"
        style={{ borderWidth: "3px" }}
      />
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}
