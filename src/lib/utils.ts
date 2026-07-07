/**
 * Shared utility function for merging Tailwind CSS classes.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(clsx(inputs));
}

export const logger = {
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') console.log(...args);
  },
  error: (...args: unknown[]) => {
    // In production, this would go to a service like Sentry or Datadog
    console.error(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  }
};
