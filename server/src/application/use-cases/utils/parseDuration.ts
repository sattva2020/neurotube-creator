/**
 * Parse a duration string like '15m', '1h', '7d' into milliseconds.
 * Supported units: s (seconds), m (minutes), h (hours), d (days).
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}". Expected format: "15m", "1h", "7d".`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * multipliers[unit];
}
