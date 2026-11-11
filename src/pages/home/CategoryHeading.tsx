/**
 * The heading before each medium's group of works. Its tall, mostly empty
 * block is deliberate spacing between groups. The Music heading follows
 * EpigraphSection, which already provides that space, so the spacing can be
 * overridden through `className`.
 */
export function CategoryHeading({
  name,
  count,
  className = "min-h-[34vh] py-16 md:min-h-[42vh]",
}: {
  name: string;
  count: number;
  className?: string;
}) {
  return (
    <header className={`reveal-fade flex items-end ${className}`}>
      <div className="flex items-baseline gap-4">
        <h2 className="text-title font-light tracking-tight">{name}</h2>
        <span className="font-mono text-caption text-muted tabular-nums">
          {String(count).padStart(2, "0")}
        </span>
      </div>
    </header>
  );
}
