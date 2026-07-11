import type { ReactNode } from "react";

/**
 * The why-essay marks its load-bearing lines with **strong** emphasis; that
 * is the only markdown the content uses, so that is all this renders.
 */
export function renderEmphasis(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(part);
    if (m) {
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: static text, stable order
        <strong key={i} className="font-medium text-tsuki">
          {m[1]}
        </strong>
      );
    }
    return part;
  });
}
