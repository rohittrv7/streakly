/**
 * Parses an ISO 8601 duration string returned by YouTube Data API v3.
 * Examples:
 *   - "PT1H2M3S" -> 3723
 *   - "PT45S"    -> 45
 *   - "PT1H"     -> 3600
 *   - "PT2M"     -> 120
 *   - "P1DT2H"   -> 93600
 *   - "P0D"      -> null (live / unknown)
 */
export function parseIsoDuration(durationStr: string | null | undefined): number | null {
  if (!durationStr || typeof durationStr !== "string") return null;
  const str = durationStr.trim();
  if (str === "P0D" || !str.startsWith("P")) return null;

  // Regex matching ISO 8601 Duration components: P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?
  const regex = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
  const match = str.match(regex);
  if (!match) return null;

  const days = parseInt(match[1] || "0", 10);
  const hours = parseInt(match[2] || "0", 10);
  const minutes = parseInt(match[3] || "0", 10);
  const seconds = parseInt(match[4] || "0", 10);

  const total = days * 86400 + hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
}
