import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getGameUrl(
  supabaseUrl: string,
  gamePath: string,
  entryFile = 'index.html'
): string {
  return `${supabaseUrl}/storage/v1/object/public/games/${gamePath}/${entryFile}`;
}

// Strip HTML tags and dangerous characters from user-submitted text
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/javascript:/gi, '')       // strip JS protocol
    .replace(/on\w+\s*=/gi, '')        // strip event handlers
    .trim();
}
