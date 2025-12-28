import { useExpand } from "@/context";
import { type KeyboardEvent, useState } from "react";
import { HoverReveal } from "./HoverReveal";

interface DividerProps {
  symbol?: "start" | "end";
}

export function Divider({ symbol = "start" }: DividerProps) {
  const { expanded, setExpanded } = useExpand();
  const [hovered, setHovered] = useState(false);

  const icon = symbol === "start" ? "✦" : "◇";

  const toggle = () => setExpanded((e) => !e);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      className="my-16 cursor-pointer"
      onClick={toggle}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-pressed={expanded}
      aria-label={expanded ? "Collapse all items" : "Expand all items"}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative px-6 bg-background">
          <span
            className={`transition-colors ${hovered ? "text-foreground" : "text-muted-foreground"}`}
          >
            {icon}
          </span>
        </div>
      </div>
      <HoverReveal show={hovered}>
        <span className="block text-center mt-3 text-sm text-muted-foreground">
          {expanded ? "Collapse All" : "Expand All"}
        </span>
      </HoverReveal>
    </div>
  );
}
