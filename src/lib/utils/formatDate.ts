/**
 * Format a date to relative time (e.g., "2 min ago") or absolute (e.g., "Jun 12, 09:23").
 * Uses relative format for times within 24 hours, absolute beyond that.
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour}h ago`;

  return formatAbsoluteDate(target);
}

/**
 * Format a date to absolute format: "Jun 12, 09:23"
 */
export function formatAbsoluteDate(date: Date | string): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const month = months[target.getMonth()];
  const day = target.getDate();
  const hours = target.getHours().toString().padStart(2, '0');
  const minutes = target.getMinutes().toString().padStart(2, '0');

  return `${month} ${day}, ${hours}:${minutes}`;
}

/**
 * Format a date to full date: "June 12, 2026"
 */
export function formatFullDate(date: Date | string): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  return target.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
