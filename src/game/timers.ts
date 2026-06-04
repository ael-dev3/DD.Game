export function secondsRemaining(targetUnixSeconds: number, now = Math.floor(Date.now() / 1000)): number {
  return Math.max(0, targetUnixSeconds - now);
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "ready";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
