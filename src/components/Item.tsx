import { useExpand } from "@/context";
import type { Item as ItemType, Line } from "@/data/types";
import { AnimatePresence, motion } from "framer-motion";
import { type KeyboardEvent, useState } from "react";

interface ItemProps {
  item: ItemType;
}

function LineContent({ line }: { line: Line }) {
  if (typeof line === "string") {
    return (
      <span
        className="text-text-secondary"
        dangerouslySetInnerHTML={{ __html: line }}
      />
    );
  }

  return (
    <>
      <span className="text-text font-medium">{line.label}:</span>{" "}
      <span
        className="text-text-secondary"
        dangerouslySetInnerHTML={{ __html: line.text }}
      />
    </>
  );
}

export function Item({ item }: ItemProps) {
  const { expanded } = useExpand();
  const [localExpanded, setLocalExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isExpanded = expanded || localExpanded;
  const hasContent = item.lines && item.lines.length > 0;

  const toggle = () => {
    if (!expanded && hasContent) {
      setLocalExpanded((e) => !e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <motion.div
      className="relative pl-4 py-3"
      style={{
        borderLeftWidth: "2px",
        borderLeftColor: hovered || isExpanded ? item.color : `${item.color}4D`,
        boxShadow: hovered || isExpanded ? `0 0 20px ${item.color}40` : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={toggle}
      onKeyDown={hasContent ? handleKeyDown : undefined}
      role={hasContent ? "button" : undefined}
      tabIndex={hasContent ? 0 : undefined}
      aria-expanded={hasContent ? isExpanded : undefined}
      layout
    >
      <h3 className="text-xl text-text">{item.title}</h3>

      <AnimatePresence>
        {(hovered || isExpanded) && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-text-secondary mt-1"
          >
            {item.preview}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && hasContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            {item.lines?.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <LineContent line={line} />
              </motion.div>
            ))}

            {item.flaws && item.flaws.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-text-muted text-sm mb-2">Shortcomings:</p>
                {item.flaws.map((flaw, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <LineContent line={flaw} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
