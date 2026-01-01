import type { ReactNode } from "react";

/**
 * Renders inline markdown syntax (e.g. **bold**) into React nodes.
 * Intended for short text fragments, not full documents.
 *
 * @param text - Text containing **bold** markers
 * @returns Array of React nodes with <strong> tags for emphasized text
 *
 * @example
 * renderEmphasis("Hello **world**!") // => ["Hello ", <strong>world</strong>, "!"]
 */
export function renderEmphasis(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}
