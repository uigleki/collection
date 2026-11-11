import type { ReactNode } from "react";

/**
 * The why-essay marks its key lines with **strong** emphasis. That is the
 * only Markdown the content uses, so it is all this renders.
 */
export function renderEmphasis(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(part);
    if (m) {
      return (
        <strong key={i} className="font-medium text-tsuki">
          {m[1]}
        </strong>
      );
    }
    return part;
  });
}
