export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatNumber(n: number): string {
  if (n < 1_000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1_000;
    return `${v.toFixed(v >= 10 ? 0 : 1).replace(/\.0$/, '')}k`;
  }
  const v = n / 1_000_000;
  return `${v.toFixed(v >= 10 ? 0 : 1).replace(/\.0$/, '')}M`;
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return then.toISOString().slice(0, 10);
}
