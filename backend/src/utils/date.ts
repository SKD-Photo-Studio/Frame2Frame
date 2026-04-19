/**
 * Shared date utility functions.
 */

/**
 * Formats an array of date strings into a single human-readable string.
 */
export function formatDates(dates: string[]): string {
  return (dates ?? [])
    .map((d) =>
      new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    )
    .join(", ");
}
