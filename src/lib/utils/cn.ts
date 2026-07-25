import { clsx, type ClassValue } from 'clsx';

/**
 * Merges class names with conditional support.
 * Wraps clsx for consistent class name composition across components.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
