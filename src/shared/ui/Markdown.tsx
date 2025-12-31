interface MarkdownProps {
  children: string;
  className?: string;
}

/**
 * Minimal Markdown renderer for bold text (**text**)
 * Used for inline formatting in content strings
 */
export function Markdown({ children, className = "" }: MarkdownProps) {
  const parts = children.split(/(\*\*.*?\*\*)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  );
}
