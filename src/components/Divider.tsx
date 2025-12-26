import { useExpand } from "@/context";
import { useState } from "react";
import { HoverReveal } from "./HoverReveal";

interface DividerProps {
  symbol?: "start" | "end";
}

export function Divider({ symbol = "start" }: DividerProps) {
  const { expanded, setExpanded } = useExpand();
  const [hovered, setHovered] = useState(false);

  const icon = symbol === "start" ? "✦" : "◇";

  return (
    <div
      className="my-16 cursor-pointer"
      onClick={() => setExpanded((e) => !e)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative px-6 bg-surface">
          <span
            className={`transition-colors ${hovered ? "text-text" : "text-text-muted"}`}
          >
            {icon}
          </span>
        </div>
      </div>
      <HoverReveal show={hovered}>
        <span className="block text-center mt-3 text-sm text-text-secondary">
          {expanded ? "Collapse All" : "Expand All"}
        </span>
      </HoverReveal>
    </div>
  );
}
