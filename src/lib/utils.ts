/**
 * Shared utility function for merging Tailwind CSS classes.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(clsx(inputs));
}
