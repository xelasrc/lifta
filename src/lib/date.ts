export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function formatRelativeDay(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((startOfNow.getTime() - startOfDate.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Local-time (not UTC) YYYY-MM-DD, matching what an <input type="date"> needs
// and what the rest of the app already uses (toLocaleDateString, month keys).
export function toDateInputValue(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Moves a timestamp to a different calendar day (from an <input type="date">
// value) while keeping its time-of-day, so editing a workout's date doesn't
// also change how long it looked like it lasted.
export function withDate(isoString: string, dateOnly: string): string {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const next = new Date(isoString);
  next.setFullYear(year, month - 1, day);
  return next.toISOString();
}

export function formatDuration(startedAt: string, completedAt: string): string {
  const minutes = Math.max(1, Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}
