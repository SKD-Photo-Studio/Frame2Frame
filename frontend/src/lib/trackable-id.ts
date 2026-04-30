/**
 * Utility to generate trackable, human-readable IDs for various entities.
 */

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")           // Replace & with and
    .replace(/\s+/g, "_")           // Replace spaces with _
    .replace(/[^\w-]+/g, "")         // Remove all non-word chars
    .replace(/--+/g, "_")           // Replace multiple - with single _
    .replace(/__+/g, "_")           // Replace multiple _ with single _
    .replace(/^-+/, "")             // Trim - from start of text
    .replace(/-+$/, "")             // Trim - from end of text
    .replace(/^_/, "")              // Trim _ from start
    .replace(/_$/, "");             // Trim _ from end
}

export function generateTrackableId(type: "client" | "team" | "event" | "payment" | "artist_expense" | "output_expense", data: any): string {
  switch (type) {
    case "client":
      return slugify(data.client_name);
    case "team":
      return slugify(data.full_name);
    case "event":
      return `${slugify(data.client_name)}_${slugify(data.event_type)}`;
    case "payment":
      return `${slugify(data.event_display_id)}_${slugify(data.installment_type || "payment")}`;
    case "artist_expense":
      return `${slugify(data.event_display_id)}_${slugify(data.team_member_name)}`;
    case "output_expense":
      return `${slugify(data.event_display_id)}_${slugify(data.deliverable)}`;
    default:
      return "";
  }
}

/**
 * Checks if a string is a valid UUID
 */
export function isUUID(val: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}
