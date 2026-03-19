type Props = {
  /** Text shown beside the spinner */
  label?: string;
  /**
   * sm  – small ring, sits inside a button
   * md  – medium ring, used in page-level loading cards
   */
  size?: "sm" | "md";
  className?: string;
};

/**
 * Shared loading indicator — a spinning ring that inherits the current
 * text colour, so it works inside any button style without extra styling.
 *
 * Button usage:
 *   {loading ? <SparkLoader label="Saving…" size="sm" /> : "Save"}
 *
 * Page card usage:
 *   <div className="card text-center py-12 text-orange-400">
 *     <SparkLoader label="Loading wishes…" />
 *   </div>
 */
export default function SparkLoader({ label, size = "md", className = "" }: Props) {
  const ring =
    size === "sm"
      ? "loader-ring w-3.5 h-3.5"   // 14 px — fits neatly inside a button
      : "loader-ring w-5 h-5";       // 20 px — visible in a page card

  const borderWidth = size === "sm" ? "2px" : "2.5px";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className={ring} style={{ borderWidth }} />
      {label && <span>{label}</span>}
    </span>
  );
}
