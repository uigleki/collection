import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper conflict resolution
 *
 * @example
 * cn('px-4 py-2', 'px-6') // => 'py-2 px-6' (px-6 overrides px-4)
 * cn('text-red-500', isActive && 'text-blue-500') // conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
